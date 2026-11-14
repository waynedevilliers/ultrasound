'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { routeHref, routes } from '@/content/routes';

export default function FAQ() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const contactRoute = routes.find((route) => route.id === 'contact');
  const contactHref = contactRoute ? routeHref(isDE ? 'de' : 'en', contactRoute) : '#contact';

  const faqItems = isDE ? [
    {
      question: 'Wie lange dauert die Bearbeitung?',
      answer: 'Die digitale Bearbeitung dauert normalerweise 1 Woche. Der Leinwanddruck dauert 1-2 Wochen nach Bestätigung.',
    },
    {
      question: 'Welche Bildformate akzeptieren Sie?',
      answer: 'Wir akzeptieren JPG, PNG und andere gängige Bildformate. High-Resolution-Bilder (mindestens 300dpi) geben die besten Ergebnisse.',
    },
    {
      question: 'Kann ich das Bild vor dem Druck überprüfen?',
      answer: 'Ja! Wir senden dir einen Vorschau vor der endgültigen Produktion. Du kannst Änderungen anfordern, wenn nötig.',
    },
    {
      question: 'Wie sind die Versandkosten?',
      answer: 'Die Versandkosten hängen von deinem Standort ab. Sie werden vor der Zahlung klar angezeigt.',
    },
    {
      question: 'Was ist, wenn mir das Endergebnis nicht gefällt?',
      answer: 'Wenn du mit dem Ergebnis nicht zufrieden bist, können wir Anpassungen vornehmen oder die Bestellung erstatten.',
    },
  ] : [
    {
      question: 'How long does the artwork take?',
      answer: 'Digital artwork typically takes 1 week. Canvas prints take 1-2 weeks from confirmation.',
    },
    {
      question: 'What image formats do you accept?',
      answer: 'We accept JPG, PNG and other common image formats. High-resolution images (at least 300dpi) produce the best results.',
    },
    {
      question: 'Can I review the image before printing?',
      answer: 'Yes! We send you a preview before final production. You can request changes if needed.',
    },
    {
      question: 'What are the shipping costs?',
      answer: 'Shipping costs depend on your location. They will be clearly shown before payment.',
    },
    {
      question: 'What if I\'m not satisfied with the result?',
      answer: 'If you\'re not happy with the result, we can make adjustments or offer a refund.',
    },
  ];

  return (
    <section className="section-y bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="font-display heading-xl font-bold text-center mb-16 text-ink"
        >
          {isDE ? 'Häufig gestellte Fragen' : 'Frequently Asked Questions'}
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
            {isDE ? (
              <>
                Noch Fragen? <a href={contactHref} className="text-brand-strong font-semibold hover:text-brand-strong">Kontaktiere uns</a>
              </>
            ) : (
              <>
                More questions? <a href={contactHref} className="text-brand-strong font-semibold hover:text-brand-strong">Get in touch</a>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
