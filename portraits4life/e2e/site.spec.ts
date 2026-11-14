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
