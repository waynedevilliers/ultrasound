'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const t = useTranslations('header');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageSwitch = (newLocale: string) => {
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <Link href={`/${locale}`} className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
            {t('logo')}
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href={`/${locale}`} className="text-gray-600 hover:text-gray-900 transition">
              {t('home')}
            </Link>
            <Link href={`/${locale}/order`} className="text-gray-600 hover:text-gray-900 transition">
              {t('order')}
            </Link>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition">
              {t('formats')}
            </a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition">
              {t('contact')}
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleLanguageSwitch(locale === 'en' ? 'de' : 'en')}
              className="px-3 py-1 rounded-full border border-gray-300 hover:border-gray-400 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
            >
              {locale === 'en' ? 'DE' : 'EN'}
            </button>

            <button className="md:hidden text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
