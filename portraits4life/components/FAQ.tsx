'use client';

import { useId, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getCopy, localeOf } from '@/lib/copy';
import { routeHref, routes } from '@/content/routes';

// TODO(client): the questions and answers are drafts. Confirm each answer (shipping, preview, refund, file requirements) with the client; see docs/faq-client-review.md. No FAQPage structured data until they are confirmed.
export default function FAQ() {
  const pathname = usePathname();
  const locale = localeOf(pathname);
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const contactRoute = routes.find((route) => route.id === 'contact');
  const contactHref = contactRoute ? routeHref(locale, contactRoute) : `/${locale}#kontakt`;

  const faq = getCopy(locale).faq;

  return (
    <section id="faq" className="section-y bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display heading-xl font-bold text-center mb-16 text-ink">{faq.title}</h2>

        <div className="space-y-4">
          {faq.items.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `${baseId}-answer-${index}`;
            return (
              <div key={index} className="border border-line rounded-lg overflow-hidden">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-canvas hover:bg-surface-muted transition text-left"
                  >
                    <span className="text-lg font-semibold text-ink">{item.question}</span>
                    <svg
                      aria-hidden="true"
                      className={`ml-4 w-6 h-6 shrink-0 text-brand-strong transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </button>
                </h3>
                <div id={panelId} hidden={!isOpen} className="px-6 py-4 bg-surface border-t border-line">
                  <p className="text-copy leading-relaxed">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 p-8 bg-brand-soft rounded-lg border border-brand-edge text-center">
          <p className="text-body">
            {faq.moreQuestions}{' '}
            <a href={contactHref} className="text-brand-strong font-semibold">
              {faq.moreLink}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
