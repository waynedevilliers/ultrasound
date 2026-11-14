'use client';

import { usePathname } from 'next/navigation';

export default function HowItWorks() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');

  const steps = isDE ? [
    {
      number: 1,
      title: 'Bild hochladen',
      description: 'Sende mir dein klares Ultraschallbild oder Portraitfoto. Wir prüfen es innerhalb von 24 Stunden.',
    },
    {
      number: 2,
      title: 'Künstlerische Bearbeitung',
      description: 'Unser Künstler erstellt eine wunderschöne verbesserte Version mit Farben und künstlerischen Akzenten.',
    },
    {
      number: 3,
      title: 'Genießen & Bewahren',
      description: 'Erhalte deine hochauflösende Datei oder deinen Leinwanddruck. Das perfekte Erinnerungsstück.',
    },
  ] : [
    {
      number: 1,
      title: 'Send Your Image',
      description: 'Upload a clear ultrasound photo or personal portrait. We review it within 24 hours.',
    },
    {
      number: 2,
      title: 'Artistic Enhancement',
      description: 'Our artist creates a beautiful enhanced version with color and artistic touches.',
    },
    {
      number: 3,
      title: 'Receive & Enjoy',
      description: 'Get your high-quality digital file or canvas print. Perfect keepsake for your home.',
    },
  ];

  return (
    <section className="section-y bg-canvas">
      <div className="container-site">
        <h2
          className="font-display heading-xl font-bold text-center mb-20 text-ink"
        >
          {isDE ? 'Einfacher Prozess' : 'Simple Process'}
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="h-full bg-surface rounded-lg p-8 shadow-sm hover:shadow-md transition">
              <div className="mb-6 flex items-center justify-center w-12 h-12 rounded-full bg-brand-tint">
                <span className="text-xl font-bold text-brand-strong">{step.number}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-ink">
                {step.title}
              </h3>
              <p className="text-copy leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
