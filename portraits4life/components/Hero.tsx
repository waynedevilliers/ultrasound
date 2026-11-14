'use client';

import Image from 'next/image';
import ActionLink from '@/components/ActionLink';
import { usePathname } from 'next/navigation';

export default function Hero() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');

  const supporting = isDE
    ? 'Ein schwarz-weißes Ultraschallbild im Miniformat ist Schnee von gestern.'
    : 'A tiny black-and-white ultrasound photo is a thing of the past.';

  return (
    <section className="bg-gradient-to-b from-hero to-surface">
      <div className="container-site section-y">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="min-w-0">
            <h1 className="font-display heading-hero font-bold mb-6 text-ink leading-tight">
              ULTRASOUND ART
            </h1>

            <p className="text-[1.125rem] min-[600px]:text-[1.25rem] text-body leading-relaxed max-w-[640px] mb-8">
              {supporting}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <ActionLink href={isDE ? '/de/order' : '/en/order'} variant="primary">
                {isDE ? 'Jetzt bestellen' : 'Order now'}
              </ActionLink>
              <ActionLink href={isDE ? '/de#pricing' : '/en#pricing'} variant="secondary">
                {isDE ? 'Formate ansehen' : 'View formats'}
              </ActionLink>
            </div>

            <div className="reading-column text-base text-copy leading-relaxed whitespace-pre-line">
              {isDE ? (
                <>
                  Lass dir die allererste Aufnahme deines Kindes verewigen! Ich bearbeite das Ultraschallbild künstlerisch und hebe es farblich hervor.
                  {'\n'}
                  Auf Leinwand gedruckt, hast du nicht nur eine wunderschöne Erinnerung, sondern auch eine moderne, anschauliche Deko für deine Wohnung.
                  {'\n'}
                  Auf Wunsch mit Namen deines Kindes und Anzahl der Wochen im Mutterleib.
                </>
              ) : (
                <>
                  Let the very first image of your child live forever! I artistically enhance your ultrasound image and bring it to life with colour.
                  {'\n'}
                  Printed on canvas, you&apos;ll have not just a beautiful memory, but a modern, striking piece of décor for your home.
                  {'\n'}
                  Optionally personalised with your child&apos;s name and number of weeks in the womb.
                </>
              )}
            </div>
          </div>

          <div className="relative h-96 lg:h-96 min-w-0">
            <Image
              src="/images/ultrasound.avif"
              alt={isDE ? 'Künstlerisch bearbeitetes Ultraschallbild als Beispiel' : 'Example of an artistically enhanced ultrasound image'}
              fill
              className="object-cover rounded-lg shadow-lg"
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
