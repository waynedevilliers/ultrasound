import Link from 'next/link';

export type Crumb = { label: string; href?: string };

// Breadcrumb trail for subpages, e.g. "Startseite | Bestellen".
// The current page is the last item and carries aria-current.
export default function Breadcrumb({ items, label }: { items: Crumb[]; label: string }) {
  return (
    <nav aria-label={label} className="container-site pt-6">
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-copy">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-3">
            {index > 0 && (
              <span aria-hidden="true" className="text-body">
                |
              </span>
            )}
            {item.href ? (
              <Link href={item.href} className="underline underline-offset-4 hover:text-ink">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink font-semibold">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
