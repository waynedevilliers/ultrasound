'use client';

import { useState } from 'react';
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
  const [sent, setSent] = useState(false);
  return (
    <>
      <h1 className="font-display heading-xl font-bold mb-4 text-ink text-center">
        {sent ? thanksTitle : title}
      </h1>

      {!sent && <p className="text-center text-copy mb-12 max-w-2xl mx-auto">{intro}</p>}

      <div className="bg-surface rounded-lg shadow-lg p-8 mb-12">
        <OrderForm initialFormat={initialFormat} onSentChange={setSent} />
      </div>
    </>
  );
}
