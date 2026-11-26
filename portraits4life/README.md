# Portraits 4 Life

A bilingual (German/English) Next.js application for ordering artistic ultrasound images printed on canvas. Parents upload an ultrasound image, which is enhanced and printed on canvas.

## Features

- **Bilingual:** German (default) and English, routed under `/de` and `/en`
- **Ordering:** a form with photo upload straight to private storage, consent checkboxes and shipping address for canvas
- **Email:** an admin email with signed photo links, and a plain-text confirmation to the customer
- **Storage:** Vercel Blob (private). Photos are served only through signed links that expire after 30 days
- **Database:** Vercel Postgres (Neon) for order data
- **Coming-soon mode:** `COMING_SOON=true` shows a holding page and blocks crawling

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript (strict)
- Tailwind CSS 4 with design tokens in `app/globals.css`
- Zod for validation, Resend for email, Vercel Blob and Postgres for storage
- Vitest and Testing Library for unit tests, Playwright for end-to-end tests

## Getting started

### Prerequisites

- Node.js 22 (see `.nvmrc`)
- npm

### Installation

```bash
npm install
```

### Environment variables

Copy `.env.example` to `.env.development.local` and fill in the values. The variables are:

| Variable | Purpose |
| --- | --- |
| `POSTGRES_URL` | Postgres connection string (set by Vercel when a Postgres store is connected) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for photo uploads |
| `RESEND_API_KEY` | Resend key for the order emails |
| `ORDER_LINK_SECRET` | Secret that signs the photo links in the admin email |
| `CRON_SECRET` | Secret that the daily cleanup job must present |
| `SITE_URL` | Public address of the site, used for absolute links |
| `ORDER_EMAIL` | Where the admin order email goes |
| `ORDER_FROM_EMAIL` | Sender address for all order emails (must be a verified sender in production) |
| `COMING_SOON` | `true` shows the holding page instead of the site |

In production, an order is refused before it is saved if `ORDER_EMAIL` or `ORDER_FROM_EMAIL` is missing.

### Development

```bash
npm run dev
# Open http://localhost:3000
```

### Database setup

```bash
npm run db:init
```

The script creates the `orders` table if it is missing and adds any newer columns. It is safe to run again. It reads `POSTGRES_URL` from `.env.development.local`.

### Build and production

```bash
npm run build
npm run start
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run lint` | ESLint (zero warnings expected) |
| `npm run type-check` | TypeScript without emitting files |
| `npm test -- run` | Unit and component tests (Vitest), once. Without `-- run` it watches |
| `npm run e2e` | End-to-end tests (Playwright, Chromium at 375x667 and 1440x900, with axe). Builds and starts the site, or reuses a server already on port 3000 (stop it first to test a new build) |
| `npm run build` | Production build |
| `npm run audit` | npm audit of production dependencies, high and critical only |
| `npm run knip` | Unused files, exports and dependencies (config in `knip.json`) |
| `npm run jscpd` | Copy-paste detection |
| `npm run lighthouse` | Lighthouse CI budgets (config in `lighthouserc.json`; needs a build) |
| `npx prettier --check .` | Formatting check. Markdown is excluded (`.prettierignore`) |
| `npm run db:init` | Creates or updates the database tables |
| `npm run mobile-check -- <url>` | Measures the phone view and saves screenshots (see below) |
| `npm run privacy-scan -- <url>` | Lists cookies, storage and outside requests of the running site (used by the datenschutz agent) |

All scripts need Node 22: run `nvm use` first. On Node 20 the tests fail with `ERR_REQUIRE_ESM`.

## Project structure

