'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Gallery() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');

  return (
    <section className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-5xl font-bold text-center mb-16 text-gray-900"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {isDE ? 'Unsere Arbeiten' : 'Our Work'}
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/images/ultrasound2.avif"
              alt="Ultrasound artwork example 1"
              fill
              className="object-cover hover:scale-105 transition duration-300"
            />
          </div>

          <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/images/ultrasound3.avif"
              alt="Ultrasound artwork example 2"
              fill
              className="object-cover hover:scale-105 transition duration-300"
            />
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xl text-gray-600">
            {isDE ? (
              'Sehe die Schönheit in jedem Detail. Verwandle dein Ultraschallbild in ein Kunstwerk.'
            ) : (
              'See the beauty in every detail. Transform your ultrasound into a work of art.'
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
