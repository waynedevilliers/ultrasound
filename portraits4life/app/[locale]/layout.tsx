import { fontClassNames } from '@/lib/fonts';
import { isComingSoon } from '@/lib/site-mode';
import ComingSoon from '@/components/ComingSoon';

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
      <body className="min-h-full flex flex-col bg-surface">
        {isComingSoon() ? <ComingSoon locale={locale} /> : children}
      </body>
    </html>
  );
}
