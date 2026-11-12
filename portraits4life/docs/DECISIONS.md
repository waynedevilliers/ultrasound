# Decisions

One entry per decision someone could later question. Each entry: date, status (`done` or `open`), Decision, Why, Considered.

---

## 2026-11-11: Colors stay as they are

- **Status:** done
- **Decision:** No color value changes until the owner decides the brand colors. Brand tokens (`--color-brand`, `--color-brand-strong`) point at the Tailwind v4 default pink that the site renders today.
- **Why:** The owner asked to keep every current color. The pink in `tailwind.config.ts` was never active (Tailwind v4 needs `@config` to load it), so it was removed to avoid two sources of truth.
- **Considered:** Moving the `tailwind.config.ts` hex values (`#ec4899`, `#db2777`) into tokens. Rejected: it would change how the site looks.

## 2026-11-11: Font families stay as they are, loading changes

- **Status:** done
- **Decision:** Geist, Geist Mono and Playfair Display stay. Each is loaded with `next/font` and `display: swap`. Fonts are self-hosted at build time, so no request goes to Google at runtime.
- **Why:** DSGVO. Visitors' browsers should not contact Google servers.
- **Considered:** Hand-downloaded font files in `public/`. Not needed, because `next/font` already self-hosts at build.

## 2026-11-11: Body text uses Geist

- **Status:** done
- **Decision:** Body text uses Geist. `--font-sans` in `app/globals.css` points at `--font-geist-sans`. Before this change, body text rendered in the browser's default serif because the variable referred to itself.
- **Why:** Owner decision. The code always declared Geist as the body font; the serif was a bug. This is the only intended change to how text looks in this step.
- **Considered:** Keeping the browser default serif to keep current rendering. Rejected by the owner.

## 2026-11-11: Public order lookup endpoint removed

- **Status:** done
- **Decision:** `GET /api/orders/[id]` is removed, along with the unused `getOrder` helper in `lib/db.ts` and its README section. Orders are read from the database and admin emails only.
- **Why:** The endpoint returned names, emails, addresses and image URLs for any sequential ID, with no check on who asked. Nothing on the site used it.
- **Considered:** Requiring a secret token from the owner's emails. Rejected: the owner does not need an API for orders.

## 2026-11-11: Text lives in `content/` (superseded)

- **Status:** superseded by "Text split: prose in messages, data in content" below
- **Decision:** All visible text goes in `content/`.
- **Why:** Salon77 rule.
- **Considered:** Keeping `messages/*.json` for next-intl.

## 2026-11-11: Text split: prose in messages, data in content

- **Status:** done
- **Decision:** Prose (all visible text) lives in `messages/de.json` and `messages/en.json`, used through next-intl. Data that is not prose (products, prices, routes, links, image paths) lives in `content/`. Components only take props. Nothing is hardcoded in components. Each component moves its text when that component is touched in its step. Step 1 changes no text.
- **Why:** Owner's plan v2. Translations stay in the standard next-intl files, and product and route data has one source.
- **Considered:** Putting all text in `content/` (the earlier decision, superseded).

## 2026-11-11: One price set

- **Status:** done (price values to be confirmed by the owner in Step 2)
- **Decision:** Use the prices visitors see today: digital €30–50; canvas 30×30 cm €69, 40×40 cm €89, 50×50 cm €119. The other set in `messages/*.json` (€9–15, €29/39/55) is dropped.
- **Why:** The owner said the price question is not blocking, and asked for one consistent price set.
- **Considered:** Asking for the owner's choice before Step 2. Not needed, since the owner can change the values in the single data file.

## 2026-11-11: Workflow

- **Status:** done
- **Decision:** One step at a time. After each step: screenshots at 390x844 and 1440x900, a list of changed files, then stop. "ok" = commit and push. "revert" = discard that step.
- **Why:** Owner request. Screenshots are the proof that a step is done.
- **Considered:** Several steps per commit. Rejected, because a revert must affect one step only.

## 2026-11-11: Branch and commit naming

- **Status:** done
- **Decision:** Branch `feat/salon77-patterns`. Conventional Commits with scopes, for example `feat(hero): ...`.
- **Why:** Salon77 guide.
- **Considered:** The plan's `feature/` prefix. Replaced by the guide's `feat/`.

## 2026-11-11: Stack and workflow rules (plan v2)

