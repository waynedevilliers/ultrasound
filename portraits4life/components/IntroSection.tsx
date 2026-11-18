import Image from 'next/image';
import ActionLink from '@/components/ActionLink';
import { getCopy, type Locale } from '@/lib/copy';

// The emotional text below the hero, ending with the primary order button.
// Desktop: text column on the left, image on the right. Mobile: title, image, text, button.
// TODO(client): approve the intro title and wording; the title is new.
// TODO(client): the first paragraph says the editing is digital (no manual claim); approve the wording.
// TODO(client), high priority: photo of a finished canvas on a wall for this section. The image shown is a placeholder from the existing examples.
export default function IntroSection({ locale }: { locale: Locale }) {
  const isDE = locale === 'de';
  const { intro, hero } = getCopy(locale);

  return (
    <section className="section-y bg-surface">
      <div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-16">
        <h2 className="font-display heading-xl font-bold text-center lg:text-left lg:col-start-1 lg:row-start-1 text-ink">
          {intro.title}
        </h2>

        <Image
          src="/images/artwork/ultrasound3.avif"
          alt={intro.imageAlt}
          width={545}
          height={417}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="h-auto w-full rounded-lg shadow-lg lg:col-start-2 lg:row-span-3 lg:row-start-1 self-center"
        />

        <div className="reading-column space-y-5 text-lg text-body leading-relaxed lg:col-start-1 lg:row-start-2">
          {intro.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="text-center lg:text-left lg:col-start-1 lg:row-start-3">
          <ActionLink href={isDE ? '/de/order' : '/en/order'} variant="primary">
            {hero.cta_order}
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
