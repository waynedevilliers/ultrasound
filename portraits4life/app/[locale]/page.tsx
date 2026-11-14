import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Gallery from '@/components/Gallery';
import PricingTiers from '@/components/PricingTiers';
import FAQ from '@/components/FAQ';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import FactsBox from '@/components/FactsBox';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <FactsBox />
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
