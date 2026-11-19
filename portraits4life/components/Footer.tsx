import Link from 'next/link';
import { getCopy, type Locale } from '@/lib/copy';
import { footerRoutes, routeHref } from '@/content/routes';
import LanguageSwitch from '@/components/LanguageSwitch';

// TODO(client): confirm contact email, copyright year and the legal page links before launch.
export default function Footer({ locale }: { locale: Locale }) {
  const isDE = locale === 'de';
  const copy = getCopy(locale);
  const legal = copy.legal;

  const contactUs = copy.footer.contactUs;
  const copyright = copy.footer.copyright.replace('{year}', String(new Date().getFullYear()));
  const tagline = copy.footer.tagline;

  return (
    <footer className="bg-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link
              href={isDE ? '/de' : '/en'}
              className="inline-flex min-h-11 items-center font-display text-2xl font-bold"
            >
              Portraits 4 Life
            </Link>
          </div>

          <div>
            <p className="text-caption mb-4">{contactUs}</p>
            <a
              href="mailto:portraits4life.art@gmail.com"
              className="inline-flex min-h-11 items-center text-brand-light hover:text-brand-on-dark transition"
            >
              portraits4life.art@gmail.com
            </a>
          </div>

          <div className="text-caption">
            <p>{copyright}</p>
            {/* -ml-3 lines the text up with the column; the 44px tap area reaches into the margin. */}
            <div className="mt-4 -ml-3">
              <LanguageSwitch tone="dark" />
            </div>
            <nav aria-label={copy.footer.legalNav} className="mt-4 flex flex-col items-start gap-2">
              {footerRoutes()
                .filter((route) => route.id === 'impressum' || route.id === 'datenschutz')
                .map((route) => (
                  <Link
                    key={route.id}
                    href={routeHref(isDE ? 'de' : 'en', route)}
                    className="inline-flex min-h-11 items-center hover:text-on-dark-soft transition"
                  >
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
