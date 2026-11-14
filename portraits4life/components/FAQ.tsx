'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { getCopy, localeOf } from '@/lib/copy';
import { routeHref, routes } from '@/content/routes';

export default function FAQ() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const contactRoute = routes.find((route) => route.id === 'contact');
  const contactHref = contactRoute ? routeHref(isDE ? 'de' : 'en', contactRoute) : '#contact';

  const faq = getCopy(localeOf(pathname)).faq;
  const faqItems = faq.items;

  return (
    <section className="section-y bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="font-display heading-xl font-bold text-center mb-16 text-ink"
        >
          {faq.title}
        </h2>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="border border-line rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between bg-canvas hover:bg-surface-muted transition"
              >
                <h3 className="text-lg font-semibold text-ink text-left">
                  {item.question}
                </h3>
                <div className="flex-shrink-0 ml-4">
                  <svg
                    className={`w-6 h-6 text-brand-strong transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              </button>
              {openIndex === index && (
                <div className="px-6 py-4 bg-surface border-t border-line">
                  <p className="text-copy leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-brand-soft rounded-lg border border-brand-edge text-center">
          <p className="text-body">
            {faq.moreQuestions}{' '}<a href={contactHref} className="text-brand-strong font-semibold hover:text-brand-strong">{faq.moreLink}</a>
          </p>
        </div>
      </div>
    </section>
  );
}
