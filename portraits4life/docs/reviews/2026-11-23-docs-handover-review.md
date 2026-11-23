# Review: docs/handover-and-instructions (2026-11-23)

Scope: `git diff main...HEAD`, documentation only (README.md, CLAUDE.md, docs/REMAINING.md, .claude/agents/reviewer.md, .claude/agents/visual-checker.md, .claude/commands/client-list.md, .claude/settings.json, removal of INSTRUCTIONS.md, PROJECT_STATUS.md, TEST_GUIDE.md, repo-root ../CLAUDE.md). Shell started on Node 20.17.0; switched to 22.17.0 with `nvm use` before the npm checks. Build, e2e and Lighthouse skipped as agreed (no code changed).

## Verdict: Needs fixes

## Critical
None.

## Important
1. **.claude/settings.json:6,10,17,18,21,22,23,27, allow list is too broad.** This file is committed, so it applies to every session. `Bash(node *)` and `Bash(npx *)` allow any code to run (`node -e ...`, or any npm package downloaded through npx), so every other limit no longer matters. `npx *` also skips the "exact version, at least two weeks old" rule for dependencies. `git -C *` allows any git command (`git -C . reset --hard`, `git -C . push --force`). `git push *` allows `--force` and pushing to `main`, which goes against "never commit to main". `curl -s *` can send local files out (`-d @.env.development.local`, `-T`). `sed *` allows `sed -i`, which edits files without the Edit tool. `npm install *` adds packages and runs their install scripts. `git checkout *` allows `git checkout -- .`, which throws away work. **Fix:** narrow the rules to the real uses, for example `Bash(npx playwright *)`, `Bash(npx prettier *)`, `Bash(node scripts/*)`, `Bash(curl -sI *)`, `Bash(git push -u origin *)`, `Bash(git checkout -b *)`. Drop `git -C *` and `sed *`, or add a `deny` list with `git push --force*`, `git push * main`, `git reset --hard*` and `sed -i*`.
2. **CLAUDE.md:8 vs CLAUDE.md:46, viewport mismatch.** The Testing line was corrected to 375x667, but the Workflow line still asks for screenshots at **390x844**. visual-checker.md:17, mobile-view and playwright.config.ts all use 375x667. **Fix:** change line 8 to 375x667.
3. **README.md:36 and :65 vs .env.example:1, two different env file names.** README says to copy to `.env.development.local`, but `.env.example` says `.env.local`. `scripts/init-db.js:2` reads only `.env.development.local`. Someone who follows `.env.example` gets `npm run db:init` running with no `POSTGRES_URL`. **Fix:** make `.env.example` line 1 say `.env.development.local` (a one-line comment change), or say in the README that `db:init` needs that exact file.
4. **README.md:290, "the site makes no request to another domain" is wrong.** The order form uploads photos straight from the browser to `*.blob.vercel-storage.com` (the CSP `connect-src` in lib/security-headers.ts:15-20 allows this). This matters for privacy claims, and the datenschutz agent reads the README. **Fix:** "Fonts make no request to another domain; the only outside request is the photo upload to Vercel Blob on the order page."
5. **README.md:192, failure response described wrongly.** `code` is sent only on 500 replies (app/api/orders/route.ts:147,286). A 400 reply has `issues` (field and message) and no code. A 429 reply has neither. **Fix:** describe the three cases: 400 with `issues`, 429 with no code, 500 with `code`.
6. **docs/REMAINING.md, an open item was dropped without being fixed.** The old list had "next-intl is installed but copy is imported as JSON (lib/copy.ts); DECISIONS says next-intl". This is still true: components use `getCopy` from `lib/copy.ts` (ContactSection, Footer, HowItWorks, LanguageSwitch, PricingTiers, ...), and no component calls `useTranslations` or `getTranslations`. DECISIONS.md:116 and CLAUDE.md ("next-intl") still say otherwise. **Fix:** put the item back under "Code, not started", or record a decision that `lib/copy.ts` is the accepted pattern.

