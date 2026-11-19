import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Accordion from './Accordion';

const items = [
  { question: 'Erste Frage', content: <p>Erste Antwort</p> },
  { question: 'Zweite Frage', content: <p>Zweite Antwort</p> },
];

describe('Accordion', () => {
  it('shows each question as a button with its answer hidden at first', () => {
    render(<Accordion items={items} />);
    const first = screen.getByRole('button', { name: 'Erste Frage' });
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Erste Antwort')).not.toBeVisible();
  });

  it('opens one answer at a time and closes it again', () => {
    render(<Accordion items={items} />);
    const first = screen.getByRole('button', { name: 'Erste Frage' });
    const second = screen.getByRole('button', { name: 'Zweite Frage' });
    fireEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Erste Antwort')).toBeVisible();
    fireEvent.click(second);
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(second).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(second);
    expect(second).toHaveAttribute('aria-expanded', 'false');
  });
});
