# Remaining work

Status as of 2026-11-19. Plan v3 steps 1 to 13 are built in code. Launch is not yet possible; these items are kept for later.

## Blocking launch (needs owner, client or deployment access)
- Impressum and Datenschutz: operator details and retention for order data (TODO(client), see docs/legal-client-review.md).
- German Datenschutz (`content/legal/datenschutz.de.md`) still shows placeholders: Stand date, owner name, phone, the Neon database section, the print shop. A test in `lib/legal-text.test.tsx` lists them. The English Datenschutz and both Impressum pages are still placeholder text.
- SITE_URL set on Vercel to the live domain (canonical links, sitemap, structured data).
- Sender domain verified with Resend; ORDER_FROM_EMAIL and ORDER_EMAIL set.
- Order flow tested end to end: upload, email, database (needs a deployment and credentials).
- Secrets set on the host: ORDER_LINK_SECRET, CRON_SECRET, RESEND_API_KEY, BLOB_READ_WRITE_TOKEN, POSTGRES_URL (set automatically when the Postgres store is connected).
- Phone speed: LCP 3.1 s landing, 2.7 s order (target 2.5 s). Needs a decision on the phone layout.
- Live security headers checked with curl on the deployed site.
- Consent for health-related images before upload (legal advice).

## Code, not started
- Order and upload rate limits across server instances (the in-memory limit is per instance; needs a shared store).
- A 429 from the upload token route shows "upload failed", not "too many attempts": @vercel/blob's upload() throws the same error for every token failure and drops the status.
- Duplicate DECISIONS dates: some entries dated 2026-11-15 were written on 2026-11-14.

- Unused shadcn theme variables in app/globals.css (sidebar, chart, popover and similar); some, such as --radius, are still used. Remove only the unused ones, with approval.

## Open decisions
- "Kontakt" menu label lands on a section headed "Bereit für dein Kunstwerk?". Keep or change.
- Closing button stays primary (the same primary button may repeat when it leads to the order page).
- FAQ answers, shipping costs and delivery start wording: client confirmation (docs/faq-client-review.md).
- Canvas photos: PNG files of about 3 MB each (over the 500 KB rule). Convert before launch.
- Alt texts and captions for the canvas photos, the artist note and its photo: client (TODO(client)).

## Done since the last version of this list
- Field-level errors on the order form (Step 11) and the review fixes (PR #29, #30).
- Image folders by section; reference screenshots moved out of the project (Step 12, PR #31).
- middleware.ts renamed to proxy.ts (Next 16 convention).
- Unused shadcn packages and files removed; dotenv declared; knip reports nothing.
- OrderForm split into components/FormFields.tsx and lib/order-submit.ts.
- Prettier applied to all code and config files; Markdown is excluded (.prettierignore).
- A storage failure during the photo check returns a server error with the request code; only a missing photo returns "Upload missing".
- Checked, not open: the upload token route has a rate limit; no visible text is hardcoded in components (only developer log messages); header keys howItWorks, about and faq are the labels for those routes in content/routes.ts (menu: false), so they stay.

## Order and security review (2026-11-15), for later
Full audit: docs/reviews/2026-11-15-audit.md. Parked until the visual work is done.
- CRITICAL: the Content-Security-Policy (connect-src 'self') blocks direct photo uploads to Vercel Blob, so orders with a photo cannot be sent. Test on a Vercel preview after the fix.
- An order is saved before the signing secret is checked; a missing ORDER_LINK_SECRET leaves an order with no email, and retries duplicate it.
- ORDER_FROM_EMAIL falls back to onboarding@resend.dev, so customer mail fails silently in production.
- Order emails are English only; German is the main audience.
- Unconfirmed promises: "innerhalb von 24 Stunden", "kostenlos erneut einreichen".
- Payment and delivery timing contradict each other (order info, form, pricing, FAQ).
- JSON-LD prices come from the product file (done with the price update; check on the live site).
- Gallery lightbox not keyboard accessible (div with onClick, no dialog role, no Escape).
- Success button: white on green-600, contrast 3.30:1 (below 4.5:1); owner colour decision.
- Order page copy uses "Sie"; order.info.* block is unused and can be deleted.
- Upload token route: bad JSON is an unhandled 500; no rate limit.
- Honeypot branch unreachable for filled values; "Website" label is English.
- Client components only for usePathname (Hero, FactsBox, PricingTiers, IntroSection, HowItWorks, ContactSection, Footer): should be Server Components with locale as a prop.
- Landing not statically generated (no generateStaticParams).
- next-intl is installed but copy is imported as JSON (lib/copy.ts); DECISIONS says next-intl.
- README out of date (env names, Node version, branch names, removed endpoint).
- Test gaps: language switch, Gallery, PricingTiers.
- Duplicate contact email in five places; language switch in Header and Footer.
- Product JSON-LD lacks image and Offer url.
- Stale root docs (INSTRUCTIONS.md, PROJECT_STATUS.md, TEST_GUIDE.md); unused template SVGs in public/.
- Outdated packages: TypeScript, ESLint 9, Vitest 4, React, next-intl (majors need their own step).
