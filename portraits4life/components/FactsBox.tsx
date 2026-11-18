'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { canvasSizes, isDigitalAvailable, lowestPrice } from '@/content/products';
import { deliverySentence } from '@/lib/delivery';
import { formatPrice } from '@/lib/price';
import { getCopy, localeOf } from '@/lib/copy';
import InfoCard from '@/components/InfoCard';
import ActionLink from '@/components/ActionLink';

const icon = (path: string) => (
  <svg
    className="h-6 w-6 text-brand"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// Key facts for a parent at a glance. Prices, sizes and delivery come from content/products.ts.
export default function FactsBox() {
  const pathname = usePathname();
  const locale = localeOf(pathname);
  const copy = getCopy(locale);
  const f = copy.facts;
  const orderHref = `/${locale}/order`;
  // "30 × 30, 40 × 40 oder 50 × 50": the list of sizes, with the word for "or" in the page language.
  const sizes = new Intl.ListFormat(locale === 'de' ? 'de' : 'en', {
    style: 'long',
    type: 'disjunction',
  }).format(canvasSizes.map((size) => `${size.widthCm} × ${size.heightCm}`));

  const facts: { label: string; value: string; icon: ReactNode }[] = [
    {
      label: f.formats,
      value: (isDigitalAvailable() ? f.formatsValue : f.formatsValueCanvas).replace(
        '{sizes}',
        sizes,
      ),
      icon: icon('M21 8l-9-5-9 5m18 0v8l-9 5-9-5V8m18 0l-9 5m0 0L3 8m9 5v8'),
    },
    {
      label: f.price,
      value: f.priceValue.replace('{price}', formatPrice(lowestPrice(), locale)),
      icon: icon('M7 7h.01M7 3h5l9 9a2 2 0 010 2.8l-4.2 4.2a2 2 0 01-2.8 0L5 10V5a2 2 0 012-2z'),
    },
    {
      label: f.delivery,
      value: deliverySentence(locale, f.deliveryValue, f.deliveryValueCanvas),
      icon: icon(
        'M3 7h11v8H3zM14 10h4l3 3v2h-7M7 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
      ),
    },
    {
      label: f.payment,
      value: f.paymentValue,
      icon: icon('M3 10h18M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z'),
    },
    {
      label: f.optional,
      value: f.optionalValue,
      icon: icon('M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z'),
    },
  ];

  return (
    <section aria-label={f.label} className="bg-surface">
      <div className="container-site pt-0 pb-10">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {facts.map((fact) => (
            <InfoCard key={fact.label}>
              <dt className="flex items-center gap-3 text-base font-semibold text-ink">
                <span className="shrink-0">{fact.icon}</span>
                {fact.label}
              </dt>
              <dd className="mt-2 text-base text-copy">{fact.value}</dd>
            </InfoCard>
          ))}
        </dl>
        <div className="mt-8 text-center">
          <ActionLink href={orderHref} variant="secondary">
            {copy.common.orderNow}
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
