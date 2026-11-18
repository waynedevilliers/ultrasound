import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Gallery from './Gallery';

vi.mock('next/navigation', () => ({ usePathname: () => '/en' }));

const firstButton = () =>
  screen.getByRole('button', {
    name: 'Enlarge image: Artistically enhanced ultrasound image, example 1',
  });

describe('Gallery enlarged view', () => {
  it('opens the enlarged image from the button and focuses its close button', () => {
    render(<Gallery />);
    fireEvent.click(firstButton());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  });

  it('closes with Escape and returns the focus to the image that opened it', () => {
    render(<Gallery />);
    firstButton().focus();
    fireEvent.click(firstButton());
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(firstButton()).toHaveFocus();
  });

  it('closes with the close button', () => {
    render(<Gallery />);
    fireEvent.click(firstButton());
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps the focus on the close button while the dialog is open (Tab)', () => {
    render(<Gallery />);
    fireEvent.click(firstButton());
    const close = screen.getByRole('button', { name: 'Close' });
    const notPrevented = fireEvent.keyDown(document, { key: 'Tab' });
    expect(notPrevented).toBe(false);
    expect(close).toHaveFocus();
  });
});
