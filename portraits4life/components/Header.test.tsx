import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Header from './Header';

vi.mock('next/navigation', () => ({ usePathname: () => '/en' }));
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { src, alt, width, height, className } = props as Record<string, string | number>;
    // eslint-disable-next-line @next/next/no-img-element -- test double for next/image
    return <img src={String(src)} alt={String(alt)} width={width} height={height} className={String(className)} />;
  },
}));

describe('Header mobile menu', () => {
  it('starts closed and opens with the menu button', () => {
    render(<Header />);
    const button = screen.getByRole('button', { name: 'Open menu' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument();
  });

  it('closes when Escape is pressed', () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes when a link in the panel is clicked', () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const panel = document.querySelectorAll('nav[aria-label="Main menu"]')[1] as HTMLElement;
    fireEvent.click(panel.querySelector('a[href="/en/order"]') as HTMLElement);
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('links point to the current locale and sections', () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const panel = document.querySelectorAll('nav[aria-label="Main menu"]')[1] as HTMLElement;
    const hrefs = Array.from(panel.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/en', '/en/order', '#pricing', '#contact']);
  });
});
