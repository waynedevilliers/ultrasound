import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Header from './Header';

vi.mock('next/navigation', () => ({ usePathname: () => '/de' }));

type Entry = { isIntersecting: boolean };
let heroCallback: ((entries: Entry[]) => void) | null = null;

// Remembers the callback for the hero button only, so the small-logo observer does not interfere.
class FakeObserver {
  private callback: (entries: Entry[]) => void;
  constructor(callback: (entries: Entry[]) => void) {
    this.callback = callback;
  }
  observe(element: Element) {
    if (element.id === 'hero-order') heroCallback = this.callback;
  }
  unobserve() {}
  disconnect() {}
}

afterEach(() => {
  vi.unstubAllGlobals();
  heroCallback = null;
});

describe('bar order button', () => {
  it('hides while the hero order button is on screen and shows once it has scrolled away', () => {
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    render(
      <>
        <div id="hero-order" />
        <Header />
      </>,
    );
    const bar = screen.getByTestId('bar-order');
    act(() => heroCallback?.([{ isIntersecting: true }]));
    expect(bar).toHaveClass('opacity-0');
    expect(bar).toHaveAttribute('aria-hidden', 'true');
    expect(bar).toHaveAttribute('inert');

    act(() => heroCallback?.([{ isIntersecting: false }]));
    expect(bar).toHaveClass('opacity-100');
    expect(bar).not.toHaveAttribute('aria-hidden');
    expect(bar).not.toHaveAttribute('inert');
  });
});
