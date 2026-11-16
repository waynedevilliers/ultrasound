'use client';

import Image from 'next/image';
import ActionLink from '@/components/ActionLink';
import { usePathname } from 'next/navigation';
import { getCopy, localeOf } from '@/lib/copy';
import { lowestPrice } from '@/content/products';
import { formatPrice } from '@/lib/price';

const check = (
  <svg className="h-5 w-5 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// TODO(client): approve the supporting line, the three benefit points and the price line (DE and EN; the EN wording is new).
// TODO(client): benefit point 1 now reads "individuell künstlerisch gestaltet" / "individually designed as a piece of art" (digital work, no manual claim); approve the wording.
// Phones: headline, supporting line, order button, price line, image, benefit points, examples button.
// Desktop: text column on the left (headline, supporting line, benefits, buttons, price), image on the right.
export default function Hero() {
  const pathname = usePathname();
  const locale = localeOf(pathname);
  const isDE = locale === 'de';
  const { hero } = getCopy(locale);
  const priceLine = hero.priceLine.replace('{price}', formatPrice(lowestPrice(), locale));

  // Earlier phone layout, kept as an option and NOT in use (commented out).
  // Order on phones: headline, supporting line, benefit points, buttons, price line, image.
  // The live layout below (mobile step M3) puts the order button and the image higher on phones.
  // Desktop is the same in both. To switch back: delete the live return, uncomment the block,
  // and set the .heading-hero lower bound in app/globals.css back to 2.5rem.
  /*
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
              <div id="hero-order" className="inline-flex">
                <ActionLink href={isDE ? '/de/order' : '/en/order'} variant="primary">
                  {hero.cta_order}
                </ActionLink>
                </div>
              <ActionLink href={isDE ? '/de#beispiele' : '/en#beispiele'} variant="secondary">
                {hero.cta_examples}
              </ActionLink>
            </div>

            <p className="text-base text-copy">{priceLine}</p>
          </div>

          <div className="relative h-96 lg:h-96 min-w-0">
            <Image
              src="/images/artwork/ultrasound2.avif"
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
  */

  return (
    <section className="bg-gradient-to-b from-hero to-surface">
      <div className="container-site section-y pb-6 sm:pb-8 lg:pb-12">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 lg:items-center">
          {/* On phones this column is transparent, so its items can be ordered with the image. */}
          <div className="min-w-0 contents lg:block">
            <h1 className="font-display heading-hero font-bold mb-0 lg:mb-6 text-ink leading-tight">
              {hero.headline}
            </h1>

            <p className="text-[1.125rem] min-[600px]:text-[1.25rem] text-body leading-relaxed max-w-[640px] mb-0 lg:mb-6">
              {hero.supporting}
            </p>

            <ul className="mb-0 lg:mb-8 space-y-2 max-lg:order-6">
              {hero.benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-base text-body">
                  {check}
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="contents lg:flex lg:flex-row lg:gap-4 lg:mb-4">
              <div id="hero-order" className="inline-flex max-lg:order-3">
                <ActionLink href={isDE ? '/de/order' : '/en/order'} variant="primary">
                  {hero.cta_order}
                </ActionLink>
              </div>
              <ActionLink href={isDE ? '/de#beispiele' : '/en#beispiele'} variant="secondary" className="max-lg:order-7">
                {hero.cta_examples}
              </ActionLink>
            </div>

            <p className="text-base text-copy max-lg:order-4">{priceLine}</p>
          </div>

          <div className="relative min-w-0 aspect-square max-lg:order-5 lg:aspect-auto lg:h-96">
            <Image
              src="/images/artwork/ultrasound2.avif"
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
