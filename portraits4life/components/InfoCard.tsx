import type { ReactNode } from 'react';

// One card style for the fact cards and the step cards: no border, soft shadow, 12px radius, 24px padding.
const CARD_CLASSES = 'h-full rounded-xl bg-surface p-6 shadow-sm transition hover:shadow-md';
// The pricing cards: a 2px border that turns brand pink on hover.
const BORDERED_CLASSES = 'h-full rounded-xl bg-surface p-6 border-2 border-line transition hover:border-brand';

export default function InfoCard({
  as: Tag = 'div',
  variant = 'default',
  className = '',
  children,
}: {
  as?: 'div' | 'li';
  variant?: 'default' | 'bordered';
  className?: string;
  children: ReactNode;
}) {
  const base = variant === 'bordered' ? BORDERED_CLASSES : CARD_CLASSES;
  return <Tag className={`${base} ${className}`.trim()}>{children}</Tag>;
}
