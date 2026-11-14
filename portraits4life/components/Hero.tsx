'use client';

import Image from 'next/image';
import ActionLink from '@/components/ActionLink';
import { usePathname } from 'next/navigation';
import { getCopy, localeOf } from '@/lib/copy';
import { canvasProduct, lowestPrice } from '@/content/products';
import { formatPrice } from '@/lib/price';

const check = (
  <svg className="h-5 w-5 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// TODO(client): approve the supporting line, the three benefit points and the price line (DE and EN; the EN wording is new).
export default function Hero() {
  const pathname = usePathname();
  const locale = localeOf(pathname);
  const isDE = locale === 'de';
  const { hero } = getCopy(locale);
  const price = formatPrice(lowestPrice(), locale);
  const priceLine = hero.priceLine
    .replace('{price}', price)
    .replace('{weeks}', String(canvasProduct.deliveryWeeksMax));

  return (
    <section className="bg-gradient-to-b from-hero to-surface">
      <div className="container-site section-y pb-6 sm:pb-8 lg:pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="min-w-0">
            <h1 className="font-display heading-hero font-bold mb-6 text-ink leading-tight">
              {hero.headline}
            </h1>

            <p className="text-[1.125rem] min-[600px]:text-[1.25rem] text-body leading-relaxed max-w-[640px] mb-6">
              {hero.supporting}
            </p>

            <ul className="mb-8 space-y-2">
              {hero.benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-base text-body">
                  {check}
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <ActionLink href={isDE ? '/de/order' : '/en/order'} variant="primary">
                {hero.cta_order}
              </ActionLink>
              <ActionLink href={isDE ? '/de#beispiele' : '/en#beispiele'} variant="secondary">
                {hero.cta_examples}
              </ActionLink>
            </div>

            <p className="text-base text-copy">{priceLine}</p>
          </div>

          <div className="relative h-96 lg:h-96 min-w-0">
            <Image
              src="/images/ultrasound2.avif"
              alt={hero.imageAlt}
              fill
              className="object-cover rounded-lg shadow-lg"
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
