import { notFound } from 'next/navigation';
import { fontClassNames } from '@/lib/fonts';

const SUPPORTED_LOCALES = ['de', 'en'];

// Both languages are built ahead of time as static pages.
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Only the two supported languages exist; any other address is not found.
  if (!SUPPORTED_LOCALES.includes(locale)) notFound();
  return (
    <html lang={locale} className={fontClassNames} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-surface">{children}</body>
    </html>
  );
}
