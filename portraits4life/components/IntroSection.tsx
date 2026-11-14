'use client';

import { usePathname } from 'next/navigation';
import ActionLink from '@/components/ActionLink';
import { getCopy, localeOf } from '@/lib/copy';

// The emotional text below the hero, ending with the primary order button.
// TODO(client): approve the intro title and wording; the title is new.
export default function IntroSection() {
  const pathname = usePathname();
  const locale = localeOf(pathname);
  const isDE = locale === 'de';
  const { intro, hero } = getCopy(locale);

  return (
    <section className="section-y bg-surface">
      <div className="container-site">
        <h2 className="font-display heading-xl font-bold text-center mb-10 text-ink">{intro.title}</h2>
        <div className="reading-column space-y-5 text-lg text-body leading-relaxed">
          {intro.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-10 text-center">
          <ActionLink href={isDE ? '/de/order' : '/en/order'} variant="primary">
            {hero.cta_order}
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
