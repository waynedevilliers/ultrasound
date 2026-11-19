import Accordion from '@/components/Accordion';
import { getCopy, type Locale } from '@/lib/copy';
import { routeHref, routes } from '@/content/routes';
import { canvasDeliveryText, digitalDeliveryText } from '@/lib/delivery';
import { IMAGE_FORMAT_LIST } from '@/lib/image-formats';

// TODO(client): the new question about an unsuitable image is a draft answer; confirm it.
// TODO(client): the questions and answers are drafts. Confirm each answer (shipping, preview, refund, file requirements) with the client; see docs/faq-client-review.md. No FAQPage structured data until they are confirmed.
export default function FAQ({ locale }: { locale: Locale }) {
  const contactRoute = routes.find((route) => route.id === 'contact');
  const contactHref = contactRoute ? routeHref(locale, contactRoute) : `/${locale}#kontakt`;

  const faq = getCopy(locale).faq;

  return (
    <section id="faq" className="section-y bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display heading-xl font-bold text-center mb-16 text-ink">
          {faq.title}
        </h2>

        <Accordion
          items={faq.items.map((item) => ({
            question: item.question,
            content: (
              <p className="text-copy leading-relaxed">
                {item.answer
                  .replace('{digital}', digitalDeliveryText(locale))
                  .replace('{canvas}', canvasDeliveryText(locale))
                  .replace('{formats}', IMAGE_FORMAT_LIST[locale === 'de' ? 'de' : 'en'])}
              </p>
            ),
          }))}
        />

        <div className="mt-16 p-8 bg-brand-soft rounded-lg border border-brand-edge text-center">
          <p className="text-body">
            {faq.moreQuestions}{' '}
            <a href={contactHref} className="text-brand-strong font-semibold">
              {faq.moreLink}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
