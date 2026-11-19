'use client';

import { useId, useState, type ReactNode } from 'react';

export type AccordionEntry = { question: string; content: ReactNode };

// The one accordion of the site (FAQ and the order information): one entry open at a time, each
// heading is a button that shows or hides its panel, and the chevron turns when open.
export default function Accordion({ items }: { items: AccordionEntry[] }) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
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
                  className={`ml-4 w-6 h-6 shrink-0 text-brand-strong transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
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
              </button>
            </h3>
            <div
              id={panelId}
              hidden={!isOpen}
              className="px-6 py-4 bg-surface border-t border-line"
            >
              {item.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
