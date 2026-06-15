'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Gallery() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
          <div
            className="relative h-96 rounded-lg overflow-hidden shadow-lg cursor-pointer"
            onClick={() => setSelectedImage('/images/ultrasound2.avif')}
          >
            <Image
              src="/images/ultrasound2.avif"
              alt="Ultrasound artwork example 1"
              fill
              className="object-cover hover:scale-105 transition duration-300"
            />
          </div>

          <div
            className="relative h-96 rounded-lg overflow-hidden shadow-lg cursor-pointer"
            onClick={() => setSelectedImage('/images/ultrasound3.avif')}
          >
            <Image
              src="/images/ultrasound3.avif"
              alt="Ultrasound artwork example 2"
              fill
              className="object-cover hover:scale-105 transition duration-300"
            />
          </div>
        </div>

        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative w-full h-full max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
              <Image
                src={selectedImage}
                alt="Full size image"
                fill
                className="object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-200 transition"
              >
                ✕
              </button>
            </div>
          </div>
        )}

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
