#!/usr/bin/env python3
"""Pure Python backend for Aravintha Krishnan R's portfolio website."""

from __future__ import annotations

import argparse
import atexit
import http.client
import json
import math
import mimetypes
import os
import signal
import sqlite3
import subprocess
import sys
import time
import urllib.parse
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

BASE_DIR = Path(__file__).resolve().parent
DIST_DIR = BASE_DIR / "dist"
PUBLIC_DIR = BASE_DIR / "public"
DB_PATH = BASE_DIR / "portfolio.db"

VITE_HOST = "127.0.0.1"
VITE_PORT = 5173

mimetypes.init()
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".mjs")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/pdf", ".pdf")
mimetypes.add_type("image/svg+xml", ".svg")


PORTFOLIO_DATA: dict[str, Any] = {
    "profile": {
        "name": "Aravintha Krishnan R",
        "headline": "Building Practical Machine Learning Fundamentals in Python",
        "role": "B.Tech CSE (AI & ML) Student",
        "location": "Bengaluru, Karnataka, India",
        "phone": "+91 88386 73603",
        "email": "aravinthakrishnan07@gmail.com",
        "resumeUrl": "/assets/aistudio/Aravintha_Krishnan_R_80f471fe.pdf",
        "objective": (
            "Second-year B.Tech Computer Science student specializing in AI & ML, "
            "seeking an internship to apply programming fundamentals, strengthen "
            "practical machine learning skills, and learn through real-world projects."
        ),
    },
    "metrics": [
        {"value": "7.6 / 10", "label": "Current CGPA", "detail": "3rd Semester B.Tech"},
        {"value": "2029", "label": "Expected Graduation", "detail": "Jain University"},
        {"value": "4", "label": "Programming Languages", "detail": "Python, C, C++, Java"},
        {"value": "3", "label": "Spoken Languages", "detail": "English, Tamil, Telugu"},
    ],
    "education": [
        {
            "institution": "Jain University, Bengaluru",
            "program": "B.Tech, Computer Science Engineering (AI & ML)",
            "period": "2025 – 2029 (Expected)",
            "status": "Currently in 3rd semester",
            "score": "CGPA: 7.6 / 10",
        },
        {
            "institution": "Higher Secondary Education",
            "program": "Class XII",
            "period": "Completed",
            "status": "Pre-University",
            "score": "75%",
        },
        {
            "institution": "Secondary Education",
            "program": "Class X",
            "period": "Completed",
            "status": "High School",
            "score": "75%",
        },
    ],
    "skills": [
        {
            "category": "programming",
            "group": "Programming Languages",
            "name": "Python",
            "level": "Intermediate",
            "note": "Primary language for supervised learning workflows and backend logic.",
        },
        {
            "category": "programming",
            "group": "Programming Languages",
            "name": "C",
            "level": "Intermediate",
            "note": "Structured programming, pointers, memory fundamentals, and algorithms.",
        },
        {
            "category": "programming",
            "group": "Programming Languages",
            "name": "C++",
            "level": "Intermediate",
            "note": "Object-oriented programming and standard algorithmic problem solving.",
        },
        {
            "category": "programming",
            "group": "Programming Languages",
            "name": "Java",
            "level": "Intermediate",
            "note": "Class-based object-oriented design and core data structures.",
        },
        {
            "category": "tools",
            "group": "Development Tools",
            "name": "Visual Studio Code",
            "level": "Daily Environment",
            "note": "Primary code editor for Python scripting, debugging, and project work.",
        },
        {
            "category": "languages",
            "group": "Spoken Languages",
            "name": "English, Tamil, Telugu",
            "level": "Multilingual",
            "note": "Clear written and verbal communication across diverse teams.",
        },
        {
            "category": "soft",
            "group": "Core Strengths",
            "name": "Problem-solving & Quick learning",
            "level": "Soft Skill",
            "note": "Breaking down unfamiliar technical concepts into testable steps.",
        },
        {
            "category": "soft",
            "group": "Core Strengths",
            "name": "Teamwork, Adaptability & Time management",
            "level": "Soft Skill",
            "note": "Collaborating reliably while balancing 3rd-semester coursework and projects.",
        },
    ],
    "projects": [
        {
            "id": "linear-regression",
            "title": "Linear Regression Model",
            "stack": "Python · Supervised Learning",
            "status": "In Progress",
            "summary": (
                "Exploring linear regression, a supervised learning technique that "
                "predicts numerical values from input data."
            ),
            "highlights": [
                "Exploring linear regression, a supervised learning technique that predicts numerical values from input data.",
                "Studying how input features relate to an output variable and how a best-fit line is used to make predictions.",
                "Learning the core machine learning workflow: preparing data, training the model, and evaluating predictions.",
            ],
        }
    ],
    "datasets": [
        {
            "id": "study-hours",
            "name": "Study Hours vs. Exam Score",
            "xLabel": "Weekly Study Hours",
            "yLabel": "Exam Score (%)",
            "defaultPredictX": 7.5,
            "points": [
                {"x": 1.5, "y": 46.0},
                {"x": 2.5, "y": 53.0},
                {"x": 3.5, "y": 58.0},
                {"x": 4.5, "y": 66.0},
                {"x": 5.5, "y": 71.0},
                {"x": 6.5, "y": 78.0},
                {"x": 8.0, "y": 86.0},
                {"x": 9.0, "y": 91.0},
            ],
        },
        {
            "id": "compute-scaling",
            "name": "Dataset Size vs. Training Time",
            "xLabel": "Training Samples (k)",
            "yLabel": "Duration (sec)",
            "defaultPredictX": 12.0,
            "points": [
                {"x": 2.0, "y": 3.4},
                {"x": 4.0, "y": 5.8},
                {"x": 6.0, "y": 8.5},
                {"x": 8.0, "y": 11.2},
                {"x": 10.0, "y": 14.1},
                {"x": 14.0, "y": 19.3},
                {"x": 16.0, "y": 21.8},
            ],
        },
    ],
}


