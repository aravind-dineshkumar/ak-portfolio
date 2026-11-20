interface HeaderProps {
  name: string;
}

export function Header({name}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
        <a
          href="#top"
          className="font-display text-lg font-semibold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          {name}
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <a
            href="#top"
            className="whitespace-nowrap shrink-0 py-1 hover:text-slate-900 hover:underline hover:underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            Overview
          </a>
          <a
            href="#projects"
            className="whitespace-nowrap shrink-0 py-1 hover:text-slate-900 hover:underline hover:underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            Regression Lab
          </a>
          <a
            href="#education"
            className="whitespace-nowrap shrink-0 py-1 hover:text-slate-900 hover:underline hover:underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            Education
          </a>
          <a
            href="#skills"
            className="whitespace-nowrap shrink-0 py-1 hover:text-slate-900 hover:underline hover:underline-offset-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            Skills
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </header>
  );
}
