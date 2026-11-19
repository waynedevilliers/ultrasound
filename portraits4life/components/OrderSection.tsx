'use client';

import { useEffect, useState, type ReactNode } from 'react';
import OrderForm from '@/components/OrderForm';
import { SUCCESS_HEADING_ID } from '@/components/OrderSuccess';
import type { FormatChoice } from '@/lib/format-param';

// The heading, the intro line and the form. After a sent order only the success message is shown, and the
// children (the information section) are hidden.
export default function OrderSection({
  title,
  intro,
  initialFormat,
  children,
}: {
  title: string;
  intro: string;
  initialFormat: FormatChoice | null;
  children?: ReactNode;
}) {
  // Empty until an order is sent. The live region below is mounted from the start, so the change is announced.
  const [announcement, setAnnouncement] = useState('');
  const sent = announcement !== '';

  // Runs after the sent layout is on the page, so the target is not moved by the intro being removed.
  // The offset is the height of the sticky header, so the heading is not hidden behind it.
  useEffect(() => {
    if (!sent) return;
    const heading = document.getElementById(SUCCESS_HEADING_ID);
    if (!heading) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const header = document.querySelector('header');
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const top = heading.getBoundingClientRect().top + window.scrollY - headerHeight - 24;
    window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  }, [sent]);

  return (
    <>
      <p role="status" className="sr-only">
        {announcement}
      </p>

      {!sent && (
        <>
          <h1 className="font-display heading-xl font-bold mb-4 text-ink text-center">{title}</h1>
          <p className="text-center text-copy mb-12 max-w-2xl mx-auto">{intro}</p>
        </>
      )}

      <div className={`bg-surface rounded-lg shadow-lg mb-12 ${sent ? 'p-6' : 'p-8'}`}>
        <OrderForm initialFormat={initialFormat} onSentChange={setAnnouncement} />
      </div>

      {!sent && children}
    </>
  );
}
