import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Hero from './Hero';
import FactsBox from './FactsBox';
import IntroSection from './IntroSection';
import HowItWorks from './HowItWorks';
import Gallery from './Gallery';
import PricingTiers from './PricingTiers';
import About from './About';
import FAQ from './FAQ';
import ContactSection from './ContactSection';

const pathname = { value: '/de' };
const localeNow = () => pathname.value.startsWith('/en') ? 'en' : 'de';
vi.mock('next/navigation', () => ({ usePathname: () => pathname.value }));

function Landing() {
  return (
    <>
      <Hero locale={localeNow()} />
      <FactsBox locale={localeNow()} />
      <IntroSection locale={localeNow()} />
      <Gallery />
      <HowItWorks locale={localeNow()} />
      <PricingTiers locale={localeNow()} />
      <About locale={pathname.value.slice(1)} />
      <FAQ />
      <ContactSection locale={localeNow()} />
    </>
  );
}

describe('landing page copy', () => {
  beforeEach(() => {
    pathname.value = '/de';
  });

  it('makes no claim of manual work in German', () => {
    render(<Landing />);
    expect(screen.queryByText(/von Hand/)).toBeNull();
    expect(screen.queryByText(/handgemacht|handgefertigt|per Hand/i)).toBeNull();
  });

  it('makes no claim of manual work in English', () => {
    pathname.value = '/en';
    render(<Landing />);
    expect(screen.queryByText(/by hand|handmade/i)).toBeNull();
  });

  it('no longer shows the old intro sentence on the landing page', () => {
    render(<Landing />);
    expect(screen.queryByText(/Schnee von gestern/)).toBeNull();
  });
});
