import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from './Hero';
import { digitalProduct } from '@/content/products';
import Gallery from './Gallery';
import IntroSection from './IntroSection';

const path = { current: '/en' };
vi.mock('next/navigation', () => ({ usePathname: () => path.current }));
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { src, alt, sizes } = props as Record<string, string>;
    // eslint-disable-next-line @next/next/no-img-element -- test double for next/image
    return <img src={String(src)} alt={String(alt)} data-sizes={String(sizes ?? '')} />;
  },
}));

describe('Hero and intro copy', () => {
  it('renders the supporting line exactly once (English)', () => {
    path.current = '/en';
    render(<Hero />);
    // The digital file is not sold, so the line names only the canvas.
    expect(
      screen.getAllByText(
        "I turn your baby's ultrasound image into a colourful piece of art on canvas.",
      ),
    ).toHaveLength(1);
  });

  it('renders the supporting line exactly once (German)', () => {
    path.current = '/de';
    render(<Hero />);
    expect(
      screen.getAllByText(
        'Ich verwandle das Ultraschallbild deines Babys in ein farbenfrohes Kunstwerk auf Leinwand.',
      ),
    ).toHaveLength(1);
  });

  it('brings back the digital wording when the digital file is made available', () => {
    path.current = '/de';
    digitalProduct.available = true;
    try {
      render(<Hero />);
      expect(
        screen.getAllByText(
          'Ich verwandle das Ultraschallbild deines Kindes in ein farbiges Kunstwerk, digital oder auf Leinwand.',
        ),
      ).toHaveLength(1);
    } finally {
      digitalProduct.available = false;
    }
  });

  it('shows the intro sentence once, in the intro section only', () => {
    path.current = '/de';
    render(
      <>
        <Hero />
        <IntroSection />
      </>,
    );
    expect(
      screen.getAllByText(
        /Die ersten Einblicke in das kleine Wunder unter deinem Herzen sind etwas ganz Besonderes\./,
      ),
    ).toHaveLength(1);
  });
});

describe('image alt texts', () => {
  it('hero image has a German alt text on German pages', () => {
    path.current = '/de';
    render(<Hero />);
    expect(
      screen.getByAltText('Künstlerisch bearbeitetes Ultraschallbild als Beispiel'),
    ).toBeInTheDocument();
  });

  it('hero image has an English alt text on English pages', () => {
    path.current = '/en';
    render(<Hero />);
    expect(
      screen.getByAltText('Example of an artistically enhanced ultrasound image'),
    ).toBeInTheDocument();
  });

  it('gallery images have localised alt texts and a sizes attribute', () => {
    path.current = '/en';
    const { container } = render(<Gallery />);
    expect(
      screen.getByAltText('Artistically enhanced ultrasound image, example 1'),
    ).toBeInTheDocument();
    expect(
      screen.getByAltText('Artistically enhanced ultrasound image, example 2'),
    ).toBeInTheDocument();
    container.querySelectorAll('img').forEach((img) => {
      expect(img.getAttribute('data-sizes')).toContain('vw');
    });
  });

  it('gallery images have German alt texts on German pages', () => {
    path.current = '/de';
    render(<Gallery />);
    expect(
      screen.getByAltText('Künstlerisch bearbeitetes Ultraschallbild, Beispiel 1'),
    ).toBeInTheDocument();
  });
});
