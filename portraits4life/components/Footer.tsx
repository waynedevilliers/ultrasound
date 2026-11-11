'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import de from '@/messages/de.json';
import en from '@/messages/en.json';

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
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <Link href={isDE ? '/de' : '/en'} className="font-display text-2xl font-bold">
              Portraits 4 Life
            </Link>
          </div>

          <div>
            <p className="text-gray-400 mb-4">{contactUs}</p>
            <a href="mailto:portraits4life.art@gmail.com" className="text-pink-400 hover:text-pink-300 transition">
              portraits4life.art@gmail.com
            </a>
          </div>

          <div className="text-gray-400">
            <p>{copyright}</p>
            <nav aria-label={isDE ? 'Rechtliches' : 'Legal'} className="mt-4 flex flex-col gap-2">
              <Link href={isDE ? '/de/impressum' : '/en/impressum'} className="hover:text-gray-200 transition">
                {legal.impressum.title}
              </Link>
              <Link href={isDE ? '/de/datenschutz' : '/en/datenschutz'} className="hover:text-gray-200 transition">
                {legal.datenschutz.title}
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>{tagline}</p>
        </div>
      </div>
    </footer>
  );
}
