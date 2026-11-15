import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LanguageSwitch from './LanguageSwitch';

vi.mock('next/navigation', () => ({ usePathname: () => '/de/order' }));

describe('LanguageSwitch', () => {
  it('marks the current language and offers the other as a button', () => {
    render(<LanguageSwitch />);
    expect(screen.getByText('DE')).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'DE' })).toBeNull();
  });
});
