'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export default function ContactSection() {
  const t = useTranslations('contact');
  const locale = useLocale();

  return (
    <section id="contact" className="py-20 lg:py-32 bg-gradient-to-r from-slate-900 to-slate-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          className="text-5xl font-bold mb-6 text-white"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {t('title')}
        </h2>

        <p className="text-xl text-gray-200 mb-8">
          {t('description')}
        </p>

        <p className="text-2xl font-semibold text-pink-400 mb-10">
          {t('email')}
        </p>

        <Link
          href={`/${locale}/order`}
          className="inline-block bg-pink-500 text-white px-10 py-4 rounded-lg font-semibold hover:bg-pink-600 transition"
        >
          {t('cta')}
        </Link>
      </div>
    </section>
  );
}
