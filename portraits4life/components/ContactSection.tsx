'use client';

import { usePathname } from 'next/navigation';
import ActionLink from '@/components/ActionLink';
import { getCopy, localeOf } from '@/lib/copy';
import { routeHref, routes } from '@/content/routes';

export default function ContactSection() {
  const pathname = usePathname();
  const locale = localeOf(pathname);
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

        <p className="text-xl text-on-dark-soft mb-8">{contact.description}</p>

        <p className="text-2xl font-semibold text-brand-light mb-10">{contact.email}</p>

        <ActionLink href={orderHref} variant="primary">
          {contact.cta}
        </ActionLink>
      </div>
    </section>
  );
}
