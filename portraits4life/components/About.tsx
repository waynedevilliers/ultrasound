import Image from 'next/image';
import { getCopy } from '@/lib/copy';
import ActionLink from '@/components/ActionLink';

// TODO(client): replace the draft text with the artist's own story, and add the photo when it arrives.
export default function About({ locale }: { locale: string }) {
  const pageLocale = locale === 'de' ? 'de' : 'en';
  const { about, common } = getCopy(pageLocale);

  return (
    <section id="ueber-mich" className="section-y bg-surface">
      <div className="container-site grid gap-10 md:grid-cols-2 md:items-center">
        <div className="relative aspect-[4/5] max-h-[480px] overflow-hidden rounded-lg border border-line shadow-lg">
          <Image
            src="/images/about_us/luise.avif"
            alt={about.photoAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div>
          <h2 className="font-display heading-xl mb-6 font-bold text-ink">{about.title}</h2>
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph} className="mb-4 leading-relaxed text-copy">
              {paragraph}
            </p>
          ))}
        </div>
        <div className="md:col-span-2 text-center">
          <ActionLink href={`/${pageLocale}/order`} variant="secondary">
            {common.orderNow}
          </ActionLink>
        </div>
      </div>
    </section>
  );
}
