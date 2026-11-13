import Link from 'next/link';
import type { ReactNode } from 'react';

export type ActionVariant = 'primary' | 'secondary';
export type ActionLocale = 'de' | 'en';

const newTabText: Record<ActionLocale, string> = {
  de: '(öffnet in neuem Tab)',
  en: '(opens in new tab)',
};

// One set of button styles for the whole site. Primary is filled, secondary is outlined.
const base =
  'inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3 font-bold text-center ' +
  'motion-safe:transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

const variants: Record<ActionVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-strong min-h-(--button-min-height)',
  secondary: 'border-[1.5px] border-brand bg-surface text-brand hover:bg-brand-soft min-h-11',
};

export function buttonClasses(variant: ActionVariant = 'primary', extra = ''): string {
  return [base, variants[variant], extra].filter(Boolean).join(' ');
}

type ActionLinkProps = {
  href: string;
  variant?: ActionVariant;
  locale?: ActionLocale;
  className?: string;
  children: ReactNode;
};

// Internal paths use next/link (locale aware). Anchors and mailto use plain links.
// External URLs open in a new tab with a visible icon and screen reader text.
export default function ActionLink({ href, variant = 'primary', locale = 'de', className = '', children }: ActionLinkProps) {
  const classes = buttonClasses(variant, className);

  if (href.startsWith('mailto:')) {
    return <a href={href} className={classes} data-variant={variant}>{children}</a>;
  }

  if (/^(https?:)?\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} data-variant={variant}>
        {children}
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 4h6v6M20 4l-9 9M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4" />
        </svg>
        <span className="sr-only">{newTabText[locale]}</span>
      </a>
    );
  }

  if (href.startsWith('#')) {
    return <a href={href} className={classes} data-variant={variant}>{children}</a>;
  }

  return <Link href={href} className={classes} data-variant={variant}>{children}</Link>;
}
