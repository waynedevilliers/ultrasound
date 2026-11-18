import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Hero from './Hero';
import IntroSection from './IntroSection';

vi.mock('next/navigation', () => ({ usePathname: () => '/de' }));

describe('intro section', () => {
  it('shows "Auf Wunsch mit Namen" once, in the hero benefit points only', () => {
    render(
      <>
        <Hero locale="de" />
        <IntroSection locale="de" />
      </>,
    );
    const matches = screen.getAllByText(/Auf Wunsch mit Namen/);
    expect(matches).toHaveLength(1);
    expect(matches[0].closest('li')).not.toBeNull();
  });
});