def init_db() -> None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS inquiries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                organization TEXT NOT NULL DEFAULT '',
                message TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


def compute_linear_regression(
    raw_points: list[dict[str, Any]], predict_x: float | None = None
) -> dict[str, Any]:
    if not isinstance(raw_points, list) or len(raw_points) < 2:
        raise ValueError("Provide at least 2 valid (x, y) data points.")

    points: list[dict[str, float]] = []
    for item in raw_points:
        if not isinstance(item, dict) or "x" not in item or "y" not in item:
            raise ValueError("Each point must contain numeric 'x' and 'y' values.")
        x_val = float(item["x"])
        y_val = float(item["y"])
        if not (math.isfinite(x_val) and math.isfinite(y_val)):
            raise ValueError("All coordinates must be finite numbers.")
        points.append({"x": x_val, "y": y_val})

    n = len(points)
    mean_x = sum(p["x"] for p in points) / n
    mean_y = sum(p["y"] for p in points) / n

    sxx = sum((p["x"] - mean_x) ** 2 for p in points)
    if sxx == 0:
        raise ValueError("Input X values must vary (cannot all be identical).")

    sxy = sum((p["x"] - mean_x) * (p["y"] - mean_y) for p in points)
    slope = sxy / sxx
    intercept = mean_y - slope * mean_x

    evaluated: list[dict[str, float]] = []
    sq_errors: list[float] = []
    abs_errors: list[float] = []
    ss_tot = 0.0

    for p in points:
        y_hat = slope * p["x"] + intercept
        residual = p["y"] - y_hat
        sq_errors.append(residual ** 2)
        abs_errors.append(abs(residual))
        ss_tot += (p["y"] - mean_y) ** 2
        evaluated.append(
            {
                "x": round(p["x"], 4),
                "y": round(p["y"], 4),
                "predicted": round(y_hat, 4),
                "residual": round(residual, 4),
            }
        )

    mse = sum(sq_errors) / n
    rmse = math.sqrt(mse)
    mae = sum(abs_errors) / n
    r_squared = 1.0 - (sum(sq_errors) / ss_tot) if ss_tot > 0 else 1.0

    min_x = min(p["x"] for p in points)
    max_x = max(p["x"] for p in points)
    span = max(max_x - min_x, 1.0)
    line_start_x = min_x - span * 0.08
    line_end_x = max_x + span * 0.08

    prediction_result = None
    if predict_x is not None:
        px = float(predict_x)
        if not math.isfinite(px):
            raise ValueError("predict_x must be a finite number.")
        prediction_result = {
            "x": round(px, 4),
            "y": round(slope * px + intercept, 4),
        }

    return {
        "engine": f"Python {sys.version.split()[0]} (Ordinary Least Squares)",
        "count": n,
        "slope": round(slope, 6),
        "intercept": round(intercept, 6),
        "meanX": round(mean_x, 4),
        "meanY": round(mean_y, 4),
        "metrics": {
            "rSquared": round(r_squared, 4),
            "mse": round(mse, 4),
            "rmse": round(rmse, 4),
            "mae": round(mae, 4),
        },
        "line": {
            "x1": round(line_start_x, 4),
            "y1": round(slope * line_start_x + intercept, 4),
            "x2": round(line_end_x, 4),
            "y2": round(slope * line_end_x + intercept, 4),
        },
        "prediction": prediction_result,
        "points": evaluated,
    }


