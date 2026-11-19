# Datenschutz draft vs the website, 2026-11-19

Checked the client's Datenschutz draft against the code and a privacy scan of the production build (`npm run privacy-scan`). Not legal advice.

**Verdict: Not ready for launch.** The draft has open placeholders, and some statements do not match what the site does.

## What the scan found

| Item | Found | In the draft |
| --- | --- | --- |
| Cookie `NEXT_LOCALE` (session, set on the first page load) | yes | described (language cookie) |
| localStorage / sessionStorage keys | none | not mentioned, correct |
| Requests to other domains | none | "no analytics or tracking", correct |
| Footer links: Impressum, Datenschutz | present, reachable | |
| Footer links: AGB, Widerruf | missing | (separate texts, not in this draft) |

## Does not match the site

1. **Photo deletion (Critical).** The draft says the original image is deleted 90 days after the order is completed, or immediately if no order follows. The site deletes every uploaded photo 30 days after upload (daily job, `app/api/cron/cleanup/route.ts`), whether or not an order follows. Either change the text to 30 days after upload, or change the job. The "immediately if no order" promise is not implemented at all.
2. **Database provider not named (Critical).** Orders are stored in a Postgres database run by Neon (through Vercel Postgres; `@neondatabase/serverless` and `@vercel/postgres` in `package.json`). The draft names Vercel for hosting and image storage, but not the database provider, its address, transfer basis or data processing agreement.
3. **Social media links (Important).** The draft says the site links to social media profiles. The site has no such links. Remove the section, or add the links first.
4. **Language cookie (Nice to have).** The cookie is set on the first visit, not only when the language is chosen, and it lasts for the browser session. The wording can say that. The TODO in the draft can then go.
5. **Email wording (Nice to have).** The draft calls the customer email an "Bestellbestätigung". The form is now a request (see `docs/DECISIONS.md`, 2026-11-19), and the email confirms the request.

## Matches the site

- Order form fields: name, email, address, optional recipient, format, ultrasound image, optional child's name, week of pregnancy and wishes, consents with time. The site stores the consent version as well, which the text can mention.
- Explicit consent for the ultrasound image as possible health data, unticked by default and required on the server; separate, optional consent for showing the artwork as an example.
- Images stored privately on Vercel Blob; links in the admin email expire after 30 days.
- Fonts self-hosted, no requests to Google.
- Email through Resend; owner inbox on Gmail.
- No payment provider in the code yet, so the Stripe section correctly stays unpublished.

## Not on the site yet

- AGB and Widerrufsbelehrung pages (the form already shows the hint about personalised goods).
- Order data retention: order rows are kept with no deletion job. The draft's general rule ("until the purpose ends", invoices up to ten years) needs a decision on when order rows without an invoice are deleted.
- The legal pages can only show one paragraph today (`components/LegalPage.tsx`). The full text with headings and lists needs a small change to how legal pages are rendered.

## Open placeholders in the draft

- "Stand" date, the owner's full name, phone number.
- Print shop name and address.
- The retention periods (marked TODO(client)).
- The Vercel Blob confirmation (can be closed: images are on Vercel Blob).

## Questions for a lawyer

1. Is the 30-day deletion after upload acceptable, given that the artwork may not be finished by then?
2. Does the database provider need its own section with a data processing agreement, separate from Vercel?
3. Is a session language cookie strictly necessary under § 25 Abs. 2 Nr. 2 TDDDG, as the draft says?
