import type { ReactNode } from 'react';

// One card style for the fact cards and the step cards: no border, soft shadow, 12px radius, 24px padding.
const CARD_CLASSES = 'h-full rounded-xl bg-surface p-6 shadow-sm transition hover:shadow-md';

export default function InfoCard({
  as: Tag = 'div',
  className = '',
  children,
}: {
  as?: 'div' | 'li';
  className?: string;
  children: ReactNode;
}) {
  return <Tag className={`${CARD_CLASSES} ${className}`.trim()}>{children}</Tag>;
}
