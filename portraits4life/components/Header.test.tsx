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

function panelLinks(): HTMLAnchorElement[] {
  const lists = document.querySelectorAll('nav ul');
  const panel = lists[lists.length - 1];
  return Array.from(panel.querySelectorAll('a')) as HTMLAnchorElement[];
}

describe('Header menu bar', () => {
  it('has one navigation landmark for desktop and mobile', () => {
    render(<Header />);
    expect(screen.getAllByRole('navigation', { name: 'Main menu' })).toHaveLength(1);
  });

  it('starts closed and opens with the menu button', () => {
    render(<Header />);
    const button = screen.getByRole('button', { name: 'Open menu' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument();
  });

  it('closes when Escape is pressed and returns focus to the button', () => {
    render(<Header />);
    const button = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(button);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });

  it('closes when a link in the panel is clicked', () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    fireEvent.click(panelLinks().find((a) => a.getAttribute('href') === '/en/order') as HTMLElement);
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes when the user clicks outside the menu', () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    fireEvent.pointerDown(document.body);
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('links point to the current locale and sections', () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const hrefs = panelLinks().map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/en', '/en/order', '/en#pricing', '/en#beispiele', '/en#contact']);
  });

  it('marks the current page with aria-current on the home page', () => {
    render(<Header />);
    const desktop = document.querySelectorAll('nav ul')[0];
    const home = desktop.querySelector('a[href="/en"]');
    expect(home).toHaveAttribute('aria-current', 'page');
    expect(desktop.querySelector('a[href="/en/order"]')).not.toHaveAttribute('aria-current');
  });
});

describe('Header small logo', () => {
  it('reserves space for the small logo and keeps it hidden until the big logo scrolls away', () => {
    render(<Header />);
    const compact = screen.getByTestId('compact-logo');
    expect(compact).toHaveAttribute('href', '/en');
    expect(compact).toHaveAttribute('aria-hidden', 'true');
    expect(compact).toHaveAttribute('tabindex', '-1');
    expect(compact.className).toContain('opacity-0');
  });
});
