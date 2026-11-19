// Privacy scan: records what the site stores in the browser and which outside servers it contacts.
// Usage (production build running): npm run privacy-scan -- http://localhost:3000
// Writes docs/reviews/privacy/result.json. It only loads pages and clicks the language switch.
// It never submits the order form and never sends an email.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const baseUrl = process.argv[2];
if (!baseUrl) {
  console.error('Give the base URL, for example: npm run privacy-scan -- http://localhost:3000');
  process.exit(1);
}
const origin = new URL(baseUrl).origin;
const outDir = join(process.cwd(), 'docs/reviews/privacy');

// Pages come from content/routes.ts: every route without an anchor, in both languages.
async function routePaths() {
  const source = await readFile(join(process.cwd(), 'content/routes.ts'), 'utf8');
  const paths = new Set();
  for (const match of source.matchAll(/\{\s*id:\s*'[^']+',\s*path:\s*'([^']*)'(,\s*anchor:)?/g)) {
    if (!match[2]) paths.add(match[1]);
  }
  return [...paths];
}

async function storage(page) {
  return page.evaluate(() => ({
    localStorage: Object.keys(window.localStorage),
    sessionStorage: Object.keys(window.sessionStorage),
  }));
}

function cookieList(cookies) {
  return cookies.map((c) => ({
    name: c.name,
    domain: c.domain,
    expires: c.expires === -1 ? 'session' : new Date(c.expires * 1000).toISOString(),
  }));
}

// Footer links that a German shop needs. Each is looked up by its link text in either language.
const legalLinks = [
  { id: 'impressum', text: /impressum|legal notice/i },
  { id: 'datenschutz', text: /datenschutz|privacy/i },
  { id: 'agb', text: /\bagb\b|terms/i },
  { id: 'widerruf', text: /widerruf|withdrawal|cancellation/i },
];

async function footerCheck(context, locale) {
  const page = await context.newPage();
  await page.goto(`${origin}/${locale}`, { waitUntil: 'load' });
  const footer = page.locator('footer');
  const result = {};
  for (const link of legalLinks) {
    const anchor = footer.getByRole('link', { name: link.text }).first();
    if ((await anchor.count()) === 0) {
      result[link.id] = { present: false, reachable: false };
      continue;
    }
    const href = await anchor.getAttribute('href');
    const url = new URL(href, origin).toString();
    const response = await page.request.get(url);
    result[link.id] = { present: true, href, status: response.status(), reachable: response.ok() };
  }
  await page.close();
  return result;
}

async function main() {
  try {
    // fetch resolves on 4xx and 5xx too, so an error page must fail here as well.
    const response = await fetch(origin, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch {
    console.error(
      `Not reachable: ${origin}. Build and start the site first (npm run build, npm run start).`,
    );
    process.exit(1);
  }
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();
  const pages = [];
  const footer = {};
  try {
    for (const locale of ['de', 'en']) {
      for (const path of await routePaths()) {
        // A fresh context per page, so each page starts with no cookies or storage.
        const context = await browser.newContext();
        const page = await context.newPage();
        const external = [];
        page.on('request', (request) => {
          const url = new URL(request.url());
          if (url.protocol.startsWith('http') && url.origin !== origin) {
            external.push({ url: request.url(), type: request.resourceType() });
          }
        });
        const url = `${origin}/${locale}${path}`;
        const response = await page.goto(url, { waitUntil: 'networkidle' });
        // An error page would be recorded as a clean scan, so stop instead.
        if (!response?.ok()) {
          throw new Error(`Could not load ${url} (status ${response?.status() ?? 'unknown'})`);
        }
        const before = { cookies: cookieList(await context.cookies()), ...(await storage(page)) };

        // Use the language switch (the button for the other language), then record again.
        const other = locale === 'de' ? 'EN' : 'DE';
        const switchButton = page.getByRole('button', { name: new RegExp(`^${other}$`) }).first();
        let switched = false;
        if ((await switchButton.count()) > 0) {
          await Promise.all([page.waitForLoadState('load'), switchButton.click()]);
          await page.waitForLoadState('networkidle');
          switched = true;
        }
        const after = { cookies: cookieList(await context.cookies()), ...(await storage(page)) };

        pages.push({
          page: url,
          languageSwitchUsed: switched,
          before,
          after,
          externalRequests: external,
        });
        await context.close();
      }
      const context = await browser.newContext();
      footer[locale] = await footerCheck(context, locale);
      await context.close();
    }
  } finally {
    await browser.close();
  }

  const result = {
    generatedAt: new Date().toISOString(),
    baseUrl: origin,
    pages,
    footerLinks: footer,
  };
  await writeFile(join(outDir, 'result.json'), JSON.stringify(result, null, 2) + '\n');

  const cookieNames = new Set(
    pages.flatMap((p) => [...p.before.cookies, ...p.after.cookies].map((c) => c.name)),
  );
  const storageKeys = new Set(
    pages.flatMap((p) => [
      ...p.before.localStorage,
      ...p.after.localStorage,
      ...p.before.sessionStorage,
      ...p.after.sessionStorage,
    ]),
  );
  const externalCount = pages.reduce((sum, p) => sum + p.externalRequests.length, 0);
  console.log(`Wrote docs/reviews/privacy/result.json: ${pages.length} pages.`);
  console.log(
    `Cookies: ${[...cookieNames].join(', ') || 'none'}. Storage keys: ${[...storageKeys].join(', ') || 'none'}. External requests: ${externalCount}.`,
  );
  for (const locale of Object.keys(footer)) {
    console.log(
      `Footer (${locale}): ` +
        Object.entries(footer[locale])
          .map(
            ([id, r]) =>
              `${id} ${r.present ? (r.reachable ? 'ok' : `status ${r.status}`) : 'missing'}`,
          )
          .join(', '),
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
