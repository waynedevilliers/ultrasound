import { getCopy } from '@/lib/copy';

// TODO(client): replace the draft text with the artist's own story, and add the photo when it arrives.
export default function About({ locale }: { locale: string }) {
  const { about } = getCopy(locale === 'de' ? 'de' : 'en');

  return (
    <section id="ueber-mich" className="section-y bg-surface">
      <div className="container-site grid gap-10 md:grid-cols-2 md:items-center">
        <div
          role="img"
          aria-label={about.photoAlt}
          className="flex aspect-[4/5] items-center justify-center rounded-lg border border-line bg-surface-muted p-6 text-center text-copy shadow-lg"
        >
          {about.photoPlaceholder}
        </div>

        <div>
          <h2 className="font-display heading-xl mb-6 font-bold text-ink">{about.title}</h2>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mb-4 leading-relaxed text-copy">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
