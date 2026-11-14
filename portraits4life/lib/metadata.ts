import type { Metadata } from 'next';
import de from '@/messages/de.json';
import en from '@/messages/en.json';

export type SeoKey = keyof typeof de.seo;

// Live site address. Without it, canonical and sitemap links cannot be absolute.
// TODO(client): set SITE_URL on Vercel to the live domain.
export const SITE_URL = process.env.SITE_URL || undefined;

export function seoCopy(locale: string, key: SeoKey): { title: string; description: string } {
  const messages = locale === 'de' ? de : en;
  return messages.seo[key];
}

// One helper for every page: title, description, Open Graph, Twitter, canonical and German/English alternates.
export function pageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const canonical = `/${locale}${path}`;
  return {
    metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
    title,
    description,
    alternates: {
      canonical,
      languages: {
        de: `/de${path}`,
        en: `/en${path}`,
        'x-default': `/de${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Portraits 4 Life',
      locale: locale === 'de' ? 'de_DE' : 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}
