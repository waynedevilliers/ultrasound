'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { getCopy, localeOf } from '@/lib/copy';
import { formatPrice } from '@/lib/price';
import { canvasSizes, digitalProduct } from '@/content/products';
import { canvasDeliveryText, digitalDeliveryText } from '@/lib/delivery';
import ActionLink from '@/components/ActionLink';
import InfoCard from '@/components/InfoCard';

// TODO(client): confirm payment methods and delivery times before launch.
// TODO(client): confirm the canvas feature list (neutral placeholders, no product claims yet).
// TODO(client): confirm the alt texts and captions for the canvas photos.
export default function PricingTiers() {
  const pathname = usePathname();
  const locale = localeOf(pathname);
  const { pricing } = getCopy(locale);
  const orderPath = `/${locale}/order`;
  // Non-breaking spaces keep a size such as "30 × 30 cm" on one line.
  const sizeLabel = (widthCm: number, heightCm: number) => `${widthCm} × ${heightCm} cm`;

  // Canvas sizes first, the digital file last.
  const formats = [
    ...canvasSizes.map((size) => ({
      key: size.id,
      title: `${pricing.canvas.title} ${sizeLabel(size.widthCm, size.heightCm)}`,
      price: formatPrice(size.price, locale),
      delivery: pricing.canvas.delivery.replace('{time}', canvasDeliveryText(locale)),
      items: pricing.canvasItems,
      href: `${orderPath}?format=${size.id}`,
    })),
    {
      key: digitalProduct.id,
      title: pricing.digital.title,
      price: formatPrice(digitalProduct.price, locale),
      delivery: pricing.digital.delivery.replace('{time}', digitalDeliveryText(locale)),
      items: pricing.digital.items,
      href: `${orderPath}?format=${digitalProduct.id}`,
    },
  ];

  const images = [
    { src: '/images/formats/canvas-sizes.png', alt: pricing.imageAlt.canvasSizes },
    { src: '/images/formats/canvas-portrait.png', alt: pricing.imageAlt.canvasPortrait },
  ];

  return (
    <section id="pricing" className="section-y bg-canvas">
      <div className="container-site">
        <h2 className="font-display heading-xl font-bold text-center mb-16 text-ink">{pricing.title}</h2>

        <div className="grid gap-6 md:grid-cols-2 mb-16">
          {images.map((image) => (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={1536}
              height={1024}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="h-auto w-full rounded-lg shadow-lg"
            />
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {formats.map((format) => (
            <InfoCard key={format.key} variant="bordered" className="flex flex-col">
              <h3 className="text-2xl font-bold text-ink mb-2">{format.title}</h3>
              <p className="text-3xl font-bold text-brand-strong">{format.price}</p>
              <p className="text-base text-copy mt-2 mb-6">{format.delivery}</p>
              <ul className="space-y-3 mb-8">
                {format.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-copy">
                    <span className="text-brand mt-1 shrink-0" aria-hidden="true">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <ActionLink href={format.href} variant="secondary" className="w-full">
                  {pricing.orderFormat}
                </ActionLink>
              </div>
            </InfoCard>
          ))}
        </div>

        <div className="mt-10 space-y-2 text-center text-copy">
          <p>{pricing.payment}</p>
          <p>
            {pricing.deliveryLine
              .replace('{digital}', digitalDeliveryText(locale))
              .replace('{canvas}', canvasDeliveryText(locale))}
          </p>
        </div>
      </div>
    </section>
  );
}
