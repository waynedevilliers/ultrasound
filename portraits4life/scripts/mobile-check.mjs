// Mobile check: measures the phone view and saves key screens.
// Usage (dev server or site already running): npm run mobile-check -- http://localhost:3000
// Writes docs/reviews/mobile/result.json and screenshots to docs/reviews/mobile/.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const baseUrl = process.argv[2];
if (!baseUrl) {
  console.error('Give the base URL, for example: npm run mobile-check -- http://localhost:3000');
  process.exit(1);
}

const outDir = join(process.cwd(), 'docs/reviews/mobile');
const pages = [
  { path: '/de', name: 'landing-de' },
  { path: '/en', name: 'landing-en' },
  { path: '/de/order', name: 'order-de' },
  { path: '/en/order', name: 'order-en' },
];
const sizes = [
  { width: 375, height: 667 },
  { width: 320, height: 568 },
];

// Runs inside the page. Returns the numbers for one page at one size.
function measure() {
  const visible = (el) => {
    if (el.closest('[inert]')) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0)
      return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const selectorOf = (el) => {
    const cls =
      typeof el.className === 'string' && el.className
        ? '.' + el.className.trim().split(/\s+/)[0]
        : '';
    return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + cls;
  };
  const textOf = (el) =>
    (el.innerText || el.value || el.getAttribute('aria-label') || '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 50);
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Sideways scrolling: the page is wider than the screen, or a visible element sticks out.
  const wide = [...document.querySelectorAll('body *')]
    .filter((el) => visible(el) && el.getBoundingClientRect().right > vw + 1)
    .slice(0, 5)
    .map((el) => ({
      selector: selectorOf(el),
      right: Math.round(el.getBoundingClientRect().right),
    }));
  const sideways = { scrolls: document.documentElement.scrollWidth > vw, widerThanViewport: wide };

  // Above the fold: headline, supporting line, order button, part of the image.
  const h1 = document.querySelector('h1');
  const inside = (el) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= vh && visible(el);
  };
  const supporting = document.querySelector('h1 ~ p');
  const orderVisible = [...document.querySelectorAll('[data-variant="primary"]')].find(
    (el) =>
      visible(el) && el.getBoundingClientRect().top < vh && el.getBoundingClientRect().bottom > 0,
  );
  const image = [...document.querySelectorAll('img')].find(
    (img) =>
      visible(img) &&
      img.getBoundingClientRect().width > 50 &&
      img.getBoundingClientRect().top < vh &&
      img.getBoundingClientRect().bottom > 0,
  );
  const aboveFold = {
    h1: inside(h1),
    supportingLine: inside(supporting),
    orderButton: Boolean(orderVisible) && orderVisible.getBoundingClientRect().bottom <= vh,
    imagePart: Boolean(image),
  };

  // Tap targets: links, buttons and form controls.
  const targets = [
    ...document.querySelectorAll(
      'a[href], button, input:not([type=hidden]), select, textarea, [role="button"]',
    ),
  ].filter(visible);
  const smallTargets = targets
    .map((el) => ({ el, r: el.getBoundingClientRect() }))
    .filter(({ r }) => r.width < 44 || r.height < 44)
    .slice(0, 60)
    .map(({ el, r }) => ({
      text: textOf(el),
      selector: selectorOf(el),
      width: Math.round(r.width),
      height: Math.round(r.height),
    }));

  // Targets closer than 8px (not counting an element inside another).
  const closeTargets = [];
  const rects = targets.map((el) => ({ el, r: el.getBoundingClientRect() }));
  for (let i = 0; i < rects.length && closeTargets.length < 40; i++) {
    for (let j = i + 1; j < rects.length && closeTargets.length < 40; j++) {
      const a = rects[i],
        b = rects[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const gapX = Math.max(a.r.left - b.r.right, b.r.left - a.r.right);
      const gapY = Math.max(a.r.top - b.r.bottom, b.r.top - a.r.bottom);
      const gap = Math.max(gapX, gapY);
      if (gap < 8)
        closeTargets.push({
          a: textOf(a.el) || selectorOf(a.el),
          b: textOf(b.el) || selectorOf(b.el),
          gap: Math.round(gap),
        });
    }
  }

  // Small text: visible text under 16px. Labels marked data-small-ok are left out.
  const smallText = [];
  for (const el of document.querySelectorAll('body *')) {
    if (smallText.length >= 60) break;
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!hasText || !visible(el) || el.closest('[data-small-ok]')) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size < 16) smallText.push({ text: textOf(el), selector: selectorOf(el), fontSize: size });
  }

  // Overlaps inside the sticky bar.
  const bar = document.querySelector('nav.sticky');
  const overlaps = [];
  if (bar) {
    const items = [...bar.querySelectorAll('*')].filter(visible);
    for (let i = 0; i < items.length && overlaps.length < 20; i++) {
      for (let j = i + 1; j < items.length && overlaps.length < 20; j++) {
        const a = items[i],
          b = items[j];
        if (a.contains(b) || b.contains(a)) continue;
        const ra = a.getBoundingClientRect(),
          rb = b.getBoundingClientRect();
        const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
        const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        if (w > 1 && h > 1)
          overlaps.push({ a: textOf(a) || selectorOf(a), b: textOf(b) || selectorOf(b) });
      }
    }
  }

  // Primary order buttons visible in the first screen.
  const primaryInFirstScreen = [...document.querySelectorAll('[data-variant="primary"]')]
    .filter(
      (el) =>
        visible(el) && el.getBoundingClientRect().top < vh && el.getBoundingClientRect().bottom > 0,
    )
    .map((el) => ({ text: textOf(el), href: el.getAttribute('href') || '' }));

  return {
    pageHeight: document.documentElement.scrollHeight,
    sideways,
    aboveFold,
    orderButtons: { count: primaryInFirstScreen.length, items: primaryInFirstScreen },
    smallTargets: { count: smallTargets.length, items: smallTargets },
    closeTargets: { count: closeTargets.length, items: closeTargets },
    smallText: { count: smallText.length, items: smallText },
    overlaps: { count: overlaps.length, items: overlaps },
  };
}

