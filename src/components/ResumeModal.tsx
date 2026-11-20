import {Download, X} from 'lucide-react';
import {useEffect} from 'react';

interface ResumeModalProps {
  open: boolean;
  resumeUrl: string;
  onClose: () => void;
}

export function ResumeModal({open, resumeUrl, onClose}: ResumeModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Resume PDF Preview"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Aravintha Krishnan R — Resume
            </h2>
            <p className="text-xs text-slate-500">B.Tech CSE (AI &amp; ML) · Jain University</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={resumeUrl}
              download="Aravintha_Krishnan_R_Resume.pdf"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-blue-700"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Download PDF</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close resume preview"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-100">
          <iframe
            src={resumeUrl}
            title="Aravintha Krishnan R Resume PDF"
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
