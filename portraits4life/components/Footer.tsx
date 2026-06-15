'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

export default function Footer() {
  const t = useTranslations('footer');
  const contact = useTranslations('contact');
  const header = useTranslations('header');
  const locale = useLocale();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link href={`/${locale}`} className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
              {header('logo')}
            </Link>
          </div>

          <div>
            <p className="text-gray-400 mb-4">{contact('email')}</p>
            <a href={`mailto:${contact('email')}`} className="text-pink-400 hover:text-pink-300 transition">
              {contact('email')}
            </a>
          </div>

          <div className="text-gray-400">
            <p>{t('copyright')}</p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>Made with care for new parents & their memories</p>
        </div>
      </div>
    </footer>
  );
}