```
app/
├── [locale]/               # German and English pages
│   ├── layout.tsx          # Root layout, language check
│   ├── page.tsx            # Landing page
│   ├── order/page.tsx      # Order page
│   ├── datenschutz/, impressum/  # Legal pages
│   └── coming-soon/        # Holding page used while COMING_SOON=true
├── sitemap.ts, robots.ts   # Built from content/routes.ts
├── api/
│   ├── orders/route.ts     # POST an order
│   ├── orders/upload/      # Token for a direct photo upload
│   ├── orders/files/       # Serves one private photo to a valid signed link
│   └── cron/cleanup/       # Daily deletion of photos older than 30 days
i18n.ts                     # next-intl request config
proxy.ts                    # Locale routing and coming-soon mode (Next 16 name for middleware)
components/                 # Page sections, the order form and its field components
content/                    # Data, not prose: products, prices, routes, shipping countries
content/legal/              # Legal texts as Markdown, one file per page and language
lib/                        # Validation, emails, signed links, metadata, security headers, helpers
messages/                   # All visible text, German and English
scripts/                    # Database setup, mobile check, privacy scan
e2e/                        # Playwright tests (one spec file)
docs/                       # DECISIONS.md, REMAINING.md, client review notes, reviews/
.claude/                    # Agents and commands for Claude Code (settings stay local)
```

## Project documents

| File | What it holds |
| --- | --- |
| `CLAUDE.md` and `AGENTS.md` | Rules for Claude Code: workflow, constraints, code, tests, review, agents |
| `docs/DECISIONS.md` | One entry per decision (date, status, decision, why, considered). Read before changing design, colours, navigation or page structure |
| `docs/REMAINING.md` | Next steps, launch blockers and open work |
| `docs/reviews/` | Reports written by the agents. Local only (git-ignored); older reports stay tracked |
| `docs/local/` | Local session notes (git-ignored), starting with `NEXT_SESSION.md` |
| `content/legal/*.md` | Legal texts. `<!-- TODO(client) -->` comments are not shown on the page |

Search for `TODO(client)` and `PLACEHOLDER(client)` to list what the client still has to provide.

## Agents (Claude Code)

The agents in `.claude/agents/` are read only. Each writes one report to `docs/reviews/` and never changes code.

| Agent | When to run it |
| --- | --- |
| `reviewer` | Before every pull request, and for full audits |
| `visual-checker` | After layout or styling changes |
| `mobile-view` | After layout, navigation or styling changes, and before a pull request that touches them |
| `performance` | After images or anything external change, and before launch |
| `datenschutz` | Before launch, after adding a service, dependency, cookie or form field, after changing legal texts, and once a month |

The command `/client-list` writes a short German message with everything the client still has to provide.

## API

### POST `/api/orders`

Creates an order. The photos are uploaded first to private storage, and the order carries only their storage paths.

**Request (JSON):**

```json
{
  "name": "string",
  "email": "string",
  "product": "canvas",
  "canvasSize": "30x30cm",
  "childName": "optional string",
  "weeksInWomb": "optional string",
  "specialRequests": "optional string",
  "locale": "de",
  "requestCode": "8 hex characters, from the browser",
  "ultrasoundPath": "orders/...",
  "referencePath": "optional orders/...",
  "consent": { "processing": true, "rights": true, "showcase": false, "version": "..." },
  "website": "honeypot, must stay empty",
  "shippingStreet": "...",
  "shippingCity": "...",
  "shippingPostalCode": "...",
  "shippingCountry": "DE",
  "deliverToOther": false,
  "shippingRecipient": "required when deliverToOther is true"
}
```

The shipping fields are sent for a canvas only. The postal code is checked against the country (`content/shipping.ts`). Digital orders are refused while the digital file is not sold (see `content/products.ts`). The browser builds this body in `lib/order-submit.ts`; the server checks it with the Zod schema in `lib/order-schema.ts`.

**Response (201):**

```json
{
  "success": true,
  "reference": "P4L-261117-K7QM",
  "confirmationSent": true,
  "message": "Order submitted successfully"
}
```

Failures return `{ "success": false, "message": "..." }`. A 400 for invalid data adds `issues` (field and message per problem). A 500 adds `code`, the request code the customer can quote; the server logs the failed step under that code, never the customer's details. A 429 (too many requests) has neither.

Requests are limited to five per visitor per 15 minutes.

### POST `/api/orders/upload`

Issues a short-lived token so the browser can upload a photo straight to private storage. Accepts JPG, PNG, WebP, HEIC and HEIF up to 15 MB, in the `orders/` folder only. Limited to 20 requests per visitor per 15 minutes.

### GET `/api/orders/files`

Serves one private photo. It needs a valid, unexpired signature in the link from the admin email.

