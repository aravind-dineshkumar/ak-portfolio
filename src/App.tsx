/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {AlertCircle, RefreshCw} from 'lucide-react';
import {useCallback, useEffect, useState} from 'react';
import {ContactSection} from './components/ContactSection';
import {EducationSection} from './components/EducationSection';
import {Header} from './components/Header';
import {HeroSection} from './components/HeroSection';
import {RegressionLab} from './components/RegressionLab';
import {ResumeModal} from './components/ResumeModal';
import {SkillsSection} from './components/SkillsSection';
import type {PortfolioData} from './types/portfolio';

export default function App() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeOpen, setResumeOpen] = useState<boolean>(false);

  const loadPortfolio = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/portfolio');
      if (!res.ok) {
        throw new Error(`Python backend returned status ${res.status}`);
      }
      const json = (await res.json()) as PortfolioData;
      setData(json);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load portfolio data from Python server.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPortfolio();
  }, [loadPortfolio]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="font-display text-lg font-semibold text-slate-900">
            Loading Portfolio
          </div>
          <p className="mt-1 text-sm text-slate-500">Fetching profile data from Python backend…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-600" aria-hidden="true" />
          <h1 className="mt-4 font-display text-xl font-semibold text-slate-900">
            Backend Connection Error
          </h1>
          <p className="mt-2 text-sm text-slate-600">{error ?? 'No portfolio data returned.'}</p>
          <button
            type="button"
            onClick={() => void loadPortfolio()}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const featuredProject = data.projects[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header name={data.profile.name} />

      <main>
        <HeroSection
          profile={data.profile}
          metrics={data.metrics}
          onOpenResume={() => setResumeOpen(true)}
        />

        {featuredProject && (
          <RegressionLab project={featuredProject} datasets={data.datasets} />
        )}

        <EducationSection education={data.education} />

        <SkillsSection skills={data.skills} />

        <ContactSection
          profile={data.profile}
          onOpenResume={() => setResumeOpen(true)}
        />
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span>© {new Date().getFullYear()} {data.profile.name}</span>
            <span aria-hidden="true" className="mx-2 text-slate-300">
              ·
            </span>
            <span>{data.profile.location}</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#top" className="hover:text-slate-900">
              Top
            </a>
            <a href="#projects" className="hover:text-slate-900">
              Regression Lab
            </a>
            <a
              href={data.profile.resumeUrl}
              download="Aravintha_Krishnan_R_Resume.pdf"
              className="hover:text-slate-900"
            >
              Resume PDF
            </a>
          </div>
        </div>
      </footer>

      <ResumeModal
        open={resumeOpen}
        resumeUrl={data.profile.resumeUrl}
        onClose={() => setResumeOpen(false)}
      />
    </div>
  );
}
