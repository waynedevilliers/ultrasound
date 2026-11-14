import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import FAQ from './FAQ';

vi.mock('next/navigation', () => ({ usePathname: () => '/de' }));

describe('FAQ', () => {
  it('opens and closes an answer when its question is clicked', async () => {
    const user = userEvent.setup();
    render(<FAQ />);
    const question = screen.getByRole('button', { name: /Wie lange dauert die Bearbeitung/ });
    expect(screen.queryByText(/Die digitale Bearbeitung dauert/)).not.toBeInTheDocument();

    await user.click(question);
    expect(screen.getByText(/Die digitale Bearbeitung dauert/)).toBeInTheDocument();

    await user.click(question);
    expect(screen.queryByText(/Die digitale Bearbeitung dauert/)).not.toBeInTheDocument();
  });
});
