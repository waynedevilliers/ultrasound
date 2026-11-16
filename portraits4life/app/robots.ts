import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/metadata';
import { isComingSoon } from '@/lib/site-mode';

export default function robots(): MetadataRoute.Robots {
  // While the site is in coming-soon mode, search engines are asked to leave it out.
  if (isComingSoon()) return { rules: { userAgent: '*', disallow: '/' } };
  const origin = SITE_URL?.replace(/\/$/, '');
  return {
    rules: { userAgent: '*', allow: '/' },
    ...(origin ? { sitemap: `${origin}/sitemap.xml` } : {}),
  };
}
