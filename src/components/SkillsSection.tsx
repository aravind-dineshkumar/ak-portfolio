import {useMemo, useState} from 'react';
import type {SkillItem} from '../types/portfolio';

interface SkillsSectionProps {
  skills: SkillItem[];
}

type FilterKey = 'all' | 'programming' | 'tools-languages' | 'soft';

const FILTERS: {key: FilterKey; label: string}[] = [
  {key: 'all', label: 'All Capabilities'},
  {key: 'programming', label: 'Programming'},
  {key: 'tools-languages', label: 'Tools & Languages'},
  {key: 'soft', label: 'Soft Skills'},
];

export function SkillsSection({skills}: SkillsSectionProps) {
  const [filter, setFilter] = useState<FilterKey>('all');

  const filteredSkills = useMemo(() => {
    if (filter === 'all') return skills;
    if (filter === 'tools-languages') {
      return skills.filter((s) => s.category === 'tools' || s.category === 'languages');
    }
    return skills.filter((s) => s.category === filter);
  }, [skills, filter]);

  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
      <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Technical &amp; Interpersonal</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
            Skills &amp; Toolkit
          </h2>
        </div>

        <div
          role="group"
          aria-label="Filter skills by category"
          className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-slate-200/70 p-1 self-start md:self-auto"
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {filteredSkills.map((skill) => (
          <article
            key={skill.name}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
          >
            <div>
              <p className="text-xs text-slate-500">
                <span>{skill.group}</span>
                <span aria-hidden="true" className="mx-1.5 text-slate-300">
                  ·
                </span>
                <span>{skill.level}</span>
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold text-slate-900">
                {skill.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{skill.note}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
