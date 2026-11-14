import type { Metadata } from 'next';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import FactsBox from '@/components/FactsBox';
import IntroSection from '@/components/IntroSection';
import HowItWorks from '@/components/HowItWorks';
import Gallery from '@/components/Gallery';
import PricingTiers from '@/components/PricingTiers';
import About from '@/components/About';
import FAQ from '@/components/FAQ';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import JsonLd from '@/components/JsonLd';
import { pageMetadata, seoCopy, SITE_URL } from '@/lib/metadata';
import { organizationJsonLd, productJsonLd } from '@/lib/structured-data';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({ locale, path: '', ...seoCopy(locale, 'home') });
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const copy = seoCopy(locale, 'home');
  return (
    <div className="min-h-screen flex flex-col">
      <JsonLd data={organizationJsonLd(SITE_URL)} />
      <JsonLd data={productJsonLd(copy.title, copy.description, locale === 'en' ? 'en' : 'de')} />
      <Header />
      <main className="flex-1">
        <Hero />
        <FactsBox />
        <IntroSection />
        <Reveal>
          <HowItWorks />
        </Reveal>
        <Reveal>
          <Gallery />
        </Reveal>
        <Reveal>
          <PricingTiers />
        </Reveal>
        <Reveal>
          <About locale={locale} />
        </Reveal>
        <Reveal>
          <FAQ />
        </Reveal>
        <Reveal>
          <ContactSection />
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
