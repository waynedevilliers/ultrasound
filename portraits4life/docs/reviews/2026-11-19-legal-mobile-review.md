# Review: feat/legal-text-mobile-fixes (28513ba) vs main

Date: 2026-11-19. Scope: `git diff main...HEAD` only. Shell default was Node 20.17; switched to Node 22.17 (nvm) for checks.

## Verdict: Needs fixes

No code bugs that block merge. The problems are in what the rendered German Datenschutz page says: one empty section, one false statement, and missing disclosures. Fix or hide these before this text goes live.

## Critical

None.

## Important

1. **Empty section "6. Zahlungsabwicklung"**, `content/legal/datenschutz.de.md:191-205`. The Stripe body is inside a comment, but the `## 6.` heading is not. Checked in the prerendered `.next/server/app/de/datenschutz.html`: h2 "6. Zahlungsabwicklung" is followed straight by h2 "7. Druck und Versand". It looks broken, and the numbering later will look wrong. Fix: move the `## 6.` heading into the comment and renumber "7." to "6." for now (or add a one-line visible sentence).
2. **Published text claims social media links that do not exist**, `datenschutz.de.md:186-189` and `:167` ("in meinen Social-Media-Kanälen"). The TODO is only a comment. The visible text says "verlinke ich auf meine Profile in sozialen Netzwerken". A privacy policy that describes processing that does not happen is a finding in its own right. Fix: wrap section `### Links zu sozialen Netzwerken` in a comment, the same way as Stripe, until the links exist.
3. **The form database (Neon) is not disclosed**, `datenschutz.de.md:42-44`. The visible text names only Vercel Blob for photos. The form data stored in Neon appears only in a TODO comment. Visitors therefore get an incomplete list of processors. Fix: client or lawyer adds the section before launch. Track this as launch-blocking in the Client TODO list.
4. **Bracket placeholders are rendered to visitors**: `[TT.MM.JJJJ]` (:3), `[Vor- und Nachname]` (:63), `[Telefonnummer]` (:67), `[Name und Anschrift der Druckerei]` (:210), all confirmed in the built HTML. Nothing marks them as `PLACEHOLDER(client)`, and no test fails while they are present. Fix: add `<!-- PLACEHOLDER(client) -->` next to each. Then add a launch guard, for example a test that fails on `/\[[^\]]+\]/` in the parsed blocks, or list them in DECISIONS as launch blockers.

## Minor

5. `lib/legal-text.tsx:61` URL regex. `„https://“` on line 126 of the .md is only left unlinked because the regex needs at least two characters after `//`. Nothing tests this. The regex also includes trailing `;:!?“»` in the link and cuts any URL that contains `)`. Fix: add a test case for the `„https://“` line. Optionally strip trailing `;:!?“”»` too.
6. `lib/legal-text.tsx:18` comments. An unclosed `<!--` leaves its text, including any TODO, visible. Only the test on the real file (`legal-text.test.tsx:60`) catches this. Fix: drop everything from an unclosed `<!--` to the end of the file, or throw at build time.
7. `lib/legal-text.tsx:40-46` list items. A wrapped continuation line of a `*` item becomes a new paragraph. The current file has none. Document this in the header comment so the lawyer's edits don't break it.
8. `lib/legal-text.tsx:53` `readLegalText(page: string, locale: string)`. Callers pass safe values today, but the signature accepts any string and builds a file path from it. Fix: type it as `(page: LegalKey, locale: 'de' | 'en')` so path safety is enforced by the type checker. The module uses `node:fs`, so add a comment that it is server-only (the `server-only` package is not installed; don't add it just for this).
9. Email addresses in the legal text (`:68`, `:86`) are not links. Users on mobile cannot tap them. Optional `mailto:` support in `withLinks`.
10. `components/OrderForm.tsx:684` `py-3` on an inline link inside the consent `<label>`. The padding enlarges the hit area over the neighbouring text lines, so a tap meant for the label text can open the link instead. Also outside this diff: the link opens in the same tab and drops a filled form, including the chosen photo. Consider `target="_blank" rel="noopener noreferrer"` here.
11. Tap-target consistency. `deliverToOther` got `min-h-11 py-2` (`OrderForm.tsx:630`), but the consent labels (`:670`, `:690`, ...) did not. Multi-line labels already pass 44px, but `OrderForm.tsx:79` `fieldClass` comment says "text inputs and selects" while the constant is also used on the textarea (`:497`). Update the comment.
12. `OrderForm.tsx:143` calls `formatOptions(locale)` a second time per render (it is also called at `:419`). Store the result in one const.

## Client TODO list (from this diff)

- Datenschutz DE: date "Stand", full name, phone number, print shop name and address.
- Confirm where photos are stored (Vercel Blob) and add the Neon database section (provider, address, purpose, legal basis, transfer basis, AVV).
- Confirm that a data processing agreement (AVV) with Vercel and Resend really exists. The text says it does.
- Confirm 30-day photo retention, or ask for order-status-based deletion (DECISIONS 2026-11-19).
- Social media: remove the section and the phrase on line 167, or provide the links.
- Stripe section: publish only when Stripe is used.
- Lawyer: wording "Bestätigung deiner Anfrage" (request, not order).
- Still placeholders: Impressum (DE and EN), English Datenschutz (`components/LegalPage.tsx:13`).

## Checked and passed

- Node 22.17: `lib/legal-text.test.tsx` and `components/OrderForm.test.tsx` pass (40 tests). Caller reports tsc, eslint, 268 vitest and 66 Playwright passing.
- Static generation still works: `/de/datenschutz` is prerendered to HTML. `process.cwd()` and fs reads happen at build time only, so there is no runtime file-tracing issue.
- XSS: no `dangerouslySetInnerHTML`. Text renders as React children. Links only match `https?://` and come from a repo file. External links have `rel="noopener noreferrer"`. Comments (TODOs, Stripe) are not in the HTML or RSC payload (0 matches for "TODO").
- Headings: page h1, then h2/h3 in order. The `#` title line is skipped.
- The 30-day text matches `app/api/cron/cleanup/route.ts:6` (`RETENTION_MS = 30 days`).
- Price under the select comes from `content/products` via `formatPrice` (no typed price). `priceLabel` exists in both de.json and en.json. `aria-live="polite"` is appropriate.
- Tap targets: Breadcrumb, Footer links, LanguageSwitch (`min-w-11`, footer `-ml-3` = 12px matches the centering offset), compact header logo. Tokens only. No new raw colours in the diff. `hover:` is fine with Tailwind 4, which wraps it in `@media (hover: hover)`.
- `fieldClass` removes 11 duplicated class strings.
- DECISIONS.md updated with two entries.
