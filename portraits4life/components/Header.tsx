'use client';

import { useEffect, useId, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { menuRoutes, routeHref, type SiteRoute } from '@/content/routes';

const menuLabels: Record<string, { de: string; en: string }> = {
  home: { de: 'Start', en: 'Home' },
  order: { de: 'Bestellen', en: 'Order' },
  formats: { de: 'Formate', en: 'Formats' },
  contact: { de: 'Kontakt', en: 'Contact' },
};

export default function Header() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const handleLanguageSwitch = () => {
    const newLang = isDE ? 'en' : 'de';
    const newPath = pathname.replace(/^\/(en|de)/, `/${newLang}`);
    window.location.href = newPath || `/${newLang}`;
  };

  const locale = isDE ? 'de' : 'en';
  const links = menuRoutes().map((route: SiteRoute) => ({
    id: route.id,
    href: routeHref(locale, route),
    label: menuLabels[route.id]?.[locale] ?? route.id,
  }));

  return (
    <header className="bg-surface border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <a href={isDE ? '/de' : '/en'} className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="w-10 h-10 sm:w-12 sm:h-12 relative">
              <Image
                src="/images/logo.avif"
                alt="Portraits 4 Life"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-display text-xl sm:text-2xl font-bold text-ink whitespace-nowrap">
              Portraits 4 Life
            </span>
          </a>

          <nav aria-label={isDE ? 'Hauptmenü' : 'Main menu'} className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a key={link.id} href={link.href} className="text-copy hover:text-ink transition">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleLanguageSwitch}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 border-brand bg-brand-soft hover:bg-brand-tint text-brand-strong font-semibold text-sm sm:text-base transition"
              type="button"
            >
              {isDE ? 'EN' : 'DE'}
            </button>

            <button
              type="button"
              className="md:hidden h-11 w-11 flex items-center justify-center text-copy hover:text-ink"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? (isDE ? 'Menü schließen' : 'Close menu') : (isDE ? 'Menü öffnen' : 'Open menu')}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id={menuId}
            aria-label={isDE ? 'Hauptmenü' : 'Main menu'}
            className="md:hidden mt-4 border-t border-line pt-2"
            onClick={(event) => {
              if ((event.target as HTMLElement).closest('a')) setMenuOpen(false);
            }}
          >
            {links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className="flex min-h-12 items-center text-lg text-body hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
