'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <a href="/" className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
              Portraits 4 Life
            </a>
          </div>

          <div>
            <p className="text-gray-400 mb-4">{t('footer.contactUs')}</p>
            <a href="mailto:portraits4life.art@gmail.com" className="text-pink-400 hover:text-pink-300 transition">
              portraits4life.art@gmail.com
            </a>
          </div>

          <div className="text-gray-400">
            <p>© 2024 Portraits 4 Life. All rights reserved.</p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
