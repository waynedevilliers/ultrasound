'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import de from '@/messages/de.json';
import en from '@/messages/en.json';
import { getCopy, localeOf } from '@/lib/copy';
import { footerRoutes, routeHref } from '@/content/routes';

// TODO(client): confirm contact email, copyright year and the legal page links before launch.
export default function Footer() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');
  const copy = getCopy(localeOf(pathname));
  const legal = copy.legal;

  const handleLanguageSwitch = () => {
    const newLang = isDE ? 'en' : 'de';
    const newPath = pathname.replace(/^\/(en|de)/, `/${newLang}`);
    window.location.href = newPath || `/${newLang}`;
  };

  const contactUs = copy.footer.contactUs;
  const copyright = copy.footer.copyright;
  const tagline = copy.footer.tagline;

  return (
    <footer className="bg-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link href={isDE ? '/de' : '/en'} className="font-display text-2xl font-bold">
              Portraits 4 Life
            </Link>
          </div>

          <div>
            <p className="text-caption mb-4">{contactUs}</p>
            <a href="mailto:portraits4life.art@gmail.com" className="text-brand-light hover:text-brand-on-dark transition">
              portraits4life.art@gmail.com
            </a>
          </div>

          <div className="text-caption">
            <p>{copyright}</p>
            <button
              type="button"
              onClick={handleLanguageSwitch}
              aria-label={copy.header.switchLanguageLabel}
              className="mt-4 px-4 py-2 rounded-full border-2 border-brand-light text-brand-on-dark font-semibold hover:text-brand-on-dark transition"
            >
              {copy.header.switchLanguage}
            </button>
            <nav aria-label={copy.footer.legalNav} className="mt-4 flex flex-col gap-2">
              {footerRoutes().filter((route) => route.id === 'impressum' || route.id === 'datenschutz').map((route) => (
                <Link key={route.id} href={routeHref(isDE ? 'de' : 'en', route)} className="hover:text-on-dark-soft transition">
                  {route.id === 'impressum' ? legal.impressum.title : legal.datenschutz.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t border-line-dark pt-8 text-center text-caption text-base">
          <p>{tagline}</p>
        </div>
      </div>
    </footer>
  );
}
