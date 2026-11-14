import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from './Hero';
import Gallery from './Gallery';

const path = { current: '/en' };
vi.mock('next/navigation', () => ({ usePathname: () => path.current }));
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { src, alt, sizes } = props as Record<string, string>;
    // eslint-disable-next-line @next/next/no-img-element -- test double for next/image
    return <img src={String(src)} alt={String(alt)} data-sizes={String(sizes ?? '')} />;
  },
}));

describe('Hero copy', () => {
  it('renders the supporting sentence exactly once (English)', () => {
    path.current = '/en';
    render(<Hero />);
    expect(screen.getAllByText('A tiny black-and-white ultrasound photo is a thing of the past.')).toHaveLength(1);
  });

  it('renders the supporting sentence exactly once (German)', () => {
    path.current = '/de';
    render(<Hero />);
    expect(screen.getAllByText('Ein schwarz-weißes Ultraschallbild im Miniformat ist Schnee von gestern.')).toHaveLength(1);
    expect(screen.queryByText(/Ein schwarz-weißes Ultraschallbild im Miniformat/, { selector: 'div' })).toBeNull();
  });

  it('does not repeat the removed first sentence in the body copy', () => {
    path.current = '/de';
    const { container } = render(<Hero />);
    expect(container.textContent?.split('Ein schwarz-weißes Ultraschallbild im Miniformat').length).toBe(2);
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
