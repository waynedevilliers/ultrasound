'use client';

import { usePathname } from 'next/navigation';
import { getCopy, localeOf } from '@/lib/copy';

// TODO(client): approve the three step titles and descriptions (DE and EN; the wording is new).
// TODO(client): confirm the payment order (paid after the image is checked) before launch.
export default function HowItWorks() {
  const pathname = usePathname();
  const { howItWorks } = getCopy(localeOf(pathname));

  return (
    <section id="so-funktionierts" className="section-y bg-canvas">
      <div className="container-site">
        <h2 className="font-display heading-xl font-bold text-center mb-20 text-ink">{howItWorks.title}</h2>

        <ol className="grid gap-8 md:grid-cols-3">
          {howItWorks.steps.map((step, index) => (
            <li key={step.title} className="h-full bg-surface rounded-lg p-8 shadow-sm hover:shadow-md transition">
              <span
                aria-hidden="true"
                className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-tint font-display text-xl font-bold text-brand-strong"
              >
                {index + 1}
              </span>
              <h3 className="text-xl font-bold mb-3 text-ink">{step.title}</h3>
              <p className="text-base text-copy leading-relaxed">{step.description}</p>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-center text-base text-copy">{howItWorks.paymentNote}</p>
      </div>
    </section>
  );
}
