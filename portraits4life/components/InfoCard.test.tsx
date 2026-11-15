import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import InfoCard from './InfoCard';

describe('InfoCard', () => {
  it('uses the shared card style: no border, soft shadow, large radius', () => {
    render(<InfoCard>Text</InfoCard>);
    const card = screen.getByText('Text');
    expect(card).toHaveClass('rounded-xl', 'shadow-sm', 'bg-surface');
    expect(card.className).not.toMatch(/border/);
  });

  it('gives the bordered variant a grey border that turns brand on hover', () => {
    render(<InfoCard variant="bordered">Priced</InfoCard>);
    const card = screen.getByText('Priced');
    expect(card).toHaveClass('border-2', 'border-line', 'hover:border-brand');
    expect(card).not.toHaveClass('hover:shadow-md');
  });

  it('renders as a list item when asked', () => {
    render(
      <ol>
        <InfoCard as="li">Step</InfoCard>
      </ol>,
    );
    expect(screen.getByText('Step').tagName).toBe('LI');
  });
});
