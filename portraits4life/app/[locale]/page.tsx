import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Gallery from '@/components/Gallery';
import PricingTiers from '@/components/PricingTiers';
import FAQ from '@/components/FAQ';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Gallery />
        <PricingTiers />
        <FAQ />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
