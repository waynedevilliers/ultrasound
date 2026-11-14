'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { getCopy, localeOf } from '@/lib/copy';

// TODO(client): the alt texts describe the artwork in general; the client may refine them for each image.
export default function Gallery() {
  const pathname = usePathname();
  const { gallery } = getCopy(localeOf(pathname));
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="beispiele" className="section-y bg-canvas">
      <div className="container-site">
        <h2
          className="font-display heading-xl font-bold text-center mb-16 text-ink"
        >
          {gallery.title}
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div
            className="relative h-96 rounded-lg overflow-hidden shadow-lg cursor-pointer"
            onClick={() => setSelectedImage('/images/ultrasound2.avif')}
          >
            <Image
              src="/images/ultrasound2.avif"
              alt={gallery.alt1}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover hover:scale-105 transition duration-300"
            />
          </div>

          <div
            className="relative h-96 rounded-lg overflow-hidden shadow-lg cursor-pointer"
            onClick={() => setSelectedImage('/images/ultrasound3.avif')}
          >
            <Image
              src="/images/ultrasound3.avif"
              alt={gallery.alt2}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
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
                alt={gallery.fullSizeAlt}
                fill
                sizes="100vw"
                className="object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-surface text-black rounded-full w-10 h-10 flex items-center justify-center hover:bg-surface-strong transition"
              >
                <span aria-hidden="true">✕</span>
                <span className="sr-only">{gallery.close}</span>
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-xl text-copy">
            {gallery.caption}
          </p>
        </div>
      </div>
    </section>
  );
}
