import {AlertCircle, Check, Copy, FileText, Mail, MapPin, Phone, Send} from 'lucide-react';
import {useEffect, useState} from 'react';
import type {InquiryRecord, Profile} from '../types/portfolio';

interface ContactSectionProps {
  profile: Profile;
  onOpenResume: () => void;
}

export function ContactSection({profile, onOpenResume}: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [copiedField, setCopiedField] = useState<'email' | 'phone' | null>(null);
  const [showInbox, setShowInbox] = useState(false);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/contact');
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries ?? []);
      }
    } catch {
      // Ignore silent background refresh errors
    }
  };

  useEffect(() => {
    if (showInbox) {
      void fetchInquiries();
    }
  }, [showInbox]);

  const handleCopy = async (value: string, field: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      // Fallback ignored
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name, email, organization, message}),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not save inquiry.');
      }

      setSubmitSuccess(
        `Thank you, ${data.name}. Your message has been saved to the Python portfolio inbox.`,
      );
      setName('');
      setEmail('');
      setOrganization('');
      setMessage('');
      if (showInbox) {
        void fetchInquiries();
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to submit message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-5">
            <div>
              <p className="text-sm font-medium text-slate-500">Internship Inquiries</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
                Get in Touch
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Open to AI &amp; ML internships, Python engineering opportunities, and collaborative
                student projects in Bengaluru or remote.
              </p>
            </div>

            <div className="divide-y divide-slate-200 border-y border-slate-200 text-sm">
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                  <a
                    href={`mailto:${profile.email}`}
                    className="truncate font-medium text-slate-900 hover:text-blue-600"
                  >
                    {profile.email}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopy(profile.email, 'email')}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedField === 'email' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                  <a
                    href={`tel:${profile.phone.replace(/\s+/g, '')}`}
                    className="font-mono font-medium text-slate-900 tabular-nums hover:text-blue-600"
                  >
                    {profile.phone}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopy(profile.phone, 'phone')}
                  className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedField === 'phone' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 py-4">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                <span className="text-slate-700">{profile.location}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onOpenResume}
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 whitespace-nowrap shrink-0 transition-colors hover:border-slate-400 hover:bg-slate-50 cursor-pointer"
              >
                <FileText className="h-4 w-4" aria-hidden="true" />
                <span>Preview Resume PDF</span>
              </button>

              <a
                href={profile.resumeUrl}
                download="Aravintha_Krishnan_R_Resume.pdf"
                className="inline-flex min-h-[42px] items-center text-sm font-medium text-blue-600 whitespace-nowrap shrink-0 hover:underline hover:underline-offset-4"
              >
                Download PDF
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8"
            >
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <h3 className="font-display text-lg font-semibold text-slate-900">
                  Send an Internship Inquiry
                </h3>
                <button
                  type="button"
                  onClick={() => setShowInbox((v) => !v)}
                  className="text-xs font-medium text-blue-600 hover:underline cursor-pointer whitespace-nowrap shrink-0"
                >
                  {showInbox ? 'Hide Saved Inquiries' : 'View Saved Inquiries'}
                </button>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-medium text-slate-700">
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Nair"
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@company.com"
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="contact-org" className="block text-xs font-medium text-slate-700">
                  Organization / Role (Optional)
                </label>
                <input
                  id="contact-org"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="ML Engineering Team"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="mt-4">
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-medium text-slate-700"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share internship details, project scope, or interview availability…"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {submitError && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess && (
                <div
                  role="status"
                  className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
                  <span>{submitSuccess}</span>
                </div>
              )}

              <div className="mt-5 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-blue-700 disabled:opacity-60 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>{submitting ? 'Sending…' : 'Send Message'}</span>
                </button>
              </div>

              {showInbox && (
                <div className="mt-6 border-t border-slate-200 pt-5">
                  <h4 className="text-xs font-semibold text-slate-600">
                    Recent Saved Inquiries ({inquiries.length})
                  </h4>
                  {inquiries.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">No inquiries submitted yet.</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                      {inquiries.map((inq) => (
                        <li key={inq.id} className="p-3.5 text-sm">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className="font-semibold text-slate-900">{inq.name}</span>
                            <span className="font-mono text-xs text-slate-400">
                              {new Date(inq.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {inq.email}
                            {inq.organization ? ` · ${inq.organization}` : ''}
                          </p>
                          <p className="mt-1.5 text-slate-700">{inq.message}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