## Nice to have
- docs/REMAINING.md:53: the Client Components list leaves out `Accordion`, `Reveal`, `OrderSection` and `UploadArea`. All of them have `'use client'` and all are justified, so this is a wording fix only.
- docs/REMAINING.md: "Unconfirmed promises" ("kostenlos ... senden" in messages/de.json:167,182) and "language switch in Header and Footer" were dropped from the list. The first is now covered by the FAQ confirmation item; say so, so the item is not lost.
- README.md:240: `reference` is shown inside `CREATE TABLE`, but init-db.js adds it with `ALTER TABLE`. The end schema is the same. A short comment would help ("added by ALTER, older rows are empty").
- README.md:102-103: the tree glyphs are wrong (`└──` before `├──`). The tree also leaves out `app/robots.ts`, `app/sitemap.ts` and `i18n.ts`.
- README.md:81: when not on CI, Playwright reuses a server already running on port 3000 (`reuseExistingServer`), so "Builds and starts the site" is only true when nothing is running there.
- README.md:128: `docs/reviews/` is described as the reports folder, but the reports and `docs/reviews/screenshots/` are neither tracked nor ignored (git status lists them all). Decide whether to track them or add them to .gitignore.
- README.md upload section: the allowed types also include `image/heif` (lib/image-rules.ts:9).

## Client TODO list
- Impressum (DE and EN) and the English Datenschutz: still placeholder text (messages/*.json:103,107; LegalPage.tsx:13).
- Datenschutz DE: blob storage provider, Neon details, retention periods, request versus order wording, social links section, Stripe section, print shop name and address (content/legal/datenschutz.de.md:41,46,160,179,188,196,214).
- Prices for 40 x 40 and 50 x 50 (content/products.ts:23,25); the digital price range (DECISIONS:359); shipping countries and costs (content/shipping.ts:2).
- Approval of the copy: Hero, IntroSection, HowItWorks (including the payment order), ContactSection, About (artist story and photo), FAQ answers, PricingTiers (payment methods, delivery times, features, alt texts), OrderForm trust text and consent wording.
- Images: the original ultrasounds for "Vorher" in the Gallery, a canvas-on-wall photo (high priority), a simplified logo.
- Footer: email, copyright year, legal links. SITE_URL and the live domain (route.ts:22, metadata.ts:8). Redirects for old Wix URLs.

## Checked and passed
- All script names in README and CLAUDE.md exist in package.json. CI job names (lint-and-types, test, audit, e2e; lighthouse only on main) match ci.yml.
- The env variable table matches .env.example exactly (9 variables). The production refusal when ORDER_EMAIL or ORDER_FROM_EMAIL is missing matches route.ts.
- The POST /api/orders body matches lib/order-submit.ts `buildOrderPayload` and lib/order-schema.ts: fields, 8-hex requestCode, `orders/` paths, consent literals, honeypot, shipping only for canvas, `DE` code, digital refused. The 201 body and the reference format `P4L-YYMMDD-XXXX` match.
- Rate limits (5 per 15 min for orders, 20 per 15 min for the upload token), 15 MB, the signed-link file route, the cron bearer check and the 30-day cleanup, and vercel.json all match.
- proxy.ts (Next 16 name, rewrites to `/{locale}/coming-soon`, API routes outside the matcher) and app/robots.ts (disallow while COMING_SOON) match the README.
- Mobile check viewports (375x667, 320x568), its output folder (git-ignored) and the privacy-scan usage match the scripts.
- "Done" claims checked in code: the CSP allows Blob; the Gallery is a dialog that closes with Escape; there is no `onboarding@resend.dev`; `order.info` is gone; `generateStaticParams` is in the locale layout; middleware.ts is gone; FormFields.tsx exists; canvas PNGs are about 3 MB as stated.
- Nothing tracked still refers to INSTRUCTIONS.md, PROJECT_STATUS.md, TEST_GUIDE.md or the upgrade plan. The repo-root `instructions.md`, `.github/workflows/ci.yml`, `images/`, `screenshots/` and `reference/` all exist.
- All agents named in the docs are present in .claude/agents/. The "Open questions" section that /client-list reads exists (DECISIONS:148).
- On Node 22: lint clean, type-check clean, 282 of 282 tests pass, Prettier check clean. No secrets in the diff.
