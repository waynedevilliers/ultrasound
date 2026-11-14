import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import FAQ from './FAQ';

const pathname = { value: '/de' };
vi.mock('next/navigation', () => ({ usePathname: () => pathname.value }));

describe('FAQ', () => {
  it('opens and closes an answer and reports the state to assistive technology', async () => {
    pathname.value = '/de';
    const user = userEvent.setup();
    render(<FAQ />);
    const question = screen.getByRole('button', { name: 'Wie lange dauert die Bearbeitung?' });
    const answer = screen.getByText(/Die digitale Bearbeitung dauert/);
    expect(question).toHaveAttribute('aria-expanded', 'false');
    expect(answer).not.toBeVisible();

    await user.click(question);
    expect(question).toHaveAttribute('aria-expanded', 'true');
    expect(answer).toBeVisible();

    await user.click(question);
    expect(question).toHaveAttribute('aria-expanded', 'false');
    expect(answer).not.toBeVisible();
  });

  it('shows English questions on the English site', () => {
    pathname.value = '/en';
    render(<FAQ />);
    expect(screen.getByRole('button', { name: 'How long does the artwork take?' })).toBeInTheDocument();
  });
});
