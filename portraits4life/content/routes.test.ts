import { describe, expect, it } from 'vitest';
import { footerRoutes, locales, menuRoutes, routeHref, routes, sitemapRoutes } from './routes';

describe('routes', () => {
  it('has unique ids', () => {
    const ids = routes.map((route) => route.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps the main menu to five items or fewer', () => {
    expect(menuRoutes().length).toBeLessThanOrEqual(5);
  });

  it('builds a locale-aware href for every locale', () => {
    expect(routeHref('de', routes[1])).toBe('/de/order');
    expect(routeHref('en', routes[2])).toBe('/en#pricing');
  });

  it('puts legal pages in the footer, not the main menu', () => {
    for (const route of footerRoutes().filter((r) => r.id === 'impressum' || r.id === 'datenschutz')) {
      expect(route.menu).toBe(false);
    }
  });

  it('lists every page route in the sitemap (sitemap is built in Step 13)', () => {
    const pageRoutes = routes.filter((route) => !route.anchor);
    for (const route of pageRoutes) {
      expect(sitemapRoutes()).toContainEqual(route);
    }
  });

  it('supports both locales', () => {
    expect(locales).toEqual(['de', 'en']);
  });
});
