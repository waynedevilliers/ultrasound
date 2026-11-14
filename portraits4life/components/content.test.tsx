import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from './Hero';
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
    expect(screen.getAllByText("I turn your child's ultrasound image into a colourful work of art, as a digital file or on canvas.")).toHaveLength(1);
  });

  it('renders the supporting line exactly once (German)', () => {
    path.current = '/de';
    render(<Hero />);
    expect(screen.getAllByText('Ich verwandle das Ultraschallbild deines Kindes in ein farbiges Kunstwerk, digital oder auf Leinwand.')).toHaveLength(1);
  });

  it('shows the intro sentence once, in the intro section only', () => {
    path.current = '/de';
    render(<><Hero /><IntroSection /></>);
    expect(screen.getAllByText(/Ein schwarz-weißes Ultraschallbild im Miniformat ist Schnee von gestern\./)).toHaveLength(1);
  });
});

describe('image alt texts', () => {
  it('hero image has a German alt text on German pages', () => {
    path.current = '/de';
    render(<Hero />);
    expect(screen.getByAltText('Künstlerisch bearbeitetes Ultraschallbild als Beispiel')).toBeInTheDocument();
  });

  it('hero image has an English alt text on English pages', () => {
    path.current = '/en';
    render(<Hero />);
    expect(screen.getByAltText('Example of an artistically enhanced ultrasound image')).toBeInTheDocument();
  });

  it('gallery images have localised alt texts and a sizes attribute', () => {
    path.current = '/en';
    const { container } = render(<Gallery />);
    expect(screen.getByAltText('Artistically enhanced ultrasound image, example 1')).toBeInTheDocument();
    expect(screen.getByAltText('Artistically enhanced ultrasound image, example 2')).toBeInTheDocument();
    container.querySelectorAll('img').forEach((img) => {
      expect(img.getAttribute('data-sizes')).toContain('vw');
    });
  });

  it('gallery images have German alt texts on German pages', () => {
    path.current = '/de';
    render(<Gallery />);
    expect(screen.getByAltText('Künstlerisch bearbeitetes Ultraschallbild, Beispiel 1')).toBeInTheDocument();
  });
});