async function reachable(url) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(5000) });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await reachable(baseUrl))) {
    console.error(`Not reachable: ${baseUrl}. Start the dev server or the built site first.`);
    process.exit(1);
  }
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const runs = [];
  try {
    for (const p of pages) {
      for (const size of sizes) {
        const page = await browser.newPage({ viewport: size });
        await page.goto(baseUrl + p.path, { waitUntil: 'load' });
        await page.waitForTimeout(800);
        runs.push({
          page: p.path,
          size: `${size.width}x${size.height}`,
          ...(await page.evaluate(measure)),
        });
        await page.close();
      }
    }

    // Screenshots at 375x667.
    const shots = [];
    const shot = async (name, action) => {
      const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
      await page.goto(baseUrl + action.path, { waitUntil: 'load' });
      await page.waitForTimeout(700);
      if (action.prepare) await action.prepare(page);
      const file = `${name}.png`;
      if (action.element) {
        await page
          .locator(action.element)
          .first()
          .screenshot({ path: join(outDir, file) });
      } else {
        await page.screenshot({ path: join(outDir, file), fullPage: Boolean(action.fullPage) });
      }
      shots.push(file);
      await page.close();
    };

    await shot('01-landing-first-screen', { path: '/de' });
    await shot('02-menu-open', {
      path: '/de',
      prepare: async (page) => {
        await page.getByRole('button', { name: 'Menü öffnen' }).click();
        await page.waitForTimeout(400);
      },
    });
    await shot('03-faq-open', {
      path: '/de',
      element: '#faq',
      prepare: async (page) => {
        await page.locator('#faq').scrollIntoViewIfNeeded();
        await page.locator('#faq button[aria-expanded]').first().click();
        await page.waitForTimeout(400);
      },
    });
    await shot('04-format-cards', { path: '/de', element: '#pricing' });
    await shot('05-order-form-top', { path: '/de/order' });
    await shot('06-order-form-errors', {
      path: '/de/order',
      prepare: async (page) => {
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(500);
        await page.locator('div[role="alert"][tabindex="-1"]').scrollIntoViewIfNeeded();
      },
    });
    await shot('07-landing-full-page', { path: '/de', fullPage: true });

    const result = { generatedAt: new Date().toISOString(), baseUrl, runs, screenshots: shots };
    await writeFile(join(outDir, 'result.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(
      `Wrote ${runs.length} measurements and ${shots.length} screenshots to docs/reviews/mobile/`,
    );
    for (const run of runs) {
      console.log(
        `${run.page} ${run.size}: height ${run.pageHeight}px, sideways ${run.sideways.scrolls ? 'YES' : 'no'}, ` +
          `h1 ${run.aboveFold.h1 ? 'yes' : 'no'}, order button ${run.aboveFold.orderButton ? 'yes' : 'no'}, ` +
          `small targets ${run.smallTargets.count}, close ${run.closeTargets.count}, small text ${run.smallText.count}, ` +
          `bar overlaps ${run.overlaps.count}, primary buttons on screen ${run.orderButtons.count}`,
      );
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
