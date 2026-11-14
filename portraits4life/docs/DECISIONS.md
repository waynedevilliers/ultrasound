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

## 2026-11-14: Layout system (Step 7)

- **Status:** done
- **Decision:** One content container (`.container-site`, max width 80rem, padding 1rem / 1.5rem / 2rem). One section rhythm (`.section-y`: 2.5rem on phones, 5rem from 640px, 8rem from 1024px). Headings scale with clamp (`.heading-xl`, `.heading-hero`). Long text sits in a 68ch column (`.reading-column`). Breadcrumbs on every subpage (Startseite | Bestellen, Home | Order). Cards in a row are equal height. Small text is 16px everywhere (no text-sm or text-xs). Landing sections fade in with `Reveal` (about 12% visible, once, off with reduced motion and without JavaScript).
- **Why:** Owner plan, Step 7: one layout, one rhythm, readable text on phones.
- **Not done yet:** The order page heading still mixes German and English ("Bestellen / Order") and is not yet locale-specific; that belongs to the order work in Step 11. The breadcrumb JSON-LD is Step 13.
- **Considered:** Keeping fixed heading sizes (rejected: too large on phones).

## 2026-11-14: Small logo in the sticky bar (Step 6b)

- **Status:** done
- **Decision:** A 40px logo sits at the left of the sticky bar, linking to the current language home page. Its space is always reserved, so the menu never moves. It is hidden (opacity 0, aria-hidden, not focusable) until the big logo leaves the viewport; an IntersectionObserver on the big logo sets it visible. Only opacity changes, over 200ms; with reduced motion the change is instant.
- **Why:** Owner plan, Step 6b. The bar keeps the brand visible once the big logo has scrolled away.
- **Considered:** A scroll listener (rejected by the plan: scroll listeners are not allowed in the navbar).

## 2026-11-13: Sticky menu bar instead of a shrinking header (Step 6a)

- **Status:** done
- **Decision:** The logo sits centred above the menu bar and scrolls away. The menu bar is sticky (top 0, z 50, fixed height 4rem) with the links centred and separated by bars on desktop; the language switcher and menu button sit on its right. This matches the reference layout the owner supplied (public/screenshots/image.png). It never changes size and has no scroll listeners. The logo scrolls away as in the original plan, so Step 6b (small logo in the bar) still applies. Desktop (lg and up): links separated by aria-hidden bars, current page underlined with aria-current. Below lg: a 44px menu button with aria-expanded and aria-controls; the panel closes on link click, on Escape (focus returns to the button), and on a click outside. One navigation landmark serves desktop and mobile. The language switcher sits in the bar on every size. Smooth scroll is on, off with reduced motion, and anchor targets clear the bar.
- **Why:** A shrinking header flickers when it changes size during scroll; a bar that never changes size cannot.
- **Not done yet:** Focus trap inside the open panel (in the earlier plan, not in 6a). Real touch and touchpad flicker testing needs a physical device; headless browsers cannot reproduce it.
- **Considered:** A header that shrinks on scroll (rejected: flicker).

## 2026-11-13: One button component and one primary action (Step 5)

- **Status:** done
- **Decision:** `components/ActionLink.tsx` is the only button style. Primary is filled brand; secondary is outlined brand with a 1.5px border. Internal paths use next/link, anchors and mailto use plain links, external URLs open in a new tab with rel noopener noreferrer, an icon and screen reader text. Each page has one primary action: the landing page has "Order now" in the hero; the order page has the submit button. Other buttons on the landing page are secondary.
- **Changes:** the hero secondary button moved from dark to brand outline; the contact button on the landing page became secondary and its label is now "Contact me".
- **Contrast:** white on pink-600 about 4.6:1; pink-600 on white about 4.6:1. Both pass 4.5:1 in the default state; axe passes both pages. The hover shade (pink-700) is not measured separately.
- **Why:** Owner plan, Step 5: one primary action per page.
- **Considered:** Keeping the old dark secondary (rejected: the plan asks for the accent colour).

## 2026-11-12: One route list and one product file (Step 4)

- **Status:** done
- **Decision:** `content/routes.ts` is the one list of routes (menu, footer, sitemap flags, anchors). The header menu and footer legal links read it. Anchor links are locale-aware (`/en#pricing`), so they also work from the order page. `content/products.ts` stays the only source of prices and sizes; its tests check every product has a price. The sitemap itself is built in Step 13 and reads the same list.
- **Why:** Owner plan, Step 4. One list means the menu, footer and sitemap cannot drift apart.
- **Considered:** Plain `#pricing` anchors (rejected: they break from other pages). Moving menu labels to messages (later, with Step 6a).

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
