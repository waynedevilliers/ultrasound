import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ComingSoon from './ComingSoon';

describe('ComingSoon', () => {
  it('shows the German title and text', () => {
    render(<ComingSoon locale="de" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Bald verfügbar' })).toBeInTheDocument();
    expect(screen.getByText('Die Seite ist bald so weit. Schau bald wieder vorbei.')).toBeInTheDocument();
  });

  it('shows the English title and text', () => {
    render(<ComingSoon locale="en" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Coming soon' })).toBeInTheDocument();
  });
});
