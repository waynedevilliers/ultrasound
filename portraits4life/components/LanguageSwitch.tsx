'use client';

import { usePathname } from 'next/navigation';
import { getCopy, localeOf } from '@/lib/copy';

// Moves the browser to another address. Kept outside the component.
function navigateTo(url: string) {
  window.location.href = url;
}

// "DE | EN" as plain text, used in the header (light) and the footer (dark).
// layout="rows" lists each language on its own row (used in the phone menu).
export default function LanguageSwitch({
  tone = 'light',
  layout = 'inline',
}: {
  tone?: 'light' | 'dark';
  layout?: 'inline' | 'rows';
}) {
  const pathname = usePathname();
  const locale = localeOf(pathname);
  const { header } = getCopy(locale);
  const dark = tone === 'dark';

  // Switching keeps the current page; only the language prefix changes.
  const switchTo = (newLang: 'de' | 'en') => {
    navigateTo(pathname.replace(/^\/(en|de)/, `/${newLang}`) || `/${newLang}`);
  };

  if (layout === 'rows') {
    return (
      <nav aria-label={header.switchLanguageLabel} className="flex flex-col">
        {(['de', 'en'] as const).map((code) =>
          code === locale ? (
            <span
              key={code}
              aria-current="true"
              className="flex min-h-12 items-center text-lg font-semibold text-brand-strong"
            >
              {code.toUpperCase()}
            </span>
          ) : (
            <button
              key={code}
              type="button"
              onClick={() => switchTo(code)}
              className="flex min-h-12 w-full items-center text-lg font-semibold text-body hover:text-ink"
            >
              {code.toUpperCase()}
            </button>
          ),
        )}
      </nav>
    );
  }

  return (
    <nav
      aria-label={header.switchLanguageLabel}
      className="flex items-center gap-2 text-base font-semibold"
    >
      {(['de', 'en'] as const).map((code, index) => (
        <span key={code} className="flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden="true" className={dark ? 'text-on-dark-soft' : 'text-field'}>
              |
            </span>
          )}
          {code === locale ? (
            <span
              aria-current="true"
              className={`inline-flex min-h-11 min-w-11 items-center justify-center underline underline-offset-4 ${dark ? 'text-brand-on-dark' : 'text-brand-strong'}`}
            >
              {code.toUpperCase()}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => switchTo(code)}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center transition ${dark ? 'text-on-dark-soft hover:text-white' : 'text-copy hover:text-ink'}`}
            >
              {code.toUpperCase()}
            </button>
          )}
        </span>
      ))}
    </nav>
  );
}
