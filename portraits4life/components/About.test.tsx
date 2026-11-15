import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import About from './About';

describe('About', () => {
  it('shows the German title and photo placeholder', () => {
    render(<About locale="de" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Über mich' })).toBeInTheDocument();
    const photo = screen.getByRole('img', { name: /Porträt/ });
    expect(photo).toHaveTextContent('Foto folgt');
    expect(photo).toHaveClass('max-h-[480px]');
  });

  it('shows the English title for the English locale', () => {
    render(<About locale="en" />);
    expect(screen.getByRole('heading', { level: 2, name: 'About me' })).toBeInTheDocument();
  });
});
