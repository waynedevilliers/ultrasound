import de from '@/messages/de.json';
import en from '@/messages/en.json';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export type LegalKey = 'impressum' | 'datenschutz';

export default function LegalPage({ locale, page }: { locale: string; page: LegalKey }) {
  const copy = (locale === 'de' ? de : en).legal[page];
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-display text-4xl font-bold mb-6 text-gray-900">{copy.title}</h1>
        <p className="text-gray-600 leading-relaxed">{copy.intro}</p>
      </main>
      <Footer />
    </div>
  );
}
