'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getCopy, localeOf } from '@/lib/copy';
import ActionLink from '@/components/ActionLink';

// TODO(client): the original ultrasound images for the "Vorher" side are still missing; placeholders are shown until they arrive.
// Each pair shows the original (before) next to the artwork (after), at the same size.
const pairs = [
  { after: '/images/artwork/ultrasound.avif', altKey: 'alt1' as const },
  { after: '/images/artwork/ultrasound2.avif', altKey: 'alt2' as const },
  { after: '/images/artwork/ultrasound3.avif', altKey: 'alt3' as const },
];

type Enlarged = { src: string; alt: string };

export default function Gallery() {
  const pathname = usePathname();
  const pageLocale = localeOf(pathname);
  const { gallery, common } = getCopy(pageLocale);
  const [enlarged, setEnlarged] = useState<Enlarged | null>(null);
  // The image that opened the enlarged view gets the focus back when it closes.
  const openedFrom = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  const openImage = (image: Enlarged, trigger: HTMLElement) => {
    openedFrom.current = trigger;
    setEnlarged(image);
  };
  const closeImage = () => {
    setEnlarged(null);
    openedFrom.current?.focus();
  };

  // While the enlarged view is open: focus its close button, and close it with Escape.
  useEffect(() => {
    if (!enlarged) return;
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      // The close button is the only control in the dialog, so Tab keeps the focus on it.
      if (event.key === 'Tab') {
        event.preventDefault();
        closeButton.current?.focus();
        return;
      }
      if (event.key !== 'Escape') return;
      setEnlarged(null);
      openedFrom.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [enlarged]);

  return (
    <section id="beispiele" className="section-y bg-canvas">
      <div className="container-site">
        <h2 className="font-display heading-xl font-bold text-center mb-16 text-ink">
          {gallery.title}
        </h2>

        <div className="space-y-12">
          {pairs.map((pair) => {
            const alt = gallery[pair.altKey];
            return (
              <div key={pair.after} className="grid md:grid-cols-2 gap-8 items-start">
                <figure>
                  <figcaption className="mb-3 text-base font-semibold text-ink">
                    {gallery.before}
                  </figcaption>
                  <div
                    role="img"
                    aria-label={gallery.beforeAlt}
                    className="relative h-96 rounded-lg overflow-hidden shadow-lg bg-surface-muted border border-line flex items-center justify-center p-6 text-center text-copy"
                  >
                    {gallery.placeholder}
                  </div>
                </figure>

                <figure>
                  <figcaption className="mb-3 text-base font-semibold text-ink">
                    {gallery.after}
                  </figcaption>
                  <button
                    type="button"
                    aria-label={`${gallery.enlarge}: ${alt}`}
                    onClick={(event) => openImage({ src: pair.after, alt }, event.currentTarget)}
                    className="relative block h-96 w-full rounded-lg overflow-hidden shadow-lg cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                  >
                    <Image
                      src={pair.after}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-cover transition duration-300 motion-safe:hover:scale-105"
                    />
                  </button>
                </figure>
              </div>
            );
          })}
        </div>

        {enlarged && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={enlarged.alt}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={closeImage}
          >
            <div
              className="relative w-full h-full max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={enlarged.src}
                alt={enlarged.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
              <button
                ref={closeButton}
                type="button"
                onClick={closeImage}
                className="absolute top-4 right-4 bg-surface text-black rounded-full w-11 h-11 flex items-center justify-center hover:bg-surface-strong transition focus-visible:outline-2 focus-visible:outline-brand"
              >
                <span aria-hidden="true">✕</span>
                <span className="sr-only">{gallery.close}</span>
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-xl text-copy">{gallery.caption}</p>
        </div>
        <div className="mt-8 text-center">
          <ActionLink href={`/${pageLocale}/order`} variant="secondary">
            {common.orderNow}
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
