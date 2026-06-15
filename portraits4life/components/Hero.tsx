'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();

  return (
    <section className="bg-gradient-to-b from-slate-100 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1
              className="text-5xl lg:text-6xl font-bold mb-6 text-gray-900 leading-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              {t('headline')}
            </h1>

            <p className="text-lg text-gray-600 mb-8 whitespace-pre-line leading-relaxed">
              {t('body')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/${locale}/order`}
                className="inline-block bg-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-600 transition text-center"
              >
                {t('cta_order')}
              </Link>
              <a
                href="#pricing"
                className="inline-block border-2 border-gray-900 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 hover:text-white transition text-center"
              >
                {t('cta_formats')}
              </a>
            </div>
          </div>

          <div className="relative h-96 lg:h-96">
            <Image
              src="/images/ultrasound.avif"
              alt="Ultrasound artwork example"
              fill
              className="object-cover rounded-lg shadow-lg"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
