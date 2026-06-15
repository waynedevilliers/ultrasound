'use client';

import { useTranslations } from 'next-intl';

export default function HowItWorks() {
  const t = useTranslations('howItWorks');

  const steps = [
    {
      number: 1,
      title: t('step1.title'),
      description: t('step1.description'),
      icon: '📤',
    },
    {
      number: 2,
      title: t('step2.title'),
      description: t('step2.description'),
      icon: '✨',
    },
    {
      number: 3,
      title: t('step3.title'),
      description: t('step3.description'),
      icon: '🎨',
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-5xl font-bold text-center mb-16 text-gray-900"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {t('title')}
        </h2>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mb-6 text-6xl flex justify-center">
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                {step.title}
              </h3>
              <p className="text-gray-600 text-lg">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
