// One list of every route. The menu, footer, sitemap and tests read this file.
// Paths are shared by both locales: /de/... and /en/... Anchors are page sections.

export const locales = ['de', 'en'] as const;
export type Locale = (typeof locales)[number];

export type SiteRoute = {
  id: string;
  path: string;
  anchor?: string;
  menu: boolean;
  footer: boolean;
  sitemap: boolean;
};

export const routes: SiteRoute[] = [
  { id: 'home', path: '', menu: true, footer: true, sitemap: true },
  { id: 'order', path: '/order', menu: true, footer: false, sitemap: true },
  { id: 'formats', path: '', anchor: '#pricing', menu: true, footer: false, sitemap: false },
  { id: 'howItWorks', path: '', anchor: '#so-funktionierts', menu: false, footer: false, sitemap: false },
  { id: 'examples', path: '', anchor: '#beispiele', menu: true, footer: false, sitemap: false },
  { id: 'about', path: '', anchor: '#ueber-mich', menu: false, footer: false, sitemap: false },
  { id: 'faq', path: '', anchor: '#faq', menu: false, footer: false, sitemap: false },
  { id: 'contact', path: '', anchor: '#contact', menu: true, footer: false, sitemap: false },
  { id: 'impressum', path: '/impressum', menu: false, footer: true, sitemap: true },
  { id: 'datenschutz', path: '/datenschutz', menu: false, footer: true, sitemap: true },
];

export function routeHref(locale: Locale, route: SiteRoute): string {
  return `/${locale}${route.path}${route.anchor ?? ''}`;
}

export function menuRoutes(): SiteRoute[] {
  return routes.filter((route) => route.menu);
}

export function footerRoutes(): SiteRoute[] {
  return routes.filter((route) => route.footer);
}

export function sitemapRoutes(): SiteRoute[] {
  return routes.filter((route) => route.sitemap);
}
