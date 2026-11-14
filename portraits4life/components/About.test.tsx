import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import About from './About';

describe('About', () => {
  it('shows the German title and photo placeholder', () => {
    render(<About locale="de" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Über Portraits 4 Life' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Porträt/ })).toHaveTextContent('Foto folgt');
  });

  it('shows the English title for the English locale', () => {
    render(<About locale="en" />);
    expect(screen.getByRole('heading', { level: 2, name: 'About Portraits 4 Life' })).toBeInTheDocument();
  });
});
