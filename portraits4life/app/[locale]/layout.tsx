import { NextIntlClientProvider } from 'next-intl';
import enMessages from '@/messages/en.json';
import deMessages from '@/messages/de.json';

const messagesMap = {
  en: enMessages,
  de: deMessages,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = messagesMap[locale as keyof typeof messagesMap] || enMessages;

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
    >
      {children}
    </NextIntlClientProvider>
  );
}
