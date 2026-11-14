import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = ['/en', '/de', '/en/order', '/de/order', '/en/impressum', '/de/datenschutz'];

for (const path of pages) {
  test(`${path} loads with one h1 and no horizontal scroll`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('mobile menu opens, navigates and closes', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile project only');
  await page.goto('/en');
  const toggle = page.locator('nav button[aria-controls]');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('navigation', { name: 'Main menu' }).last().getByRole('link', { name: 'Order' }).click();
  await expect(page).toHaveURL(/\/en\/order$/);
});

for (const path of ['/en', '/en/order']) {
  test(`${path} has no axe violations (WCAG 2.2 AA)`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
}

for (const path of pages) {
  test(`${path} logs no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
}

test('landing page has exactly one primary action', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop project only');
  await page.goto('/en');
  await expect(page.locator('[data-variant="primary"]')).toHaveCount(1);
});

test('order page has exactly one primary action (the submit button)', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop project only');
  await page.goto('/en/order');
  await expect(page.locator('[data-variant="primary"]')).toHaveCount(1);
  await expect(page.locator('button[type="submit"][data-variant="primary"]')).toHaveCount(1);
});

test('small logo in the bar fades in after the big logo scrolls away', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop project only');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en');
  const compact = page.getByTestId('compact-logo');
  await expect(compact).toHaveCSS('opacity', '0');
  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(compact).toHaveCSS('opacity', '1');
});

test('hero shows heading, supporting line and primary button without scrolling (375x667)', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile project only');
  await page.goto('/en');
  const heading = page.locator('h1');
  const primary = page.locator('[data-variant="primary"]').first();
  const support = page.locator('section p').first();
  for (const element of [heading, support, primary]) {
    const box = await element.boundingBox();
    expect(box).not.toBeNull();
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(667);
  }
});

test('the root address opens the German site', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop project only');
  await page.goto('/');
  await expect(page).toHaveURL(/\/de$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
});

test('private order photos are not served without a valid signed link', async ({ request, isMobile }) => {
  test.skip(isMobile, 'desktop project only');
  const response = await request.get('/api/orders/files?p=orders/ultrasound-x&exp=1&sig=bad');
  expect(response.status()).toBe(403);
});

test('the photo cleanup job refuses calls without the cron secret', async ({ request, isMobile }) => {
  test.skip(isMobile, 'desktop project only');
  const response = await request.get('/api/cron/cleanup');
  expect(response.status()).toBe(403);
});

test('the order endpoint rejects a request that is not JSON', async ({ request, isMobile }) => {
  test.skip(isMobile, 'desktop project only');
  const response = await request.post('/api/orders', { data: 'not json', headers: { 'Content-Type': 'text/plain' } });
  expect(response.status()).toBe(400);
});

const linkPages = ['/en', '/de', '/en/order', '/de/order', '/en/impressum', '/de/impressum', '/de/datenschutz', '/en/datenschutz'];

for (const path of linkPages) {
  test(`every link on ${path} works (internal, anchors, mailto, external)`, async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop project only');
    await page.goto(path);
    const links = await page.$$eval('a[href]', (anchors) =>
      anchors.map((a) => ({
        href: a.getAttribute('href') ?? '',
        target: a.getAttribute('target'),
        rel: a.getAttribute('rel') ?? '',
        hasId: (id: string) => Boolean(document.getElementById(id)),
      }))
    );
    const broken: string[] = [];
    for (const link of links) {
      if (link.href.startsWith('mailto:')) {
        if (!link.href.includes('@')) broken.push(`bad mailto: ${link.href}`);
      } else if (link.href.startsWith('#')) {
        const id = link.href.slice(1);
        const exists = await page.evaluate((target) => Boolean(document.getElementById(target)), id);
        if (!exists) broken.push(`missing anchor target: ${link.href}`);
      } else if (link.href.startsWith('/')) {
        const response = await page.request.get(link.href.split('#')[0]);
        if (response.status() !== 200) broken.push(`${link.href} -> ${response.status()}`);
      } else if (/^https?:\/\//.test(link.href)) {
        if (link.target !== '_blank' || !link.rel.includes('noopener') || !link.rel.includes('noreferrer')) {
          broken.push(`external link without safe attributes: ${link.href}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });
}
