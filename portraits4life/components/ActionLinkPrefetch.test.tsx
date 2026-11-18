import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActionLink from './ActionLink';

// Next's Link is replaced by a plain anchor that records the prefetch setting it receives.
vi.mock('next/link', () => ({
  default: ({
    href,
    prefetch,
    children,
    ...rest
  }: {
    href: string;
    prefetch?: boolean;
    children: React.ReactNode;
  }) => (
    <a href={href} data-prefetch={String(prefetch)} {...rest}>
      {children}
    </a>
  ),
}));

describe('ActionLink prefetch', () => {
  it('passes prefetch=false to an internal link, so the page is not downloaded in advance', () => {
    render(
      <ActionLink href="/de/order" prefetch={false}>
        Bestellen
      </ActionLink>,
    );
    expect(screen.getByRole('link', { name: 'Bestellen' })).toHaveAttribute(
      'data-prefetch',
      'false',
    );
  });

  it('leaves the default prefetch behaviour when no setting is given', () => {
    render(<ActionLink href="/de/order">Bestellen</ActionLink>);
    expect(screen.getByRole('link', { name: 'Bestellen' })).toHaveAttribute(
      'data-prefetch',
      'undefined',
    );
  });
});
