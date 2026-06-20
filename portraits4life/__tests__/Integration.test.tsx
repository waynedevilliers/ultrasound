import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import PricingTiers from '@/components/PricingTiers';
import FAQ from '@/components/FAQ';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

const { usePathname } = require('next/navigation');

describe('Page Sections Integration', () => {
  describe('Hero Section - English', () => {
    beforeEach(() => {
      usePathname.mockReturnValue('/en');
    });

    it('should render hero section with English content', () => {
      render(<Hero />);
      expect(screen.getByText(/ULTRASOUND ART/i)).toBeInTheDocument();
      expect(screen.getByText(/See the beauty/i)).toBeInTheDocument();
    });

    it('should have English CTA buttons', () => {
      render(<Hero />);
      expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
    });

    it('should have correct English order link', () => {
      render(<Hero />);
      const buttons = screen.getAllByRole('link');
      const orderLink = buttons.find((btn) => btn.getAttribute('href')?.includes('order'));
      expect(orderLink?.getAttribute('href')).toBe('/en/order');
    });
  });

  describe('Hero Section - German', () => {
    beforeEach(() => {
      usePathname.mockReturnValue('/de');
    });

    it('should render hero section with German content', () => {
      render(<Hero />);
      expect(screen.getByText(/ULTRASOUND ART/i)).toBeInTheDocument();
      expect(screen.getByText(/Ein schwarz-weißes Ultraschallbild/i)).toBeInTheDocument();
    });

    it('should have German CTA buttons', () => {
      render(<Hero />);
      expect(screen.getByRole('button', { name: /Jetzt Starten/i })).toBeInTheDocument();
    });

    it('should have correct German order link', () => {
      render(<Hero />);
      const buttons = screen.getAllByRole('link');
      const orderLink = buttons.find((btn) => btn.getAttribute('href')?.includes('order'));
      expect(orderLink?.getAttribute('href')).toBe('/de/order');
    });
  });

  describe('How It Works Section', () => {
    it('should render 3 process steps in English', () => {
      usePathname.mockReturnValue('/en');
      render(<HowItWorks />);
      expect(screen.getByText(/Send Your Image/i)).toBeInTheDocument();
      expect(screen.getByText(/Artistic Enhancement/i)).toBeInTheDocument();
      expect(screen.getByText(/Receive & Enjoy/i)).toBeInTheDocument();
    });

    it('should render 3 process steps in German', () => {
      usePathname.mockReturnValue('/de');
      render(<HowItWorks />);
      expect(screen.getByText(/Bild hochladen/i)).toBeInTheDocument();
      expect(screen.getByText(/Künstlerische Bearbeitung/i)).toBeInTheDocument();
      expect(screen.getByText(/Genießen & Bewahren/i)).toBeInTheDocument();
    });

    it('should have numbered steps', () => {
      usePathname.mockReturnValue('/en');
      const { container } = render(<HowItWorks />);
      expect(container.textContent).toContain('1');
      expect(container.textContent).toContain('2');
      expect(container.textContent).toContain('3');
    });
  });

  describe('Pricing Section', () => {
    it('should display correct pricing in English', () => {
      usePathname.mockReturnValue('/en');
      render(<PricingTiers />);
      expect(screen.getByText(/€30/i) || screen.getByText(/€50/i)).toBeInTheDocument();
      expect(screen.getByText(/€69/i)).toBeInTheDocument();
      expect(screen.getByText(/€89/i)).toBeInTheDocument();
      expect(screen.getByText(/€119/i)).toBeInTheDocument();
    });

    it('should show delivery times', () => {
      usePathname.mockReturnValue('/en');
      render(<PricingTiers />);
      expect(screen.getByText(/1 week/i)).toBeInTheDocument();
      expect(screen.getByText(/1-2 weeks/i)).toBeInTheDocument();
    });

    it('should show German pricing with correct labels', () => {
      usePathname.mockReturnValue('/de');
      render(<PricingTiers />);
      expect(screen.getByText(/Digitaler Download/i)).toBeInTheDocument();
      expect(screen.getByText(/Leinwanddruck/i)).toBeInTheDocument();
    });

    it('should have CTA buttons for each tier', () => {
      usePathname.mockReturnValue('/en');
      render(<PricingTiers />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('FAQ Section', () => {
    it('should render all FAQ questions in English', () => {
      usePathname.mockReturnValue('/en');
      render(<FAQ />);
      expect(screen.getByText(/How long does the artwork take/i)).toBeInTheDocument();
      expect(screen.getByText(/What image formats/i)).toBeInTheDocument();
      expect(screen.getByText(/Can I review the image/i)).toBeInTheDocument();
      expect(screen.getByText(/What are the shipping costs/i)).toBeInTheDocument();
    });

    it('should render all FAQ questions in German', () => {
      usePathname.mockReturnValue('/de');
      render(<FAQ />);
      expect(screen.getByText(/Wie lange dauert die Bearbeitung/i)).toBeInTheDocument();
      expect(screen.getByText(/Welche Bildformate/i)).toBeInTheDocument();
      expect(screen.getByText(/Kann ich das Bild vor dem Druck/i)).toBeInTheDocument();
    });

    it('should expand and collapse FAQ items', async () => {
      const user = userEvent.setup();
      usePathname.mockReturnValue('/en');
      render(<FAQ />);
      const questions = screen.getAllByRole('button');
      await user.click(questions[0]);
      expect(screen.getByText(/Digital artwork typically takes/i)).toBeInTheDocument();
    });

    it('should have contact link in FAQ', () => {
      usePathname.mockReturnValue('/en');
      render(<FAQ />);
      expect(screen.getByText(/Get in touch/i)).toBeInTheDocument();
    });
  });

  describe('Language Consistency', () => {
    it('should switch all sections to German', () => {
      usePathname.mockReturnValue('/de');
      const { rerender } = render(<Hero />);
      expect(screen.getByText(/Ein schwarz-weißes Ultraschallbild/i)).toBeInTheDocument();

      rerender(<HowItWorks />);
      expect(screen.getByText(/Bild hochladen/i)).toBeInTheDocument();

      rerender(<PricingTiers />);
      expect(screen.getByText(/Digitaler Download/i)).toBeInTheDocument();
    });

    it('should switch all sections to English', () => {
      usePathname.mockReturnValue('/en');
      const { rerender } = render(<Hero />);
      expect(screen.getByText(/See the beauty/i)).toBeInTheDocument();

      rerender(<HowItWorks />);
      expect(screen.getByText(/Send Your Image/i)).toBeInTheDocument();

      rerender(<PricingTiers />);
      expect(screen.getByText(/Digital Download/i)).toBeInTheDocument();
    });
  });

  describe('Mobile Layout', () => {
    it('sections should have responsive classes', () => {
      usePathname.mockReturnValue('/en');
      const { container } = render(<HowItWorks />);
      expect(container.querySelector('[class*="grid"]')).toBeInTheDocument();
    });

    it('pricing cards should be responsive', () => {
      usePathname.mockReturnValue('/en');
      const { container } = render(<PricingTiers />);
      expect(container.querySelector('[class*="md:grid"]')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('sections should have proper heading hierarchy', () => {
      usePathname.mockReturnValue('/en');
      const { rerender } = render(<Hero />);
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

      rerender(<HowItWorks />);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should have semantic HTML structure', () => {
      usePathname.mockReturnValue('/en');
      const { container } = render(<Hero />);
      expect(container.querySelector('section')).toBeInTheDocument();
      expect(container.querySelector('main')).toBeFalsy();
    });
  });
});
