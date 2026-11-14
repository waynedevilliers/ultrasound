import de from '@/messages/de.json';
import en from '@/messages/en.json';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';

// TODO(client): Impressum and Datenschutz text is a placeholder. Needs the operator's legal entity, address, contact and privacy details (see messages legal.*).
export type LegalKey = 'impressum' | 'datenschutz';

export default function LegalPage({ locale, page }: { locale: string; page: LegalKey }) {
  const copy = (locale === 'de' ? de : en).legal[page];
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Breadcrumb
        label={locale === 'de' ? 'Brotkrumen' : 'Breadcrumb'}
        items={[
          { label: locale === 'de' ? 'Startseite' : 'Home', href: `/${locale}` },
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
