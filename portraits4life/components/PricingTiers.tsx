import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PricingTiers() {
  const tiers = [
    {
      title: 'Digital Download',
      items: [
        'High-res JPG',
        '€9–15',
        'Instant Delivery',
      ],
    },
    {
      title: 'Canvas Print',
      items: [
        '30×30 cm (€29)',
        '40×40 cm (€39)',
        '50×50 cm (€55)',
        '~2 Weeks Delivery',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-5xl font-bold text-center mb-16 text-gray-900"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Formats & Pricing
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {tiers.map((tier) => (
            <Card key={tier.title} className="border-2 border-gray-200 hover:border-pink-300 transition">
              <CardHeader>
                <CardTitle className="text-3xl">{tier.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tier.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-600">
                      <span className="text-pink-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-white rounded-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">
            Optional Add-ons
          </h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center gap-3">
              <span className="text-pink-500">✓</span>
              Child's name added
            </li>
            <li className="flex items-center gap-3">
              <span className="text-pink-500">✓</span>
              Number of weeks in the womb
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
