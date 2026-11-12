'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import de from '@/messages/de.json';
import en from '@/messages/en.json';
import { footerRoutes, routeHref } from '@/content/routes';

// TODO(client): confirm contact email, copyright year and the legal page links before launch.
export default function Footer() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');
  const legal = (isDE ? de : en).legal;

  const contactUs = isDE ? 'Kontaktiere uns' : 'Contact Us';
  const copyright = isDE
    ? '© 2024 Portraits 4 Life. Alle Rechte vorbehalten.'
    : '© 2024 Portraits 4 Life. All rights reserved.';
  const tagline = isDE
    ? 'Mit Liebe für Eltern und ihre schönsten Erinnerungen'
    : 'Made with care for new parents & their memories';

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
            <nav aria-label={isDE ? 'Rechtliches' : 'Legal'} className="mt-4 flex flex-col gap-2">
              {footerRoutes().filter((route) => route.id === 'impressum' || route.id === 'datenschutz').map((route) => (
                <Link key={route.id} href={routeHref(isDE ? 'de' : 'en', route)} className="hover:text-on-dark-soft transition">
                  {route.id === 'impressum' ? legal.impressum.title : legal.datenschutz.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t border-line-dark pt-8 text-center text-caption text-sm">
          <p>{tagline}</p>
        </div>
      </div>
    </footer>
  );
}
