# Remaining work

Status as of 2026-11-14. Steps 0 to 14 are built. Items below are still open.

## Blocking launch
- Impressum and Datenschutz text: placeholders until the operator's details are given (TODO(client)).
- SITE_URL set on Vercel to the live domain (canonical links, sitemap, breadcrumb data).
- Sender domain verified with Resend; ORDER_FROM_EMAIL and ORDER_EMAIL set.
- Order flow tested end to end: upload, email, database (needs a deployment and credentials).
- Secrets set on the host: ORDER_LINK_SECRET, CRON_SECRET, RESEND_API_KEY, BLOB_READ_WRITE_TOKEN, DATABASE_URL.
- LCP on phones: 3.1 s landing, 2.7 s order (budget 2.5 s). Needs a decision on the phone layout.
- Live security headers checked with curl on the deployed site.

## Plan items not finished
- Step 2: add the four required checks (lint-and-types, test, audit, e2e) to the "Protect main" ruleset. Playwright runs Chromium only; the full browser list on main is not set up.
- Step 6a: focus trap inside the open mobile menu. Flicker test on a real phone and touchpad.
- Visible text in messages: the plan moves all visible text into messages/*.json. Most components still hold text in the code.
- Step 8 and 9: hero and facts box text still in the components (part of the text move).
- Step 10: image-and-text sections need copy from the client. The gallery alt texts may be refined (TODO(client)).
- Step 11: errors under each field, linked with aria-describedby (now a list above the button). Rate limit across server instances. The plan's EMAIL_* names differ from the Resend variables in use (documented).
- Step 13: Wix redirects, if the domain moves. Legal text (see above).
- Step 14 cleanup: knip reports unused files (components/ui/button.tsx, components/ui/tabs.tsx, lib/db.ts), unused exports and dependencies, and dotenv used but not declared. Remove only with approval.
- Middleware: rename middleware.ts to proxy.ts (deprecation warning in the build).
- Public reference screenshot: public/screenshots/ is now ignored by git but still served if deployed from this folder. Move it out of public/ before launch.