class PortfolioHandler(BaseHTTPRequestHandler):
    dev_mode: bool = False
    protocol_version = "HTTP/1.1"

    def log_message(self, format: str, *args: Any) -> None:
        sys.stderr.write(f"[python-backend] {self.address_string()} - {format % args}\n")

    def _send_json(self, status: int, payload: Any) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0 or length > 1_000_000:
            raise ValueError("Invalid request body length.")
        raw = self.rfile.read(length)
        data = json.loads(raw.decode("utf-8"))
        if not isinstance(data, dict):
            raise ValueError("JSON payload must be an object.")
        return data

    def _proxy_to_vite(self) -> None:
        conn = None
        last_err: Exception | None = None
        for _ in range(15):
            try:
                conn = http.client.HTTPConnection(VITE_HOST, VITE_PORT, timeout=10)
                req_headers = {
                    k: v
                    for k, v in self.headers.items()
                    if k.lower() not in {"host", "connection", "accept-encoding"}
                }
                req_headers["Host"] = f"{VITE_HOST}:{VITE_PORT}"
                content_length = int(self.headers.get("Content-Length", "0"))
                body = self.rfile.read(content_length) if content_length > 0 else None
                conn.request(self.command, self.path, body=body, headers=req_headers)
                resp = conn.getresponse()
                resp_body = resp.read()
                self.send_response(resp.status)
                for header_key, header_val in resp.getheaders():
                    if header_key.lower() in {"transfer-encoding", "connection", "content-length"}:
                        continue
                    self.send_header(header_key, header_val)
                self.send_header("Content-Length", str(len(resp_body)))
                self.end_headers()
                if self.command != "HEAD":
                    self.wfile.write(resp_body)
                return
            except (ConnectionRefusedError, OSError) as exc:
                last_err = exc
                time.sleep(0.25)
            finally:
                if conn is not None:
                    conn.close()
        self._send_json(502, {"error": f"Frontend dev server unavailable: {last_err}"})

    def _serve_static(self, req_path: str) -> None:
        clean_path = urllib.parse.unquote(req_path.split("?", 1)[0]).lstrip("/")
        candidates = []
        if clean_path:
            candidates.append((DIST_DIR / clean_path).resolve())
            candidates.append((PUBLIC_DIR / clean_path).resolve())
        else:
            candidates.append((DIST_DIR / "index.html").resolve())

        target: Path | None = None
        for candidate in candidates:
            if (
                (candidate == DIST_DIR or DIST_DIR in candidate.parents or PUBLIC_DIR in candidate.parents)
                and candidate.is_file()
            ):
                target = candidate
                break

        if target is None:
            fallback = (DIST_DIR / "index.html").resolve()
            if fallback.is_file():
                target = fallback
            else:
                self._send_json(404, {"error": "Static build not found. Run npm run build."})
                return

        data = target.read_bytes()
        mime_type, _ = mimetypes.guess_type(str(target))
        self.send_response(200)
        self.send_header("Content-Type", mime_type or "application/octet-stream")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(data)

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/health":
            self._send_json(
                200,
                {
                    "status": "ok",
                    "backend": "python",
                    "pythonVersion": sys.version.split()[0],
                },
            )
            return

        if path == "/api/portfolio":
            self._send_json(200, PORTFOLIO_DATA)
            return

        if path == "/api/contact":
            with sqlite3.connect(DB_PATH) as conn:
                conn.row_factory = sqlite3.Row
                rows = conn.execute(
                    "SELECT id, name, email, organization, message, created_at FROM inquiries ORDER BY id DESC LIMIT 20"
                ).fetchall()
            inquiries = [dict(r) for r in rows]
            self._send_json(200, {"count": len(inquiries), "inquiries": inquiries})
            return

        if self.dev_mode:
            self._proxy_to_vite()
        else:
            self._serve_static(path)

    def do_HEAD(self) -> None:
        self.do_GET()

    def do_POST(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/ml/linear-regression":
            try:
                body = self._read_json_body()
                points = body.get("points", [])
                predict_x = body.get("predict_x", None)
                result = compute_linear_regression(points, predict_x)
                self._send_json(200, result)
            except (ValueError, TypeError, json.JSONDecodeError) as exc:
                self._send_json(400, {"error": str(exc)})
            return

        if path == "/api/contact":
            try:
                body = self._read_json_body()
                name = str(body.get("name", "")).strip()
                email = str(body.get("email", "")).strip()
                organization = str(body.get("organization", "")).strip()
                message = str(body.get("message", "")).strip()

                if len(name) < 2:
                    raise ValueError("Please enter your name (at least 2 characters).")
                if "@" not in email or "." not in email.split("@")[-1]:
                    raise ValueError("Please provide a valid email address.")
                if len(message) < 10:
                    raise ValueError("Please write a brief message (at least 10 characters).")

                created_at = datetime.now(timezone.utc).isoformat()
                with sqlite3.connect(DB_PATH) as conn:
                    cur = conn.execute(
                        "INSERT INTO inquiries (name, email, organization, message, created_at) VALUES (?, ?, ?, ?, ?)",
                        (name, email, organization, message, created_at),
                    )
                    conn.commit()
                    new_id = cur.lastrowid

                self._send_json(
                    201,
                    {
                        "id": new_id,
                        "name": name,
                        "email": email,
                        "organization": organization,
                        "message": message,
                        "created_at": created_at,
                    },
                )
            except (ValueError, json.JSONDecodeError) as exc:
                self._send_json(400, {"error": str(exc)})
            return

        self._send_json(404, {"error": f"Unknown API endpoint: {path}"})


def start_vite_dev() -> subprocess.Popen[bytes]:
    vite_bin = BASE_DIR / "node_modules" / ".bin" / "vite"
    cmd = (
        [str(vite_bin), "--port", str(VITE_PORT), "--host", VITE_HOST]
        if vite_bin.exists()
        else ["npx", "vite", "--port", str(VITE_PORT), "--host", VITE_HOST]
    )
    proc = subprocess.Popen(cmd, cwd=str(BASE_DIR))

    def cleanup() -> None:
        if proc.poll() is None:
            proc.terminate()
            try:
                proc.wait(timeout=3)
            except subprocess.TimeoutExpired:
                proc.kill()

    atexit.register(cleanup)
    return proc


def main() -> None:
    env_port = os.environ.get("DEFAULT_APP_PORT")
    if not env_port:
        port_var = os.environ.get("PORT")
        nginx_port = os.environ.get("NGINX_PORT")
        env_port = port_var if (port_var and port_var != nginx_port) else "3000"

    parser = argparse.ArgumentParser(description="Python portfolio server")
    parser.add_argument("--dev", action="store_true", help="Run with Vite dev middleware proxy")
    parser.add_argument("--port", type=int, default=int(env_port))
    parser.add_argument("--host", type=str, default="0.0.0.0")
    args, _unknown = parser.parse_known_args()

    init_db()
    PortfolioHandler.dev_mode = args.dev

    vite_proc: subprocess.Popen[bytes] | None = None
    if args.dev:
        vite_proc = start_vite_dev()

    ThreadingHTTPServer.allow_reuse_address = True
    server = ThreadingHTTPServer((args.host, args.port), PortfolioHandler)

    def shutdown_handler(_signum: int, _frame: Any) -> None:
        if vite_proc is not None and vite_proc.poll() is None:
            vite_proc.terminate()
        sys.exit(0)

    signal.signal(signal.SIGTERM, shutdown_handler)
    signal.signal(signal.SIGINT, shutdown_handler)

    print(f"Python portfolio backend listening on http://{args.host}:{args.port} (dev={args.dev})", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        if vite_proc is not None and vite_proc.poll() is None:
            vite_proc.terminate()


if __name__ == "__main__":
    main()
