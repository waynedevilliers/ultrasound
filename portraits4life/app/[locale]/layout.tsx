import { notFound } from 'next/navigation';
import { fontClassNames } from '@/lib/fonts';

const SUPPORTED_LOCALES = ['de', 'en'];

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
