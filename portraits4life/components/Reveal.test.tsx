import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Reveal from './Reveal';

describe('Reveal', () => {
  it('keeps its children in the document', () => {
    render(
      <Reveal>
        <p>Scroll content</p>
      </Reveal>
    );
    expect(screen.getByText('Scroll content')).toBeInTheDocument();
  });

  it('is visible straight away where IntersectionObserver is not available', () => {
    const { container } = render(
      <Reveal>
        <p>Content</p>
      </Reveal>
    );
    expect(container.firstElementChild).toHaveClass('is-visible');
  });
});
