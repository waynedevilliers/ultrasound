'use client';

import { useEffect, useRef, useState } from 'react';
import OrderForm from '@/components/OrderForm';
import type { FormatChoice } from '@/lib/format-param';

// The heading, the intro line and the form. After a sent order the heading says thanks and the intro is hidden.
export default function OrderSection({
  title,
  thanksTitle,
  intro,
  initialFormat,
}: {
  title: string;
  thanksTitle: string;
  intro: string;
  initialFormat: FormatChoice | null;
}) {
  // Empty until an order is sent. The live region below is mounted from the start, so the change is announced.
  const [announcement, setAnnouncement] = useState('');
  const sent = announcement !== '';
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Runs after the sent layout is on the page, so the target is not moved by the intro being removed.
  // The offset is the height of the sticky header, so the heading is not hidden behind it.
  useEffect(() => {
    if (!sent) return;
    const heading = headingRef.current;
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

      <h1 ref={headingRef} className="font-display heading-xl font-bold mb-4 text-ink text-center">
        {sent ? thanksTitle : title}
      </h1>

      {!sent && <p className="text-center text-copy mb-12 max-w-2xl mx-auto">{intro}</p>}

      <div className="bg-surface rounded-lg shadow-lg p-8 mb-12">
        <OrderForm initialFormat={initialFormat} onSentChange={setAnnouncement} />
      </div>
    </>
  );
}