- **Status:** done
- **Decision:** Next.js (App Router), React, TypeScript strict, Tailwind CSS 4 with tokens in `app/globals.css`, next/image, next/font. Vitest and Testing Library for unit tests, Playwright with `@axe-core/playwright` for one e2e spec, ESLint, Prettier, `tsc --noEmit`. knip and jscpd later. Workflow: one step, screenshots at 375x667 and 1440x900, "ok" commits, "revert" discards. Branch `feat/salon77-patterns`. Conventional Commits with scope. Never commit to `main`. Merge `main` into the branch, do not rebase pushed branches. Reviewer subagent runs before each PR.
- **Why:** Owner's plan v2, based on the Salon77 project.
- **Considered:** Other test runners and rebasing workflows. Not used.

## 2026-11-11: Open questions

Questions the owner has not answered yet. Remove an item and log the answer as a decision once answered.

- Impressum and Datenschutz: legal entity and contact details needed (TODO(client)).
- Order form: email with attachments or upload-and-link (Step 11, part A).

## 2026-11-12: Security headers and CSP (Step 3)

- **Status:** done
- **Decision:** Headers come from `lib/security-headers.ts`, applied in `next.config.ts`: Content-Security-Policy (default-src self, explicit lists for scripts, styles, images, fonts, frames and forms, frame-ancestors none, object-src none, base-uri self, form-action self, upgrade-insecure-requests in production), HSTS in production, X-Content-Type-Options nosniff, X-Frame-Options DENY, Referrer-Policy strict-origin-when-cross-origin, and Permissions-Policy with camera, microphone, geolocation, payment, usb and interest-cohort off.
- **Known trade-off:** script-src and style-src allow 'unsafe-inline' because Next.js hydration and JSON-LD need it. Nonces are the later fix. Development also allows 'unsafe-eval' for Turbopack.
- **Why:** Owner plan, Step 3.
- **Considered:** Nonces now (rejected for this step: needs per-request rendering, which would change how pages are built).

## 2026-11-12: One site palette

- **Status:** done
- **Decision:** All colors are defined once, in the `@theme` block of `app/globals.css`. Components use palette names (`text-ink`, `text-copy`, `bg-canvas`, `border-line`, `text-success`, ...), never raw Tailwind colors. Each palette value points at the Tailwind color it rendered before, so the refactor changed no pixels (verified pixel-for-pixel on landing, order and legal pages at 375x667 and 1440x900). Only white and black remain as constants.
- **Why:** Owner request. One place to change colors, and no hidden colors scattered across components.
- **Considered:** Keeping raw Tailwind classes in components (rejected: colors could not be changed in one place).

## 2026-11-12: Brand color: darker pink

- **Status:** done
- **Decision:** Brand accent is Tailwind pink-600 (`--color-brand`), hover and strong text is pink-700 (`--color-brand-strong`). Footer tagline uses gray-400 instead of gray-500.
- **Why:** Owner decision. The bright pink-500 button failed contrast (white text about 3.5:1). pink-600 with white text is about 4.6:1. This replaces the earlier "colors stay as they are" rule for brand colors only. Other colors are unchanged.
- **Considered:** Dark text on the bright pink (about 6:1, but looks different from the rest of the site). A new rose from the design guide (more change than needed).

## 2026-11-11: Tooling and CI (Step 2)

- **Status:** done
- **Decision:** Vitest with Testing Library replaces Jest (no Jest tests existed). Playwright runs one spec file in Chromium, at 375x667 and 1440x900, with axe (WCAG 2.2 AA). knip and jscpd run as local scripts. CI jobs: lint-and-types, test, audit, e2e, and lighthouse (main only). Node 22 is used everywhere. Packages are pinned to releases at least two weeks old at install time.
- **Audit scope:** `npm run audit` checks production dependencies only (`--omit=dev`). The remaining dev-only advisories (11 high at the last full run) come from `@lhci/cli`, which pins `lighthouse` 12.6.1. The patched lighthouse releases are 13.4 and later, and forcing one would likely break Lighthouse CI. Revisit when `@lhci/cli` updates.
- **Known failing check:** e2e axe test fails on `color-contrast` (white on the pink button, and two other pairs listed in the reviewer report). Fixing needs the owner's color decision (see "Brand colors").
- **Why:** Owner plan, Step 2. Blocking vulnerabilities in shipped code must be zero.
- **Considered:** Blocking the audit on dev-only advisories (rejected: they do not ship). Removing Lighthouse CI (kept as the plan requires it).

## 2026-11-11: Patterns adopted from Salon77

One line per step, added as each step lands.

- Step 0: Audit against the Salon77 guide (`docs/reviews/2026-11-11-audit.md`).
- Step 1: Foundation, complete. CLAUDE.md standards, decisions log, env and editor configs, fonts via next/font with display swap, one site palette, button and section variables, TODO(client) markers on missing client content (grep TODO(client) for the list).
- Sticky menu bar, one primary button per page, content container, facts box and layout rules come in later steps.