### GET `/api/cron/cleanup`

Run daily by Vercel (see `vercel.json`). Deletes order photos older than 30 days. It needs `Authorization: Bearer <CRON_SECRET>`.

There is no public endpoint to read orders. Orders are read from the database and the admin email.

## Emails

When an order is saved:

1. **Admin email** to `ORDER_EMAIL`, with the order details and signed links to the photos (valid 30 days). The reply-to is the customer's address.
2. **Customer confirmation** to the customer, in the language of the page: the reference, the product, the expected delivery time and the three next steps. The reply-to is `ORDER_EMAIL`.

If an email cannot be sent, the order is still saved and the customer still sees success. The failure is logged.

## Database

The table is created and updated by `scripts/init-db.js` (`npm run db:init`):

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  product VARCHAR(50) NOT NULL,
  canvas_size VARCHAR(50),
  child_name VARCHAR(255),
  weeks_in_womb VARCHAR(50),
  special_requests TEXT,
  ultrasound_image_url TEXT,
  reference_image_url TEXT,
  shipping_address JSONB,
  consent_showcase BOOLEAN DEFAULT FALSE,
  consent_version VARCHAR(50),
  consent_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

Columns added later with `ALTER TABLE` (the script adds them if missing): `reference VARCHAR(32)` (P4L-YYMMDD-XXXX) and the consent columns. Indexes: email, status, created time, and a unique index on `reference`.

## Deployment

Deployed on **Vercel**. Pushes to `main` deploy to production. Set the environment variables in Vercel Project Settings, under Environment Variables, for each environment that needs them. Preview deployments need the same order-related variables as production to send orders.

## Development workflow

1. Update `main` (`git pull --ff-only`), then create a branch: `git checkout -b feat/description` (or `fix/`, `chore/`, `docs/`, `test/`, `style/`, `refactor/`)
2. Make the change and run `npm run lint`, `npm run type-check`, `npm test -- run` and `npm run build`. Run `npm run e2e` when layout, navigation or the order flow changed
3. Commit with a Conventional Commit message with a scope, for example `feat(order): ...`. One commit per step
4. Run the `reviewer` agent on the branch and fix Critical and Important findings
5. Merge `main` into the branch if it moved on (never rebase a pushed branch), push, and open a pull request into `main`
6. CI runs lint-and-types, test, audit and e2e on the pull request. Merge when all are green

After `npm install` or `npm uninstall`, check the `package-lock.json` diff for removed `libc` lines and restore them (see DECISIONS, 2026-11-19).

## Coming-soon mode

With `COMING_SOON=true` (set in Vercel for Production only), `proxy.ts` shows the holding page at `/{locale}/coming-soon` for every page and robots blocks crawling. API routes keep working. Leave it empty locally.

## Legal texts

Long legal texts are Markdown files in `content/legal/<page>.<locale>.md`, rendered at build time by `lib/legal-text.tsx` (headings, paragraphs, lists, links). HTML comments are hidden, so a section can be switched off by wrapping it in a comment. A page without a file shows its placeholder from the message files. A test lists the open placeholders in the German Datenschutz.

## Mobile check

Measures the phone view (375 x 667 and 320 x 568) and saves key screens. Start the dev server or the built site first, then:

```bash
npm run mobile-check -- http://localhost:3000
```

The script writes `docs/reviews/mobile/result.json` and screenshots. That folder is git-ignored.

## Text and languages

All visible text is in `messages/de.json` and `messages/en.json`. Both files must have the same keys (a test checks this). Product data (prices, sizes, delivery times) is in `content/products.ts`.

## Files and privacy

- Photos are stored privately, not publicly, and are served only through signed links.
- Photos are deleted automatically 30 days after upload by the daily cleanup job.
- Order data is kept in the database. Its retention period is still to be decided.
- Fonts are self-hosted at build time with `next/font`; apart from the photo upload, which goes from the browser straight to Vercel Blob (`*.blob.vercel-storage.com`), the site makes no request to another domain.
- Security headers (CSP, HSTS and others) come from `lib/security-headers.ts`.
- Logs carry the request code and the failed step, never the customer's details.

## Contact

Business email: portraits4life.art@gmail.com
