'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { menuRoutes, routeHref, type SiteRoute } from '@/content/routes';
import { isActiveItem } from '@/lib/is-active-item';

const menuLabels: Record<string, { de: string; en: string }> = {
  home: { de: 'Start', en: 'Home' },
  order: { de: 'Bestellen', en: 'Order' },
  formats: { de: 'Formate', en: 'Formats' },
  contact: { de: 'Kontakt', en: 'Contact' },
};

// The logo row scrolls away with the page. The menu bar is sticky: it never changes
// size and has no scroll listeners, so it cannot flicker.
export default function Header() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');
  const locale = isDE ? 'de' : 'en';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Escape closes the panel and returns focus to the menu button.
  // A click outside the menu closes it too.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);

  const handleLanguageSwitch = () => {
    const newLang = isDE ? 'en' : 'de';
    const newPath = pathname.replace(/^\/(en|de)/, `/${newLang}`);
    window.location.href = newPath || `/${newLang}`;
  };

  const links = menuRoutes().map((route: SiteRoute) => ({
    id: route.id,
    href: routeHref(locale, route),
    label: menuLabels[route.id]?.[locale] ?? route.id,
    // Anchor-only items (sections) are never the current page.
    active: !route.anchor && isActiveItem(route.path, pathname, locale),
  }));

  const navLabel = isDE ? 'Hauptmenü' : 'Main menu';

  return (
    <>
      <header className="bg-surface">
        <a
          href={isDE ? '/de' : '/en'}
          className="flex items-center justify-center gap-3 py-4 hover:opacity-90 transition"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 relative">
            <Image
              src="/images/logo.avif"
              alt="Portraits 4 Life"
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-display text-3xl sm:text-4xl font-bold text-ink whitespace-nowrap">
            Portraits 4 Life
          </span>
        </a>
      </header>

      <nav
        ref={navRef}
        aria-label={navLabel}
        className="sticky top-0 z-50 bg-surface border-b border-line"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[var(--menu-bar-height)] flex items-center justify-center">
          <ul className="hidden lg:flex items-center gap-6">
            {links.map((link, index) => (
              <li key={link.id} className="flex items-center gap-6">
                {index > 0 && (
                  <span aria-hidden="true" className="text-body">
                    |
                  </span>
                )}
                <a
                  href={link.href}
                  aria-current={link.active ? 'page' : undefined}
                  className={
                    link.active
                      ? 'text-brand-strong font-semibold underline underline-offset-4'
                      : 'text-body hover:text-ink transition'
                  }
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="absolute right-4 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleLanguageSwitch}
              aria-label={isDE ? 'Sprache auf Englisch wechseln' : 'Switch language to German'}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 border-brand bg-brand-soft hover:bg-brand-tint text-brand-strong font-semibold text-sm sm:text-base transition"
              type="button"
            >
              {isDE ? 'EN' : 'DE'}
            </button>

            <button
              ref={toggleRef}
              type="button"
              className="lg:hidden h-11 w-11 flex items-center justify-center text-copy hover:text-ink"
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
          <ul
            id={menuId}
            className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 pb-2 border-t border-line bg-surface"
            onClick={(event) => {
              if ((event.target as HTMLElement).closest('a')) setMenuOpen(false);
            }}
          >
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  aria-current={link.active ? 'page' : undefined}
                  className={`flex min-h-12 items-center text-lg hover:text-ink ${link.active ? 'text-brand-strong font-semibold' : 'text-body'}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </>
  );
}
