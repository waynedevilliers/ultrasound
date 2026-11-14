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

## 2026-11-14: Field-level errors on the order form (plan v3, step 11)

- **Status:** done
- **Decision:** A problem with one field marks that field (aria-invalid, aria-describedby) and shows a short message under it. A summary above the form says to check the marked fields. Server issues map to fields (photo paths map to the upload fields); the server's English messages are not shown. The error clears when the field changes. Network or upload failures show one German or English message.
- **Why:** Plan v3 step 11: visitors should see which field to fix.
- **Open:** Rate limits per instance and on the upload route stay open (storage for limits needs a decision).
- **Considered:** Showing the server's messages as they are (rejected: English text in the German form).

## 2026-11-14: FAQ accessibility and lint fixes (review follow-up)

- **Status:** done
- **Decision:** Each FAQ question is a heading with a button inside it (WAI-ARIA accordion). The button has aria-expanded and aria-controls; the answer panel uses the hidden attribute. The chevron is decorative. The German answer now says "eine Vorschau". The lint warnings in HowItWorks.tsx and Footer.tsx (unused variables and imports) are removed, so lint is clean.
- **Why:** Reviewer findings on feat/faq: screen readers could not tell open from closed, and a heading inside a button is not valid markup.
- **Considered:** Keeping the answers out of the DOM when closed (rejected: aria-controls needs the panel to exist).

## 2026-11-14: Final call to action with id kontakt (plan v3, step 10)

- **Status:** done, copy pending client approval
- **Decision:** The closing section keeps its place and gets the id `kontakt`. It shows the heading "Bereit für dein Kunstwerk?", the existing short text, the email as plain text, and one primary button "Jetzt bestellen" to the order page. The menu entry Kontakt and the FAQ contact link point to #kontakt.
- **Why:** Plan v3 step 10: one clear action at the end of the page, and the menu item still works.
- **Considered:** A mailto button (rejected: the order page is the main action; the email stays visible as text).

## 2026-11-15: Five menu items, the rest reached by scrolling (owner request)

- **Status:** done
- **Decision:** The main menu keeps five items: Start, Bestellen, Formate, Beispiele and Kontakt. How it works, About and FAQ are on the home page and reached by scrolling, not from the menu. Their anchors stay in the route list. The menu limit is five again, as in the original plan. The desktop menu uses the lg breakpoint.
- **Why:** The owner asked to keep only the most important items in the menu. Eight items were too many, and at 1024px they collided with the language switch.
- **Considered:** Keeping all eight and moving the switch (rejected: crowded at every width).

## 2026-11-15: FAQ answers are drafts for the client (plan v3, step 9)

- **Status:** done, answers pending client confirmation
- **Decision:** The five FAQ answers stay as drafts, marked TODO(client) in the component. The client gets a plain German list with each answer and the open points (`docs/faq-client-review.md`). No FAQPage structured data until the answers are confirmed. The German question about formats now uses "du" (it was "Sie").
- **Why:** Plan v3 step 9. Shipping costs, preview, refund and file rules are business promises that the owner has not confirmed.
- **Open:** The delivery start differs between the FAQ ("nach Bestätigung") and the pricing lines ("nach Zahlungseingang"). Shipping costs are not in the price data.
- **Considered:** Removing the open questions (rejected: the owner asked to keep them as drafts).

## 2026-11-15: About section with photo placeholder (plan v3, step 8)

- **Status:** done, copy and photo pending client
- **Decision:** A short "Über" section between the pricing cards and the FAQ: a photo frame (placeholder text until the photo arrives, with alt text) beside a title and three short paragraphs. The copy is a neutral draft written from the brand, not the artist's own story (TODO(client)).
- **Why:** Plan v3 step 8: parents should know who makes the artwork.
- **Considered:** Putting the artist note in the footer (rejected: too little room for a personal note).

## 2026-11-15: Formats link to the order form (plan v3, step 7)

- **Status:** done, wording pending client approval
- **Decision:** Each format (digital and the three canvas sizes) is a card with equal height and a secondary button "Dieses Format bestellen" that links to `/{locale}/order?format=...`. The order page reads `format` on the server (`lib/format-param.ts`) and preselects the product and canvas size. Unknown values are ignored. Payment and delivery lines sit below the cards (TODO(client)).
- **Why:** Plan v3 step 7: a visitor who picks a format should not pick it again on the form.
- **Considered:** Reading the format in a client effect (rejected: the lint rule forbids setState in effects, and the server read avoids a flash of the default).

## 2026-11-15: So funktioniert's, three steps (plan v3, step 6)

