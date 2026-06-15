'use client';

import { usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PricingTiers() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');

  const tiers = isDE ? [
    {
      title: 'Hochauflösendes digitales JPG',
      price: '€30 - 50',
      delivery: '1 Woche Lieferung',
      items: [
        'Hochauflösende digitale Datei',
        'Perfekt für digitale Bilderrahmen',
        'Sofortige Bereitstellung nach Fertigstellung',
      ],
    },
    {
      title: 'Leinwanddrucke',
      items: [
        { size: '30 × 30 cm', price: '€69' },
        { size: '40 × 40 cm', price: '€89' },
        { size: '50 × 50 cm', price: '€119' },
      ],
      delivery: '1 - 2 Wochen Lieferung',
    },
  ] : [
    {
      title: 'High-Res Digital JPG',
      price: '€30 - 50',
      delivery: '1 Week Delivery',
      items: [
        'High-resolution digital file',
        'Perfect for digital frames',
        'Instant download after completion',
      ],
    },
    {
      title: 'Canvas Prints',
      items: [
        { size: '30 × 30 cm', price: '€69' },
        { size: '40 × 40 cm', price: '€89' },
        { size: '50 × 50 cm', price: '€119' },
      ],
      delivery: '1 - 2 Weeks Delivery',
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-5xl font-bold text-center mb-16 text-gray-900"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {isDE ? 'Formate & Preise' : 'Formats & Pricing'}
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {tiers.map((tier, idx) => (
            <Card key={idx} className="border-2 border-gray-200 hover:border-pink-500 transition overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-6">
                <CardTitle className="text-3xl mb-2">{tier.title}</CardTitle>
                {tier.price && <p className="text-4xl font-bold text-pink-600">{tier.price}</p>}
                <p className="text-sm text-gray-600 mt-2">{tier.delivery}</p>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {tier.items && Array.isArray(tier.items) && typeof tier.items[0] === 'object' ? (
                    tier.items.map((item, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100 last:border-0">
                        <span className="text-gray-700 font-medium">{item.size}</span>
                        <span className="text-2xl font-bold text-pink-600">{item.price}</span>
                      </li>
                    ))
                  ) : (
                    tier.items?.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-600">
                        <span className="text-pink-500 mt-1 flex-shrink-0">✓</span>
                        <span>{item}</span>
                      </li>
                    ))
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
