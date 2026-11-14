'use client';

import Image from 'next/image';
import ActionLink from '@/components/ActionLink';
import { usePathname } from 'next/navigation';
import { getCopy, localeOf } from '@/lib/copy';

export default function Hero() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');
  const { hero } = getCopy(localeOf(pathname));

  return (
    <section className="bg-gradient-to-b from-hero to-surface">
      <div className="container-site section-y">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="min-w-0">
            <h1 className="font-display heading-hero font-bold mb-6 text-ink leading-tight">
              {hero.headline}
            </h1>

            <p className="text-[1.125rem] min-[600px]:text-[1.25rem] text-body leading-relaxed max-w-[640px] mb-8">
              {hero.supporting}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <ActionLink href={isDE ? '/de/order' : '/en/order'} variant="primary">
                {hero.cta_order}
              </ActionLink>
              <ActionLink href={isDE ? '/de#pricing' : '/en#pricing'} variant="secondary">
                {hero.cta_formats}
              </ActionLink>
            </div>

            <div className="reading-column text-base text-copy leading-relaxed whitespace-pre-line">
              {hero.bodyRest}
            </div>
          </div>

          <div className="relative h-96 lg:h-96 min-w-0">
            <Image
              src="/images/ultrasound.avif"
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
