'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');

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
            <a href="/" className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair)' }}>
              Portraits 4 Life
            </a>
          </div>

          <div>
            <p className="text-gray-400 mb-4">{contactUs}</p>
            <a href="mailto:portraits4life.art@gmail.com" className="text-pink-400 hover:text-pink-300 transition">
              portraits4life.art@gmail.com
            </a>
          </div>

          <div className="text-gray-400">
            <p>{copyright}</p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>{tagline}</p>
        </div>
      </div>
    </footer>
  );
}
