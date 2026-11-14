'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { getCopy, localeOf } from '@/lib/copy';
import { formatPrice } from '@/lib/price';
import { canvasProduct, canvasSizes, digitalProduct } from '@/content/products';
import ActionLink from '@/components/ActionLink';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// TODO(client): confirm payment methods and delivery times before launch.
export default function PricingTiers() {
  const pathname = usePathname();
  const locale = localeOf(pathname);
  const { pricing } = getCopy(locale);
  const orderPath = `/${locale}/order`;

  const formats = [
    {
      key: 'digital',
      title: pricing.digital.title,
      price: `${formatPrice(digitalProduct.priceFrom, locale)} – ${formatPrice(digitalProduct.priceTo, locale)}`,
      delivery: pricing.digital.delivery,
      items: pricing.digital.items,
      href: `${orderPath}?format=${digitalProduct.id}`,
    },
    ...canvasSizes.map((size) => ({
      key: size.id,
      title: `${pricing.canvas.title} ${size.widthCm} × ${size.heightCm} cm`,
      price: formatPrice(size.price, locale),
      delivery: pricing.canvas.delivery,
      items: [],
      href: `${orderPath}?format=${size.id}`,
    })),
  ];

  // TODO(client): confirm the alt texts and captions for the canvas photos.
  const images = [
    { src: '/images/formats/canvas-gallery.png', alt: pricing.imageAlt.canvasGallery },
    { src: '/images/formats/canvas-portrait.png', alt: pricing.imageAlt.canvasPortrait },
    { src: '/images/formats/canvas-sizes.png', alt: pricing.imageAlt.canvasSizes },
  ];

  const deliveryWeeks = `${canvasProduct.deliveryWeeksMin}–${canvasProduct.deliveryWeeksMax}`;

  return (
    <section id="pricing" className="section-y bg-canvas">
      <div className="container-site">
        <h2 className="font-display heading-xl font-bold text-center mb-16 text-ink">{pricing.title}</h2>

        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {images.map((image) => (
            <Image
              key={image.src}
              src={image.src}
              alt={image.alt}
              width={1536}
              height={1024}
              sizes="(min-width: 768px) 33vw, 100vw"
              className="h-auto w-full rounded-lg shadow-lg"
            />
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {formats.map((format) => (
            <Card
              key={format.key}
              className="flex h-full flex-col border-2 border-line hover:border-brand transition overflow-hidden"
            >
              <CardHeader className="bg-gradient-to-r from-canvas to-surface pb-6">
                <CardTitle className="text-2xl mb-2">{format.title}</CardTitle>
                <p className="text-3xl font-bold text-brand-strong">{format.price}</p>
                <p className="text-base text-copy mt-2">{format.delivery}</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col pt-6">
                {format.items.length > 0 && (
                  <ul className="space-y-3 mb-6">
                    {format.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-copy">
                        <span className="text-brand mt-1 shrink-0" aria-hidden="true">
                          ✓
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-auto">
                  <ActionLink href={format.href} variant="secondary" className="w-full">
                    {pricing.orderFormat}
                  </ActionLink>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 space-y-2 text-center text-copy">
          <p>{pricing.payment}</p>
          <p>{pricing.deliveryLine.replace('{weeks}', deliveryWeeks)}</p>
        </div>
      </div>
    </section>
  );
}
