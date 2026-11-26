# Remaining work

Status as of 2026-11-23. The site is built and runs in coming-soon mode. PR #96 is the last merged code change. Work is paused until the information below is collected.

## Next steps

### 1. Collect from the client
Use `/client-list` for a ready-to-send German message. The detailed questions are in `docs/legal-client-review.md` and `docs/faq-client-review.md`.

- **Impressum:** name and address of the operator, contact email and phone, VAT ID or small business status (§ 19 UStG), person responsible for content.
- **Datenschutz placeholders** (`content/legal/datenschutz.de.md`, listed by a test in `lib/legal-text.test.tsx`): Stand date, first and last name, phone number, name and address of the print shop. The Neon database sentence also has a placeholder (provider, address, transfer basis, processing agreement), which we can fill in ourselves.
- **Datenschutz decisions:** keep or drop the social links section; how long order data stays in the database (for example for accounting).
- **English versions:** English Datenschutz and Impressum, or approval to translate the German texts.
- **AGB and Widerrufsbelehrung:** the texts, or a decision on who writes them (lawyer or a generator service). The Widerruf must cover the exception for personalised goods.
- **Legal check:** the request model ("Bild senden und anfragen", binding order with the invoice), the consent wording, and consent for health-related images.
- **FAQ:** confirm the five answers (`docs/faq-client-review.md`), including when delivery time starts and the shipping costs per country.
- **Prices:** final prices for 40 × 40 and 50 × 50 after print quotes; whether shipping within Germany is included; whether the canvas comes ready to hang.
- **Images and text:** alt texts and captions for the canvas photos, the artist note and its photo (search `TODO(client)`).
- **Open choices:** the "Kontakt" menu label (it lands on "Bereit für dein Kunstwerk?"); the phone hero layout, which decides whether LCP can reach 2.5 s.

### 2. Set up accounts and deployment (owner)
- Live domain connected in Vercel, and `SITE_URL` set to it.
- Resend: sender domain verified; `ORDER_FROM_EMAIL` and `ORDER_EMAIL` set.
- Vercel secrets: `ORDER_LINK_SECRET`, `CRON_SECRET`, `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN`. `POSTGRES_URL` is set when the Neon store is connected; then run `npm run db:init` once against the production database.

### 3. When we resume (code, in this order)
1. Put the client's legal texts into `content/legal/` (Impressum, Datenschutz, AGB, Widerruf, both languages). Remove the placeholders and update the placeholder test. Run the `datenschutz` agent.
2. Apply the FAQ, price and image answers. Convert the canvas PNGs (about 3 MB each) to the 500 KB rule.
3. On a Vercel preview: send a real test order (upload, emails, database, signed links, cleanup job), and check the live security headers with `curl -I`.
4. Phone speed: apply the hero decision, then run the `performance` agent.
5. Final pass: `reviewer`, `mobile-view`, `visual-checker`, `datenschutz`. Then turn off `COMING_SOON` in Production.

## Code, not started (no launch blocker)
- Order and upload rate limits across server instances (the in-memory limit is per instance; needs a shared store).
- A 429 from the upload token route shows "upload failed", not "too many attempts": @vercel/blob's upload() throws the same error for every token failure and drops the status.
- An order is saved before the link secret is read; without `ORDER_LINK_SECRET` the order is kept but its admin email has no links. Setting the secret (step 2) avoids it.
- `RESEND_API_KEY` is not checked before the save. Without it, `new Resend()` throws after the order is stored: the visitor gets an error, no email goes out, a resubmit creates a duplicate order, and the log names the step `links`. Fix: check `RESEND_API_KEY` and `ORDER_LINK_SECRET` in production next to the mail settings, before the save, with a route test.
- Unused shadcn theme variables in app/globals.css (sidebar, chart, popover and similar); some, such as --radius, are still used. Remove only the unused ones, with approval.
- Unused template SVGs in `public/` (file, globe, next, vercel, window). Remove with approval.
- The contact email is typed in `components/Footer.tsx`, `lib/structured-data.ts` and the message files; it should come from one place.
- The admin order email (to the owner) is English only; the customer confirmation is in the page language. Ask the owner whether the admin email should be German.
- Components read text through `getCopy()` in `lib/copy.ts` (the message JSON imported directly), not through next-intl's `useTranslations`/`getTranslations`; next-intl is used only for routing. DECISIONS (2026-11-11, text split) and CLAUDE.md say next-intl. Decide: switch to the next-intl API, or record `getCopy` as the decision.
- Product JSON-LD lacks image and Offer url.
- Test gaps: language switch end to end.
- Outdated packages: TypeScript, ESLint 9, Vitest 4, React, next-intl (majors need their own step).
- Duplicate DECISIONS dates: some entries dated 2026-11-15 were written on 2026-11-14.

## Open decisions
- Closing button stays primary (the same primary button may repeat when it leads to the order page).
- Success button: check the contrast of the success colour once the owner confirms the colours.

## Done since the 2026-11-19 list
- README updated (API body, scripts, documents, agents, workflow, coming-soon mode, legal texts).
- Stale root docs removed (INSTRUCTIONS.md, PROJECT_STATUS.md, TEST_GUIDE.md); the repo-root CLAUDE.md now points to this folder.
- Rechecked from the 2026-11-15 audit, now fixed: the CSP allows the upload to Vercel Blob; the Gallery enlarged view is a dialog that closes with Escape; no `onboarding@resend.dev` fallback; order copy uses "du"; the unused `order.info` block is gone; pages are statically generated (`generateStaticParams` in the locale layout); the upload token route has a rate limit; Client Components are only the interactive ones (Header, LanguageSwitch, Gallery, Accordion, Reveal, OrderSection, UploadArea, OrderForm and its parts).
- Earlier: middleware.ts renamed to proxy.ts; unused shadcn packages removed and knip clean; OrderForm split into components/FormFields.tsx and lib/order-submit.ts; Prettier applied; a storage failure during the photo check returns a server error with the request code.
