import { fontClassNames } from '@/lib/fonts';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <html lang={locale} className={fontClassNames} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-white">{children}</body>
    </html>
  );
}
