import de from '@/messages/de.json';
import en from '@/messages/en.json';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import JsonLd from '@/components/JsonLd';
import { SITE_URL } from '@/lib/metadata';
import { breadcrumbJsonLd, organizationJsonLd } from '@/lib/structured-data';

// TODO(client): Impressum and Datenschutz text is a placeholder. Needs the operator's legal entity, address, contact and privacy details (see messages legal.*).
export type LegalKey = 'impressum' | 'datenschutz';

export default function LegalPage({ locale, page }: { locale: string; page: LegalKey }) {
  const copy = (locale === 'de' ? de : en).legal[page];
  const common = (locale === 'de' ? de : en).common;
  const homeLabel = common.home;
  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={organizationJsonLd(SITE_URL)} />
      {SITE_URL && (
        <JsonLd
          data={breadcrumbJsonLd([
            { name: homeLabel, url: `${SITE_URL}/${locale}` },
            { name: copy.title, url: `${SITE_URL}/${locale}/${page}` },
          ])}
        />
      )}
      <Header />
      <Breadcrumb
        label={common.breadcrumb}
        items={[
          { label: homeLabel, href: `/${locale}` },
          { label: copy.title },
        ]}
      />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-display text-3xl sm:text-4xl font-bold mb-6 text-ink break-words">{copy.title}</h1>
        <p className="text-copy leading-relaxed">{copy.intro}</p>
      </main>
      <Footer />
    </div>
  );
}
