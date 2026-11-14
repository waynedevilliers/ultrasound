import { safeJsonLd } from '@/lib/structured-data';

// Renders schema.org data. Only data built by lib/structured-data.ts is passed in, and it is escaped.
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}
