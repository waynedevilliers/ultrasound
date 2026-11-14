'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { menuRoutes, routeHref, type SiteRoute } from '@/content/routes';
import { isActiveItem } from '@/lib/is-active-item';
import { getCopy, localeOf } from '@/lib/copy';
import ActionLink from '@/components/ActionLink';



// The logo row scrolls away with the page. The menu bar is sticky: it never changes
// size and has no scroll listeners, so it cannot flicker.
// Moves the browser to another address. Kept outside the component.
function navigateTo(url: string) {
  window.location.href = url;
}

export default function Header() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');
  const locale = localeOf(pathname);
  const copy = getCopy(locale);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  // The small logo in the bar appears once the big logo has scrolled out of view.
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const element = logoRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setCompact(!entry.isIntersecting), { threshold: 0 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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

  // Switching keeps the current page; only the language prefix changes.
  const switchTo = (newLang: 'de' | 'en') => {
    navigateTo(pathname.replace(/^\/(en|de)/, `/${newLang}`) || `/${newLang}`);
  };
  const onOrderPage = pathname.endsWith('/order');

  const links = menuRoutes().map((route: SiteRoute) => ({
    id: route.id,
    href: routeHref(locale, route),
    label: copy.header[route.id as 'home' | 'order' | 'formats' | 'contact'] ?? route.id,
    // Anchor-only items (sections) are never the current page.
    active: !route.anchor && isActiveItem(route.path, pathname, locale),
  }));

  const navLabel = copy.header.mainMenu;

  return (
    <>
      <header className="bg-surface">
        <a
          ref={logoRef}
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
        <div className="relative container-site h-[var(--menu-bar-height)] flex items-center justify-center">
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

          <a
            href={isDE ? '/de' : '/en'}
            data-testid="compact-logo"
            aria-hidden={!compact}
            tabIndex={compact ? 0 : -1}
            // TODO(client): simplified logo that is readable at 32px; the name is shown for now.
            className={`absolute left-4 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 font-display text-2xl font-bold text-ink whitespace-nowrap transition-opacity duration-200 motion-reduce:transition-none ${compact ? 'opacity-100' : 'opacity-0'}`}
          >
            {copy.header.logo}
          </a>

          <div className="absolute right-4 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 flex items-center gap-2 sm:gap-4">
            <nav aria-label={copy.header.switchLanguageLabel} className="flex items-center gap-2 text-base font-semibold">
              {(["de", "en"] as const).map((code, index) => (
                <span key={code} className="flex items-center gap-2">
                  {index > 0 && <span aria-hidden="true" className="text-field">|</span>}
                  {code === locale ? (
                    <span aria-current="true" className="text-brand-strong underline underline-offset-4">
                      {code.toUpperCase()}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => switchTo(code)}
                      className="text-copy hover:text-ink transition"
                    >
                      {code.toUpperCase()}
                    </button>
                  )}
                </span>
              ))}
            </nav>

            {!onOrderPage && (
              <ActionLink href={isDE ? '/de/order' : '/en/order'} variant="primary" className="lg:hidden min-h-11 px-4 py-2 text-base">
                {copy.header.order}
              </ActionLink>
            )}

            <button
              ref={toggleRef}
              type="button"
              className="lg:hidden h-11 w-11 flex items-center justify-center text-copy hover:text-ink"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? copy.header.closeMenu : copy.header.openMenu}
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