- **Status:** done, wording pending client approval
- **Decision:** The section is titled "So funktioniert's" (EN "How it works") with three steps: Bild hochladen, Ich bearbeite es, Leinwand oder Datei erhalten. Each step has a small icon (upload, edit, gift) in place of the number. The cards stay in one row on desktop and stack on phones. TODO(client): approve the wording (the EN wording is new).
- **Why:** Plan v3 step 6: the process is three plain steps.
- **Considered:** Keeping the numbered steps (rejected: the plan asks for icons).

## 2026-11-15: Examples as before and after pairs (plan v3, step 5)

- **Status:** done, originals pending from the client
- **Decision:** The examples section (anchor #beispiele, title "Beispiele" / "Examples") shows three pairs: the original ultrasound on the left ("Vorher" / "Before") and the artwork on the right ("Nachher" / "After"), at the same size. Until the client sends the originals, the left side is a marked placeholder ("Originalbild folgt" / "Original image to follow"). The artwork keeps the lightbox. TODO(client): originals for each pair, and approval of the placeholder wording.
- **Why:** Plan v3 step 5: the before and after shows what the product does.
- **Considered:** Hiding the pairs until the originals arrive (rejected: the section needs to show the offer now).

## 2026-11-15: Hero, intro and facts strip (plan v3, step 4)

- **Status:** done, wording pending client approval
- **Decision:** The hero shows the heading, a supporting line that names the offer, three benefit points with check icons, "Jetzt bestellen" (primary) and "Beispiele ansehen" (secondary, to the examples section), and the price line under the buttons (price from formatPrice). The emotional text moved to an intro section directly under the facts strip, ending with the primary order button. The facts strip is a slim strip with four items (price, delivery, payment, formats), no card borders or shadows, one row on desktop and two columns below. "Optional" is removed; it is a hero benefit. The language switch is plain text "DE | EN" with the current language underlined. On phones the bar shows a small "Bestellen" button next to the menu button, hidden on the order page.
- **Why:** Plan v3 step 4: the first screen names the offer and the price, and the order button is one tap away.
- **Considered:** Keeping the pill language switch (rejected: it competes with the order button).

## 2026-11-15: One price format and a text logo in the bar (plan v3, step 3)

- **Status:** done
- **Decision:** All prices go through formatPrice (lib/price.ts): German "30 €" with a non-breaking space, English "€30", whole amounts without decimals. Ranges are two formatted prices joined by an en dash. Replaced hard-coded euro signs in the format cards, the order form size options and the facts strip; JSON-LD keeps the plain number. The small logo in the sticky bar is the text "Portraits 4 Life" in the logo font, with the same fade and reserved space, linking to the current language home page. TODO(client): a simplified logo that reads at 32px.
- **Why:** Plan v3 step 3: one price format for both languages, and a logo that stays legible in the bar.
- **Considered:** Keeping the small logo image (rejected: the plan asks for the text).

## 2026-11-14: Facts strip under the hero (plan v3, decision 1)

- **Status:** done (replaces the earlier facts box and its removal)
- **Decision:** A slim facts strip stays directly under the hero, with four items: Preis, Lieferzeit, Bezahlung, Formate. No card borders or shadows. Each item is icon, label and one line of text on the section background. Desktop: one row. Below sm: two columns. Values come from content/products.ts. "Optional" is removed; it is a benefit point in the hero.
- **Why:** Price, delivery and payment at a glance remove doubt before ordering. It is slimmed down so it does not look clickable and does not delay the examples.
- **Considered:** Removing the strip and moving payment methods below the format cards (rejected: the strip is kept, and payment text also goes below the cards in the format section).

## 2026-11-14: Resend for order email (plan v3, decision 2)

- **Status:** done
- **Decision:** Order emails are sent with Resend. The variables are RESEND_API_KEY, ORDER_FROM_EMAIL and ORDER_EMAIL. No SMTP (EMAIL_HOST and similar).
- **Why:** Owner decision. Resend is already in use and set up.
- **Considered:** SMTP with the EMAIL_* variables from the earlier plan (rejected).

## 2026-11-14: Route handler for the order (plan v3, decision 3)

- **Status:** done; open gaps listed below, to be fixed in step 11
- **Decision:** The order is sent to a route handler (app/api/orders), not a server action. This keeps room for 15 MB uploads: photos go directly to private storage through a token route, and the order itself is JSON.
- **Why:** Owner decision. Server validation, escaping, honeypot and rate limiting are in place.
- **Present:** server-side Zod validation of every field; the stored photo is checked for existence, size (15 MB) and type on the server; every value in the email is HTML-escaped; honeypot field; rate limit on the order endpoint.
- **Missing (fix in step 11):** the rate limit is per server instance and trusts x-forwarded-for; the upload token route has no rate limit; field-level error messages (errors are listed above the button, not under each field).
- **Considered:** A server action (rejected for the reason above).

## 2026-11-14: Images and content blocks (Step 10)

- **Status:** done, with one open item
- **Decision:** Every image has an alt text in German and English (hero, gallery and the lightbox). Gallery and hero images have a sizes attribute and load lazily, except the hero, which keeps its priority loading. The lightbox close button has a screen reader label. Image sizes checked: no source image is over 500 KB (largest is 55 KB, public/images/ultrasound.avif), so nothing needs recompressing. The hero supporting sentence is no longer repeated in the body copy (unit tested).
- **Open items:**
  - No new image-and-text sections were added: they would need copy that does not exist yet.
  - public/screenshots/image.png is a reference screenshot inside public/, so it is served to visitors. It should move out of public/ (not changed without asking).
  - The gallery alt texts are generic; the client may refine them (TODO(client)).
- **Why:** Owner plan, Step 10.
- **Considered:** Writing new image-and-text copy (rejected: content is the client's to supply).

## 2026-11-14: Facts box under the hero (Step 9)

- **Status:** done
- **Decision:** A facts box sits directly under the hero, with five cards: formats (digital or canvas, 30x30, 40x40, 50x50 cm), price (from the lowest product price), delivery (about 2 weeks after payment, the longest canvas delivery in the product data), payment (PayPal, bank transfer, credit card), and optional (child's name and week of pregnancy). All prices, sizes and delivery times come from `content/products.ts`. Icons are decorative and hidden from screen readers. Phones show one column.
- **Why:** Owner plan, Step 9: parents see the key facts at a glance.
- **Not done yet:** The box text is written in the component, not in the message files (part of the text move).
- **Considered:** Hard-coding the values (rejected: prices must come from one file).

## 2026-11-14: Hero (Step 8)

- **Status:** done
- **Decision:** The heading stays "ULTRASOUND ART". The supporting line is the first sentence of the existing copy (18px below 600px, 20px from 600px, max width 640px, body colour). Primary "Order now" and secondary "View formats" follow, so the heading, supporting line and primary button are visible at 375x667 without scrolling (checked by an e2e test). The rest of the copy moves below the buttons, so no sentence is rendered twice. The hero image keeps its size, crop and priority loading.
- **Why:** Owner plan, Step 8: a clear first screen on phones.
- **Not done yet:** The hero copy is still written in the component, not in the message files (text move comes with the rest of the text work).
- **Considered:** Keeping all the copy above the buttons (rejected: the primary button would fall below the fold on phones).

## 2026-11-14: German is the starting language

- **Status:** done
- **Decision:** The site opens in German. The root address redirects to /de, and the middleware default is German with browser language detection turned off, so English browsers also start in German. The language switch still moves between German and English.
- **Why:** Owner request. The German audience is the main one.
- **Considered:** Detecting the browser language (rejected by the owner: German always starts).

## 2026-11-14: Order photos: direct upload to private storage (Step 11, part B)

- **Status:** done, not yet tested on a live deployment
- **Decision:** Photos go straight from the browser to private Vercel Blob storage, using a short-lived upload token (`app/api/orders/upload`). The order is then sent as JSON with the stored paths (`app/api/orders`), which checks that each photo exists and passes the size and type rules. The emails contain signed links to our own route (`app/api/orders/files`), which serves a photo only with a valid, unexpired signature (30 days). Nothing is publicly linkable.
- **Retention:** a daily cron (`app/api/cron/cleanup`, 03:00) deletes photos uploaded more than 30 days ago. Deviation: the plan says "30 days after the order is completed", but there is no completion status yet, so the count starts at upload.
- **Deviations from the plan text:** mail is sent with Resend, so the variables are `RESEND_API_KEY`, `ORDER_FROM_EMAIL` and `ORDER_EMAIL` (not EMAIL_HOST and similar SMTP settings). The order is sent with a route handler, not a server action, because the upload needs its own token route anyway.
- **Still open:** errors are listed above the submit button, not under each field. The rate limit is per server instance. Upload and sending need Blob, Resend, Postgres and a Vercel deployment to test end to end; the e2e tests cover the parts that work without them. The environment variables are listed in .env.example and must be set on Vercel, including CRON_SECRET for the cleanup job.
- **Why:** Owner choice (option B): photos never pass through the order endpoint, so the request size limit does not apply, and each photo is stored once.
- **Considered:** Email attachments (rejected: request size limit, mailbox copies of health-related photos).

## 2026-11-14: Final check (Step 14)

- **Status:** done, not ready to launch (see open items)
- **Launch checklist results:**
  - Build passes; prints the Next.js middleware deprecation warning (rename middleware.ts to proxy.ts): partial
  - Every page in both languages: one h1, title, description and localised alt texts: pass (e2e)
  - axe (WCAG 2.2 AA) on every page in both languages: pass (65 e2e tests)
  - Mobile menu opens, navigates and closes: pass (e2e)
  - No horizontal scroll at 375px: pass. At 320px: not verified (the headless browser used 347px)
  - All internal links work; external links safe; mailto valid: pass (e2e crawl)
  - Impressum and Datenschutz filled in: FAIL (placeholders until the operator gives details)
  - Secrets not committed: pass (only .env.example is tracked). Secrets set on the host: not verified
  - Security headers present: pass locally. On the live site: not verified
  - Sitemap and robots respond: pass locally (sitemap empty until SITE_URL is set). Old URLs redirect: not applicable (no Wix redirects)
  - Order form sends, uploads arrive, replies reach the right person: NOT VERIFIED (needs storage, email and database credentials and a Vercel deployment)
  - Lighthouse budgets (mobile, local build): performance 0.93 and 0.95, accessibility 0.99, best practices 1 and 0.96, SEO 1, CLS 0, blocking time 87 and 117 ms: pass. LCP 3.1 s (landing) and 2.7 s (order) against 2.5 s: FAIL
  - Decisions current; no open question blocks launch: FAIL (legal details, sender domain, SITE_URL, order flow test)
- **Contrast (default states, from axe):** white on the brand pink about 4.6:1; brand pink on white about 4.6:1. axe passes every page.
- **Noticed, not changed:** knip reports unused files (components/ui/button.tsx, components/ui/tabs.tsx, lib/db.ts), unused exports and some unused dependencies (class-variance-authority, tw-animate-css, shadcn, tailwindcss, @testing-library/user-event; the last three are used through configuration, so knip flags them falsely). dotenv is used by scripts/init-db.js but not declared. jscpd finds no duplicate code. The LCP element on phones is the body paragraph below the buttons.
- **Why:** Owner plan, Step 14.
- **Considered:** Moving the hero image above the paragraph on phones to speed up LCP (not done: it changes the agreed first screen; needs the owner's decision).

## 2026-11-14: Footer, SEO and legal (Step 13)

- **Status:** done, with open items
- **Decision:** Every page has a title, description, Open Graph and Twitter tags, a canonical link and German and English alternates, from one helper (`lib/metadata.ts`). Titles and descriptions are in the message files (seo.*). Structured data (JSON-LD, escaped) comes from `lib/structured-data.ts`: Organization (name, email) on every page; Product with Offers for the digital download and each canvas size on the landing page, with prices from `content/products.ts` and offer names in both languages; BreadcrumbList on subpages. The sitemap and robots file are built from `content/routes.ts`. The footer has a language switch.
- **Open items:**
  - Absolute links (canonical, sitemap, breadcrumb data, alternates) need SITE_URL to be set to the live domain on Vercel; without it, those are relative or left out.
  - Impressum and Datenschutz text are still placeholders (TODO(client)) until the operator's details are supplied.
  - No redirects for old Wix URLs: the domain has not moved yet (TODO(client)).
- **Why:** Owner plan, Step 13.
- **Considered:** Structured data written inline in pages (rejected: one place, escaped data only).

## 2026-11-14: Links (Step 12)

- **Status:** done
- **Decision:** Internal links are relative and locale-aware (menu, footer, buttons, FAQ). The FAQ contact links were bare #contact anchors and are now locale-aware. The order route no longer falls back to localhost: it uses SITE_URL if set, otherwise the address of the request. External links must use ActionLink (new tab, rel noopener noreferrer, icon, screen reader text). The site currently has no external links; email links are plain mailto links, with the address also shown as text.
- **Search results:** no localhost or hard-coded own-domain links in application code. No links to luiseschwarze.wixsite.com exist in the project, so there is no Wix TODO list to write.
- **Tests:** an e2e check crawls every link on the landing, order and legal pages in both languages and verifies internal pages return 200, anchors exist, mailto addresses are valid, and external links (if any) are safe.
- **Why:** Owner plan, Step 12.
- **Considered:** Adding a placeholder external link (rejected: nothing to link to yet).

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
- **Decision:** `components/ActionLink.tsx` is the only button style. Primary is filled brand; secondary is outlined brand with a 1.5px border. Internal paths use next/link, anchors and mailto use plain links, external URLs open in a new tab with rel noopener noreferrer, an icon and screen reader text. Each page has one primary action: the same primary button may repeat, but every primary button on a page leads to the order page (landing: hero, intro and closing section; order page: the submit button). Other buttons on the landing page are secondary.
- **Changes:** the hero secondary button moved from dark to brand outline. The contact button on the landing page was made secondary as "Contact me"; from 2026-11-14 (Step 10) the closing section is primary "Jetzt bestellen" again, as the rule above allows.
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
