'use client';

import { usePathname } from 'next/navigation';

export default function ContactSection() {
  const pathname = usePathname();
  const isDE = pathname.startsWith('/de');

  return (
    <section id="contact" className="py-20 lg:py-32 bg-gradient-to-r from-slate-900 to-slate-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          className="text-5xl font-bold mb-6 text-white"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          {isDE ? 'Kontakt' : 'Get in Touch'}
        </h2>

        <p className="text-xl text-gray-200 mb-8">
          {isDE ? (
            'Hast du Fragen oder besondere Wünsche? Schreib mir eine Nachricht und ich antworte dir so schnell wie möglich!'
          ) : (
            'Have questions or special requests? Send me a message and I\'ll get back to you as soon as possible!'
          )}
        </p>

        <p className="text-2xl font-semibold text-pink-400 mb-10">
          portraits4life.art@gmail.com
        </p>

        <a
          href={isDE ? '/de/order' : '/en/order'}
          className="inline-block bg-pink-500 text-white px-10 py-4 rounded-lg font-semibold hover:bg-pink-600 transition"
        >
          {isDE ? 'Jetzt Kontakt aufnehmen' : 'Contact Me Now'}
        </a>
      </div>
    </section>
  );
}
