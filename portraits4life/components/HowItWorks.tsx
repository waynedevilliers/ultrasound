'use client';

import { usePathname } from 'next/navigation';
import { getCopy, localeOf } from '@/lib/copy';

export default function HowItWorks() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');

  const { howItWorks } = getCopy(localeOf(pathname));
  const icons = [
    <path key="upload" strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />,
    <path key="edit" strokeLinecap="round" strokeLinejoin="round" d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />,
    <path key="receive" strokeLinecap="round" strokeLinejoin="round" d="M3 8h18v4H3zM5 12v8h14v-8M12 8v12M12 8c-1.5-3-5-4-5-1.5S10.5 8 12 8zm0 0c1.5-3 5-4 5-1.5S13.5 8 12 8z" />,
  ];
  // TODO(client): approve the three step titles and descriptions (DE and EN; the wording is new).
  const steps = howItWorks.steps.map((step, index) => ({ number: index + 1, ...step, icon: icons[index] }));

  return (
    <section id="so-funktionierts" className="section-y bg-canvas">
      <div className="container-site">
        <h2
          className="font-display heading-xl font-bold text-center mb-20 text-ink"
        >
          {howItWorks.title}
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="h-full bg-surface rounded-lg p-8 shadow-sm hover:shadow-md transition">
              <div className="mb-6 flex items-center justify-center w-12 h-12 rounded-full bg-brand-tint">
                <svg className="h-6 w-6 text-brand-strong" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                  {step.icon}
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-ink">
                {step.title}
              </h3>
              <p className="text-copy leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
