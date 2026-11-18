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
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript without emitting files |
| `npm test` | Unit and component tests (Vitest) |
| `npm run e2e` | End-to-end tests (Playwright, builds and starts the site) |
| `npm run build` | Production build |
| `npm run db:init` | Creates or updates the database tables |
| `npm run mobile-check -- <url>` | Measures the phone view and saves screenshots (see below) |

## Project structure

```
app/
├── [locale]/               # German and English pages
│   ├── layout.tsx          # Root layout, language check
│   ├── page.tsx            # Landing page
│   ├── order/page.tsx      # Order page
│   └── coming-soon/        # Holding page used while COMING_SOON=true
├── api/
│   ├── orders/route.ts     # POST an order
│   ├── orders/upload/      # Token for a direct photo upload
│   ├── orders/files/       # Serves one private photo to a valid signed link
│   └── cron/cleanup/       # Daily deletion of photos older than 30 days
components/                 # Page sections and the order form
content/                    # Products, prices, delivery times and routes
lib/                        # Validation, emails, links, metadata, helpers
messages/                   # German and English text
scripts/init-db.js          # Database setup (npm run db:init)
e2e/                        # Playwright tests
```

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
  "shippingFullName": "...",
  "shippingStreet": "...",
  "shippingCity": "...",
  "shippingState": "...",
  "shippingPostalCode": "...",
  "shippingCountry": "..."
}
```

Digital orders are refused while the digital file is not sold (see `content/products.ts`).

**Response (201):**

```json
{
  "success": true,
  "reference": "P4L-261117-K7QM",
  "confirmationSent": true,
  "message": "Order submitted successfully"
}
```

Failures return `{ "success": false, "message": "...", "code": "..." }` with a request code the customer can quote. The server logs the failed step under that code, never the customer's details.

Requests are limited to five per visitor per 15 minutes.

### POST `/api/orders/upload`

Issues a short-lived token so the browser can upload a photo straight to private storage. Accepts JPG, PNG, WebP and HEIC up to 15 MB, in the `orders/` folder only. Limited to 20 requests per visitor per 15 minutes.

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
  reference VARCHAR(32),          -- P4L-YYMMDD-XXXX, unique
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

Indexes: email, status, created time, and a unique index on `reference`.

## Deployment

Deployed on **Vercel**. Pushes to `main` deploy to production. Set the environment variables in Vercel Project Settings, under Environment Variables, for each environment that needs them. Preview deployments need the same order-related variables as production to send orders.

## Development workflow

1. Create a branch: `git checkout -b feat/description` (or `fix/`, `chore/`, `docs/`, `test/`)
2. Make the change and run `npm test`, `npm run lint`, `npm run type-check` and `npm run build`
3. Commit with a Conventional Commit message, for example `feat(order): ...`
4. Push and open a pull request into `main`

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

## Contact

Business email: portraits4life.art@gmail.com
