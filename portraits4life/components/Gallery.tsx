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

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <div className="relative h-96 md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden shadow-lg cursor-pointer group">
            <Image
              src="/images/ultrasound2.avif"
              alt="Ultrasound artwork example 1"
              fill
              className="object-cover group-hover:scale-110 transition duration-500"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition duration-300 flex items-center justify-center">
              <p className="text-white text-center opacity-0 group-hover:opacity-100 transition duration-300 text-lg font-semibold">
                {isDE ? 'Klicke zum Vergrößern' : 'Click to enlarge'}
              </p>
            </div>
          </div>

          <div className="relative h-96 md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden shadow-lg cursor-pointer group">
            <Image
              src="/images/ultrasound3.avif"
              alt="Ultrasound artwork example 2"
              fill
              className="object-cover group-hover:scale-110 transition duration-500"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition duration-300 flex items-center justify-center">
              <p className="text-white text-center opacity-0 group-hover:opacity-100 transition duration-300 text-lg font-semibold">
                {isDE ? 'Klicke zum Vergrößern' : 'Click to enlarge'}
              </p>
            </div>
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
