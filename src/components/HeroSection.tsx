import {ArrowUpRight, FileText} from 'lucide-react';
import type {Profile, SnapshotMetric} from '../types/portfolio';

interface HeroSectionProps {
  profile: Profile;
  metrics: SnapshotMetric[];
  onOpenResume: () => void;
}

export function HeroSection({profile, metrics, onOpenResume}: HeroSectionProps) {
  return (
    <section id="top" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch">
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <p className="text-sm font-medium text-slate-500">
                <span>{profile.role}</span>
                <span aria-hidden="true" className="mx-2 text-slate-300">
                  ·
                </span>
                <span>{profile.location}</span>
              </p>

              <h1 className="mt-4 max-w-2xl font-display text-[clamp(2.25rem,4.2vw,3.5rem)] font-bold leading-[1.08] tracking-tight text-slate-900">
                {profile.headline}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-[17px]">
                {profile.objective}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={onOpenResume}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span>View Resume PDF</span>
              </button>

              <a
                href="#projects"
                className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-slate-900 whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
              >
                <span>Explore Python Regression Lab</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <aside
              aria-label="Candidate profile dossier"
              className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-7"
            >
              <div>
                <div className="flex items-baseline justify-between gap-4 border-b border-slate-200 pb-4">
                  <h2 className="font-display text-lg font-semibold text-slate-900">
                    Candidate Profile
                  </h2>
                  <span className="text-xs font-medium text-slate-500">
                    Internship Seeker
                  </span>
                </div>

                <dl className="mt-4 divide-y divide-slate-200/80 text-sm">
                  <div className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-slate-500">Institution</dt>
                    <dd className="text-right font-medium text-slate-900">
                      Jain University, Bengaluru
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-slate-500">Specialization</dt>
                    <dd className="text-right font-medium text-slate-900">
                      CSE (AI &amp; ML)
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-slate-500">Core Stack</dt>
                    <dd className="text-right font-medium text-slate-900">
                      Python, C, C++, Java
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-slate-500">Editor</dt>
                    <dd className="text-right font-medium text-slate-900">
                      Visual Studio Code
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="text-slate-500">Languages</dt>
                    <dd className="text-right font-medium text-slate-900">
                      English, Tamil, Telugu
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-5 border-t border-slate-200 pt-4 text-xs text-slate-500 flex items-center justify-between gap-4">
                <span className="truncate">{profile.email}</span>
                <span className="font-mono tabular-nums shrink-0">{profile.phone}</span>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50/70">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-y divide-slate-200 sm:divide-y-0 sm:divide-x lg:grid-cols-4">
          {metrics.map((item) => (
            <div key={item.label} className="px-6 py-6">
              <div className="font-mono text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">
                {item.value}
              </div>
              <div className="mt-1 text-sm font-medium text-slate-800">{item.label}</div>
              <div className="mt-0.5 text-xs text-slate-500">{item.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
