import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ContactSection from './ContactSection';

vi.mock('next/navigation', () => ({ usePathname: () => '/de' }));

describe('ContactSection', () => {
  it('links the question line to the mail address and keeps the closing text', () => {
    render(<ContactSection locale="de" />);
    expect(screen.getByText('Lade dein Ultraschallbild hoch. Ich prüfe es und melde mich bei dir.')).toBeInTheDocument();
    const mail = screen.getByRole('link', { name: 'portraits4life.art@gmail.com' });
    expect(mail).toHaveAttribute('href', 'mailto:portraits4life.art@gmail.com');
  });
});
