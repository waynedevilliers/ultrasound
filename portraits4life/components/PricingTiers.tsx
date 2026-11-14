'use client';

import { usePathname } from 'next/navigation';
import { getCopy, localeOf } from '@/lib/copy';
import { formatPrice } from '@/lib/price';
import { canvasSizes, digitalProduct } from '@/content/products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PricingTiers() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');

  const locale = localeOf(pathname);
  const { pricing } = getCopy(locale);
  const tiers = [
    {
      title: pricing.digital.title,
      price: `${formatPrice(digitalProduct.priceFrom, locale)} – ${formatPrice(digitalProduct.priceTo, locale)}`,
      delivery: pricing.digital.delivery,
      items: pricing.digital.items,
    },
    {
      title: pricing.canvas.title,
      items: canvasSizes.map((size) => ({ size: `${size.widthCm} × ${size.heightCm} cm`, price: formatPrice(size.price, locale) })),
      delivery: pricing.canvas.delivery,
    },
  ];

  return (
    <section id="pricing" className="section-y bg-canvas">
      <div className="container-site">
        <h2
          className="font-display heading-xl font-bold text-center mb-16 text-ink"
        >
          {pricing.title}
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {tiers.map((tier, idx) => (
            <Card key={idx} className="h-full border-2 border-line hover:border-brand transition overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-canvas to-surface pb-6">
                <CardTitle className="text-3xl mb-2">{tier.title}</CardTitle>
                {tier.price && <p className="text-4xl font-bold text-brand-strong">{tier.price}</p>}
                <p className="text-base text-copy mt-2">{tier.delivery}</p>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {tier.items && Array.isArray(tier.items) && typeof tier.items[0] === 'object' ? (
                    tier.items.map((item, i) => {
                      const obj = item as { size: string; price: string };
                      return (
                        <li key={i} className="flex items-center justify-between gap-3 pb-3 border-b border-line-soft last:border-0">
                          <span className="text-body font-medium">{obj.size}</span>
                          <span className="text-2xl font-bold text-brand-strong">{obj.price}</span>
                        </li>
                      );
                    })
                  ) : (
                    tier.items?.map((item, i) => {
                      const str = item as string;
                      return (
                        <li key={i} className="flex items-start gap-3 text-copy">
                          <span className="text-brand mt-1 flex-shrink-0">✓</span>
                          <span>{str}</span>
                        </li>
                      );
                    })
                  )}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
