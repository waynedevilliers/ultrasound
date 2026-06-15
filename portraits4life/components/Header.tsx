'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [isDE, setIsDE] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDE(pathname.startsWith('/de'));
  }, [pathname]);

  const handleLanguageSwitch = () => {
    const newLang = isDE ? 'en' : 'de';
    const newPath = pathname.replace(/^\/(en|de)/, `/${newLang}`);
    window.location.href = newPath || `/${newLang}`;
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <a href={isDE ? '/de' : '/en'} className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="w-12 h-12 relative">
              <Image
                src="/images/logo.avif"
                alt="Portraits 4 Life"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
              Portraits 4 Life
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            <a href={isDE ? '/de' : '/en'} className="text-gray-600 hover:text-gray-900 transition">
              {isDE ? 'Start' : 'Home'}
            </a>
            <a href={isDE ? '/de/order' : '/en/order'} className="text-gray-600 hover:text-gray-900 transition">
              {isDE ? 'Bestellen' : 'Order'}
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">
              {isDE ? 'Formate' : 'Formats'}
            </a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition">
              {isDE ? 'Kontakt' : 'Contact'}
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLanguageSwitch}
              className="px-4 py-2 rounded-full border-2 border-pink-500 bg-pink-50 hover:bg-pink-100 text-pink-600 font-semibold transition"
              type="button"
            >
              {mounted ? (isDE ? 'EN' : 'DE') : 'EN'}
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
