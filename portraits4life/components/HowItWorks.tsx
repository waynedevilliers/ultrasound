'use client';

import { usePathname } from 'next/navigation';
import { getCopy, localeOf } from '@/lib/copy';

export default function HowItWorks() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');

  const { howItWorks } = getCopy(localeOf(pathname));
  const steps = howItWorks.steps.map((step, index) => ({ number: index + 1, ...step }));

  return (
    <section className="section-y bg-canvas">
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
                <span className="text-xl font-bold text-brand-strong">{step.number}</span>
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
