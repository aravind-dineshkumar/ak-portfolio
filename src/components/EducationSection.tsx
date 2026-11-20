import type {EducationItem} from '../types/portfolio';

interface EducationSectionProps {
  education: EducationItem[];
}

export function EducationSection({education}: EducationSectionProps) {
  return (
    <section id="education" className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-sm font-medium text-slate-500">Academic Record</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
              Education
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Foundational coursework in computer science, programming languages, and artificial
              intelligence &amp; machine learning.
            </p>
          </div>

          <div className="lg:col-span-8">
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {education.map((edu) => (
                <article
                  key={`${edu.institution}-${edu.program}`}
                  className="flex flex-col gap-3 py-6 sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-900">
                      {edu.institution}
                    </h3>
                    <p className="mt-1 text-sm text-slate-700">{edu.program}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      <span>{edu.period}</span>
                      <span aria-hidden="true" className="mx-2 text-slate-300">
                        ·
                      </span>
                      <span>{edu.status}</span>
                    </p>
                  </div>

                  <div className="font-mono text-base font-semibold text-slate-900 tabular-nums shrink-0">
                    {edu.score}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
