import ActionLink from '@/components/ActionLink';
import { getCopy, type Locale } from '@/lib/copy';
import { routeHref, routes } from '@/content/routes';

// TODO(client): approve the closing text and the question line (DE and EN).
export default function ContactSection({ locale }: { locale: Locale }) {
  const { contact } = getCopy(locale);
  const orderRoute = routes.find((route) => route.id === 'order');
  const orderHref = orderRoute ? routeHref(locale, orderRoute) : `/${locale}/order`;

  return (
    <section
      id="kontakt"
      aria-labelledby="kontakt-title"
      className="section-y bg-gradient-to-r from-dark-deep to-dark-alt"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 id="kontakt-title" className="font-display heading-xl font-bold mb-6 text-white">
          {contact.title}
        </h2>
        <p className="text-lg text-on-dark-soft mb-4">{contact.lead}</p>

        <p className="text-xl text-on-dark-soft mb-8">{contact.description}</p>

        <ActionLink href={orderHref} variant="primary">
          {contact.cta}
        </ActionLink>

        <p className="mt-8 text-base text-on-dark-soft">
          {contact.questions}{' '}
          <a
            href={`mailto:${contact.email}`}
            className="text-brand-light underline underline-offset-4 hover:text-brand-on-dark transition"
          >
            {contact.email}
          </a>
        </p>
      </div>
    </section>
  );
}
