import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import About from './About';
import FactsBox from './FactsBox';
import Gallery from './Gallery';
import HowItWorks from './HowItWorks';

const path = vi.hoisted(() => ({ current: '/de' }));
vi.mock('next/navigation', () => ({ usePathname: () => path.current }));

describe('section order links', () => {
  it('each section has one order link to the German order page', () => {
    path.current = '/de';
    for (const element of [
      <About key="a" locale="de" />,
      <FactsBox key="f" />,
      <HowItWorks key="h" />,
      <Gallery key="g" />,
    ]) {
      const { unmount } = render(element);
      expect(screen.getByRole('link', { name: 'Jetzt bestellen' })).toHaveAttribute(
        'href',
        '/de/order',
      );
      unmount();
    }
  });

  it('links to the English order page in each section on English pages', () => {
    path.current = '/en';
    for (const element of [
      <About key="a" locale="en" />,
      <FactsBox key="f" />,
      <HowItWorks key="h" />,
      <Gallery key="g" />,
    ]) {
      const { unmount } = render(element);
      expect(screen.getByRole('link', { name: 'Order now' })).toHaveAttribute('href', '/en/order');
      unmount();
    }
  });
});
