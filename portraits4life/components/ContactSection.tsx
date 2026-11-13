'use client';

import { usePathname } from 'next/navigation';
import ActionLink from '@/components/ActionLink';

export default function ContactSection() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');

  return (
    <section id="contact" className="py-20 lg:py-32 bg-gradient-to-r from-dark-deep to-dark-alt">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          className="font-display text-5xl font-bold mb-6 text-white"
        >
          {isDE ? 'Kontakt' : 'Get in Touch'}
        </h2>

        <p className="text-xl text-on-dark-soft mb-8">
          {isDE ? (
            'Hast du Fragen oder besondere Wünsche? Schreib mir eine Nachricht und ich antworte dir so schnell wie möglich!'
          ) : (
            'Have questions or special requests? Send me a message and I\'ll get back to you as soon as possible!'
          )}
        </p>

        <p className="text-2xl font-semibold text-brand-light mb-10">
          portraits4life.art@gmail.com
        </p>

        <ActionLink href={isDE ? '/de/order' : '/en/order'} variant="secondary">
          {isDE ? 'Jetzt Kontakt aufnehmen' : 'Contact me'}
        </ActionLink>
      </div>
    </section>
  );
}
