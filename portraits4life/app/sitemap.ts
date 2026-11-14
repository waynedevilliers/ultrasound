import type { MetadataRoute } from 'next';
import { locales, routeHref, sitemapRoutes } from '@/content/routes';
import { SITE_URL } from '@/lib/metadata';

// One entry per page and language, built from the same route list as the menu and footer.
export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_URL) return [];
  const origin = SITE_URL.replace(/\/$/, '');
  return sitemapRoutes().flatMap((route) =>
    locales.map((locale) => ({
      url: `${origin}${routeHref(locale, route)}`,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${origin}${routeHref(l, route)}`])),
      },
    }))
  );
}
