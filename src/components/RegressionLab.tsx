import {AlertCircle, Plus, RotateCcw, Trash2} from 'lucide-react';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {
  DataPoint,
  DatasetPreset,
  ProjectItem,
  RegressionResponse,
} from '../types/portfolio';

interface RegressionLabProps {
  project: ProjectItem;
  datasets: DatasetPreset[];
}

const SVG_WIDTH = 620;
const SVG_HEIGHT = 360;
const PAD = {top: 28, right: 28, bottom: 48, left: 56};

export function RegressionLab({project, datasets}: RegressionLabProps) {
  const initialDataset = datasets[0];
  const [selectedId, setSelectedId] = useState<string>(initialDataset?.id ?? 'study-hours');
  const activePreset = useMemo(
    () => datasets.find((d) => d.id === selectedId) ?? initialDataset,
    [datasets, selectedId, initialDataset],
  );

  const [points, setPoints] = useState<DataPoint[]>(() => activePreset?.points ?? []);
  const [predictX, setPredictX] = useState<number>(() => activePreset?.defaultPredictX ?? 7.5);
  const [showResiduals, setShowResiduals] = useState<boolean>(true);
  const [result, setResult] = useState<RegressionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [manualX, setManualX] = useState<string>('7');
  const [manualY, setManualY] = useState<string>('80');

  const svgRef = useRef<SVGSVGElement | null>(null);

  const runPythonRegression = useCallback(
    async (pts: DataPoint[], px: number) => {
      if (pts.length < 2) {
        setError('At least 2 data points are required to fit a linear regression line.');
        setResult(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/ml/linear-regression', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({points: pts, predict_x: px}),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to compute linear regression in Python.');
        }
        setResult(data as RegressionResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to reach Python regression API.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void runPythonRegression(points, predictX);
  }, [points, predictX, runPythonRegression]);

  const handleSelectDataset = (preset: DatasetPreset) => {
    setSelectedId(preset.id);
    setPoints(preset.points);
    setPredictX(preset.defaultPredictX);
  };

  const handleReset = () => {
    if (!activePreset) return;
    setPoints(activePreset.points);
    setPredictX(activePreset.defaultPredictX);
  };

  const bounds = useMemo(() => {
    const xs = [...points.map((p) => p.x), predictX];
    const ys = [...points.map((p) => p.y)];
    if (result?.prediction) {
      ys.push(result.prediction.y);
    }
    const rawMinX = xs.length ? Math.min(...xs) : 0;
    const rawMaxX = xs.length ? Math.max(...xs) : 10;
    const rawMinY = ys.length ? Math.min(...ys) : 0;
    const rawMaxY = ys.length ? Math.max(...ys) : 100;

    const spanX = Math.max(rawMaxX - rawMinX, 2);
    const spanY = Math.max(rawMaxY - rawMinY, 5);

    return {
      minX: Math.floor((rawMinX - spanX * 0.12) * 10) / 10,
      maxX: Math.ceil((rawMaxX + spanX * 0.12) * 10) / 10,
      minY: Math.floor((rawMinY - spanY * 0.14) * 10) / 10,
      maxY: Math.ceil((rawMaxY + spanY * 0.14) * 10) / 10,
    };
  }, [points, predictX, result]);

  const plotW = SVG_WIDTH - PAD.left - PAD.right;
  const plotH = SVG_HEIGHT - PAD.top - PAD.bottom;

  const toSvgX = useCallback(
    (x: number) => PAD.left + ((x - bounds.minX) / Math.max(bounds.maxX - bounds.minX, 1e-6)) * plotW,
    [bounds, plotW],
  );
  const toSvgY = useCallback(
    (y: number) =>
      PAD.top + plotH - ((y - bounds.minY) / Math.max(bounds.maxY - bounds.minY, 1e-6)) * plotH,
    [bounds, plotH],
  );

  const handlePlotClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = SVG_WIDTH / rect.width;
    const scaleY = SVG_HEIGHT / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    if (
      clickX < PAD.left ||
      clickX > SVG_WIDTH - PAD.right ||
      clickY < PAD.top ||
      clickY > SVG_HEIGHT - PAD.bottom
    ) {
      return;
    }

    const dataX = bounds.minX + ((clickX - PAD.left) / plotW) * (bounds.maxX - bounds.minX);
    const dataY =
      bounds.minY + ((PAD.top + plotH - clickY) / plotH) * (bounds.maxY - bounds.minY);

    setPoints((prev) => [
      ...prev,
      {x: Number(dataX.toFixed(2)), y: Number(dataY.toFixed(2))},
    ]);
  };

  const handleRemovePoint = (idx: number) => {
    setPoints((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddManualPoint = (e: React.FormEvent) => {
    e.preventDefault();
    const xVal = Number(manualX);
    const yVal = Number(manualY);
    if (!Number.isFinite(xVal) || !Number.isFinite(yVal)) {
      setError('Enter valid numeric X and Y values.');
      return;
    }
    setPoints((prev) => [...prev, {x: xVal, y: yVal}]);
  };

  const xTicks = useMemo(() => {
    const count = 5;
    const step = (bounds.maxX - bounds.minX) / count;
    return Array.from({length: count + 1}, (_, i) => Number((bounds.minX + step * i).toFixed(1)));
  }, [bounds]);

  const yTicks = useMemo(() => {
    const count = 4;
    const step = (bounds.maxY - bounds.minY) / count;
    return Array.from({length: count + 1}, (_, i) => Number((bounds.minY + step * i).toFixed(1)));
  }, [bounds]);

  const signStr = result && result.intercept >= 0 ? '+' : '−';
  const absIntercept = result ? Math.abs(result.intercept).toFixed(3) : '0.000';

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            <span>Featured Project</span>
            <span aria-hidden="true" className="mx-2 text-slate-300">
              ·
            </span>
            <span>{project.stack}</span>
            <span aria-hidden="true" className="mx-2 text-slate-300">
              ·
            </span>
            <span>{project.status}</span>
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
            {project.title}
          </h2>
        </div>

        <p className="text-sm text-slate-600 max-w-md">
          Interactive Ordinary Least Squares workbench computed live by the Python backend.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
        {/* Left: Project Narrative & Python Metrics */}
        <div className="space-y-8 lg:col-span-5">
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-slate-900">
              Core Machine Learning Workflow
            </h3>
            <ol className="divide-y divide-slate-200 border-y border-slate-200">
              {project.highlights.map((item, idx) => (
                <li key={idx} className="flex gap-4 py-4 text-sm leading-relaxed text-slate-600">
                  <span className="font-mono text-xs font-semibold text-blue-600 tabular-nums pt-0.5 shrink-0">
                    0{idx + 1}.
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <h3 className="font-display text-base font-semibold text-slate-900">
                Fitted Model Summary
              </h3>
              <span className="text-xs font-medium text-slate-500">
                {loading ? 'Calculating…' : result ? `${result.count} observations` : 'Ready'}
              </span>
            </div>

            {error ? (
              <div
                role="alert"
                className="mt-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                <span>{error}</span>
              </div>
            ) : result ? (
              <div className="mt-4 space-y-5">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="text-xs font-medium text-slate-500">
                    Best-Fit Regression Equation
                  </div>
                  <div className="mt-1 font-mono text-lg font-semibold text-slate-900 tabular-nums">
                    ŷ = {result.slope.toFixed(3)}x {signStr} {absIntercept}
                  </div>
                </div>

                <dl className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200/80 p-3.5">
                    <dt className="text-xs text-slate-500">R² Goodness of Fit</dt>
                    <dd className="mt-1 font-mono text-xl font-semibold text-slate-900 tabular-nums">
                      {result.metrics.rSquared.toFixed(4)}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 p-3.5">
                    <dt className="text-xs text-slate-500">RMSE</dt>
                    <dd className="mt-1 font-mono text-xl font-semibold text-slate-900 tabular-nums">
                      {result.metrics.rmse.toFixed(3)}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 p-3.5">
                    <dt className="text-xs text-slate-500">Mean Absolute Error</dt>
                    <dd className="mt-1 font-mono text-base font-medium text-slate-800 tabular-nums">
                      {result.metrics.mae.toFixed(3)}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 p-3.5">
                    <dt className="text-xs text-slate-500">Mean Squared Error</dt>
                    <dd className="mt-1 font-mono text-base font-medium text-slate-800 tabular-nums">
                      {result.metrics.mse.toFixed(3)}
                    </dd>
                  </div>
                </dl>

                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <label
                      htmlFor="predict-x-slider"
                      className="text-sm font-medium text-slate-800"
                    >
                      Predict Output for Input X
                    </label>
                    <span className="font-mono text-sm font-semibold text-blue-600 tabular-nums">
                      x = {predictX.toFixed(1)} → ŷ ={' '}
                      {result.prediction ? result.prediction.y.toFixed(2) : '—'}
                    </span>
                  </div>
                  <input
                    id="predict-x-slider"
                    type="range"
                    min={Math.min(0, Math.floor(bounds.minX))}
                    max={Math.ceil(bounds.maxX + 2)}
                    step={0.5}
                    value={predictX}
                    onChange={(e) => setPredictX(Number(e.target.value))}
                    className="mt-3 w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right: Interactive Scatter Plot & Dataset Controls */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div
              role="group"
              aria-label="Sample datasets"
              className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1"
            >
              {datasets.map((ds) => {
                const active = ds.id === activePreset?.id;
                return (
                  <button
                    key={ds.id}
                    type="button"
                    onClick={() => handleSelectDataset(ds)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {ds.name}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowResiduals((v) => !v)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  showResiduals
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                }`}
              >
                {showResiduals ? 'Hide Residuals' : 'Show Residuals'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-slate-50 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Click anywhere inside the plot grid to add a custom data point and recalculate the
            Python OLS model.
          </p>

          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/80 bg-slate-50/50">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              onClick={handlePlotClick}
              role="img"
              aria-label="Interactive scatter plot and linear regression best-fit line"
              className="h-auto w-full cursor-crosshair select-none"
            >
              {/* Grid lines */}
              {yTicks.map((tick) => {
                const yPos = toSvgY(tick);
                return (
                  <g key={`y-${tick}`}>
                    <line
                      x1={PAD.left}
                      y1={yPos}
                      x2={SVG_WIDTH - PAD.right}
                      y2={yPos}
                      stroke="#E2E8F0"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={PAD.left - 10}
                      y={yPos + 4}
                      textAnchor="end"
                      className="fill-slate-500 font-mono text-[11px]"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {xTicks.map((tick) => {
                const xPos = toSvgX(tick);
                return (
                  <g key={`x-${tick}`}>
                    <line
                      x1={xPos}
                      y1={PAD.top}
                      x2={xPos}
                      y2={SVG_HEIGHT - PAD.bottom}
                      stroke="#E2E8F0"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={xPos}
                      y={SVG_HEIGHT - PAD.bottom + 18}
                      textAnchor="middle"
                      className="fill-slate-500 font-mono text-[11px]"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* Axes */}
              <line
                x1={PAD.left}
                y1={SVG_HEIGHT - PAD.bottom}
                x2={SVG_WIDTH - PAD.right}
                y2={SVG_HEIGHT - PAD.bottom}
                stroke="#94A3B8"
                strokeWidth={1.2}
              />
              <line
                x1={PAD.left}
                y1={PAD.top}
                x2={PAD.left}
                y2={SVG_HEIGHT - PAD.bottom}
                stroke="#94A3B8"
                strokeWidth={1.2}
              />

              {/* Axis labels */}
              <text
                x={PAD.left + plotW / 2}
                y={SVG_HEIGHT - 10}
                textAnchor="middle"
                className="fill-slate-600 text-[12px] font-medium"
              >
                {activePreset?.xLabel ?? 'Input Feature (X)'}
              </text>
              <text
                x={16}
                y={PAD.top + plotH / 2}
                textAnchor="middle"
                transform={`rotate(-90 16 ${PAD.top + plotH / 2})`}
                className="fill-slate-600 text-[12px] font-medium"
              >
                {activePreset?.yLabel ?? 'Target Output (Y)'}
              </text>

              {/* Residual lines */}
              {showResiduals &&
                result?.points.map((pt, i) => (
                  <line
                    key={`res-${i}`}
                    x1={toSvgX(pt.x)}
                    y1={toSvgY(pt.y)}
                    x2={toSvgX(pt.x)}
                    y2={toSvgY(pt.predicted)}
                    stroke="#94A3B8"
                    strokeWidth={1.25}
                    strokeDasharray="4 3"
                  />
                ))}

              {/* Best-fit line */}
              {result && (
                <line
                  x1={toSvgX(result.line.x1)}
                  y1={toSvgY(result.line.y1)}
                  x2={toSvgX(result.line.x2)}
                  y2={toSvgY(result.line.y2)}
                  stroke="#2563EB"
                  strokeWidth={2.5}
                />
              )}

              {/* Predicted target marker */}
              {result?.prediction && (
                <g>
                  <line
                    x1={toSvgX(result.prediction.x)}
                    y1={SVG_HEIGHT - PAD.bottom}
                    x2={toSvgX(result.prediction.x)}
                    y2={toSvgY(result.prediction.y)}
                    stroke="#2563EB"
                    strokeWidth={1}
                    strokeDasharray="2 3"
                    opacity={0.6}
                  />
                  <circle
                    cx={toSvgX(result.prediction.x)}
                    cy={toSvgY(result.prediction.y)}
                    r={6}
                    fill="#FFFFFF"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                  />
                </g>
              )}

              {/* Observed data points */}
              {points.map((pt, i) => (
                <circle
                  key={`pt-${i}`}
                  cx={toSvgX(pt.x)}
                  cy={toSvgY(pt.y)}
                  r={5}
                  fill="#0F172A"
                  stroke="#FFFFFF"
                  strokeWidth={1.5}
                />
              ))}
            </svg>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-5">
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-900" />
                Observed Point
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-0.5 w-4 bg-blue-600" />
                Best-Fit Line
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-blue-600 bg-white" />
                Predicted Point (ŷ)
              </span>
            </div>
          </div>

          {/* Add custom point + compact points list */}
          <form onSubmit={handleAddManualPoint} className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="manual-x" className="block text-xs font-medium text-slate-600">
                Add X
              </label>
              <input
                id="manual-x"
                type="number"
                step="any"
                value={manualX}
                onChange={(e) => setManualX(e.target.value)}
                className="mt-1 w-24 rounded-lg border border-slate-200 px-3 py-1.5 font-mono text-sm text-slate-900 tabular-nums focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="manual-y" className="block text-xs font-medium text-slate-600">
                Add Y
              </label>
              <input
                id="manual-y"
                type="number"
                step="any"
                value={manualY}
                onChange={(e) => setManualY(e.target.value)}
                className="mt-1 w-24 rounded-lg border border-slate-200 px-3 py-1.5 font-mono text-sm text-slate-900 tabular-nums focus:border-blue-600 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-medium text-white whitespace-nowrap shrink-0 transition-colors hover:bg-blue-600 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add Point</span>
            </button>
          </form>

          {points.length > 0 && (
            <div className="mt-5 max-h-40 overflow-y-auto rounded-xl border border-slate-200/80">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2 font-medium">#</th>
                    <th className="px-3 py-2 font-medium">X</th>
                    <th className="px-3 py-2 font-medium">Y</th>
                    <th className="px-3 py-2 font-medium">Predicted ŷ</th>
                    <th className="px-3 py-2 font-medium">Residual</th>
                    <th className="px-3 py-2 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums text-slate-700">
                  {points.map((pt, i) => {
                    const evalPt = result?.points[i];
                    return (
                      <tr key={`${pt.x}-${pt.y}-${i}`} className="hover:bg-slate-50/70">
                        <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                        <td className="px-3 py-2">{pt.x}</td>
                        <td className="px-3 py-2">{pt.y}</td>
                        <td className="px-3 py-2 text-blue-700">
                          {evalPt ? evalPt.predicted.toFixed(2) : '—'}
                        </td>
                        <td className="px-3 py-2">
                          {evalPt ? evalPt.residual.toFixed(2) : '—'}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemovePoint(i)}
                            aria-label={`Remove point ${i + 1}`}
                            className="inline-flex items-center justify-center rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
