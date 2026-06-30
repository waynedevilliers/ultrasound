# Portraits 4 Life

A bilingual (German/English) Next.js application for ordering artistic ultrasound image enhancements and canvas prints. Customers submit ultrasound images, which are enhanced and printed on canvas or delivered as digital JPEGs.

**Live:** https://portraits4life.vercel.app

## Features

- Bilingual Support - German and English with automatic locale routing
- Order Management - Customers place orders with image uploads
- Email Notifications - Admin + customer confirmation emails via Resend
- File Storage - Vercel Blob for image storage
- Database - Vercel Postgres for order data
- Responsive Design - Tailwind CSS with mobile-first approach
- API Endpoints - POST orders, GET order by ID

## Tech Stack

- **Framework:** Next.js 16.2.9 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **i18n:** next-intl
- **Database:** Vercel Postgres
- **File Storage:** Vercel Blob
- **Email:** Resend
- **Deployment:** Vercel

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Setup

Create `.env.development.local`:

```env
POSTGRES_URL=your_postgres_url
RESEND_API_KEY=your_resend_api_key
BLOB_READ_WRITE_TOKEN=your_blob_token
BLOB_STORE_ID=your_blob_store_id
```

### Development

```bash
npm run dev
# Open http://localhost:3000
```

### Build & Production

```bash
npm run build
npm run start
```

## Project Structure

```
app/
├── [locale]/
│   ├── layout.tsx          # Root layout with locale provider
│   ├── page.tsx            # Landing page
│   └── order/
│       └── page.tsx        # Order/Bestellen page
├── api/
│   ├── orders/
│   │   ├── route.ts        # POST orders, receives form + files
│   │   └── [id]/route.ts   # GET order by ID
messages/
├── de.json                 # German translations
└── en.json                 # English translations
components/
├── Header.tsx              # Navigation + language switcher
├── Hero.tsx                # Hero section with CTA
├── HowItWorks.tsx          # 3-step process section
├── PricingTiers.tsx        # Products & pricing
├── OrderForm.tsx           # Order form with file uploads
├── Footer.tsx              # Footer with contact info
└── ...
lib/
└── db.ts                   # Database functions
```

## API Endpoints

### POST `/api/orders`

Submit a new order with files.

**Request:**
```
Content-Type: multipart/form-data

name: string
email: string
product: "digital" | "canvas"
canvasSize?: string (for canvas)
childName?: string
weeksInWomb?: string
specialRequests?: string
ultrasoundImage: File (required)
referenceImage?: File
shippingFullName?: string (for canvas)
shippingStreet?: string (for canvas)
shippingCity?: string (for canvas)
shippingState?: string (for canvas)
shippingPostalCode?: string (for canvas)
shippingCountry?: string (for canvas)
```

**Response:**
```json
{
  "success": true,
  "orderId": 1,
  "message": "Order submitted successfully"
}
```

### GET `/api/orders/[id]`

Retrieve an order by ID.

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "product": "digital",
  "ultrasound_image_url": "https://...",
  "status": "pending",
  "created_at": "2024-06-29T09:24:31.227Z"
}
```

## Email Workflow

When an order is placed:

1. **Admin Notification** - portraits4life.art@gmail.com, wrdevilliers@gmail.com
   - Order details, customer info
   - Clickable links to uploaded images
   - Used to start artwork immediately

2. **Customer Confirmation** - customer's email
   - Order confirmation with ID
   - Expected delivery timeframe
   - Next steps

## Deployment

Deployed on **Vercel** with automatic deployments on `main` branch push.

### Required Environment Variables (Vercel)

- `POSTGRES_URL` - Vercel Postgres connection string
- `RESEND_API_KEY` - Email service API key
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token
- `BLOB_STORE_ID` - Blob store identifier

Set these in Vercel Project Settings > Environment Variables.

## Development Workflow

1. Create feature branch - `git checkout -b feature/description`
2. Make changes - Edit code
3. Test locally - `npm run dev`
4. Build check - `npm run build`
5. Commit - `git commit -m "description"`
6. Push - `git push origin feature/description`
7. Deploy - Merge to main (Vercel auto-deploys)

## Code Quality

- Type Safety - Full TypeScript coverage
- Efficient - Minimal dependencies, optimized bundle
- Clean - No dead code, console logs removed
- Bilingual - All user-facing text translated

## Database Schema

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  product VARCHAR(50) CHECK (product IN ('digital', 'canvas')),
  canvas_size VARCHAR(50),
  child_name VARCHAR(255),
  weeks_in_womb VARCHAR(50),
  special_requests TEXT,
  ultrasound_image_url TEXT,
  reference_image_url TEXT,
  shipping_address JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_email ON orders(email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

## Internationalization

**Supported Languages:**
- German (de)
- English (en)

**Default:** German (`/de/`)

Translations in `messages/{locale}.json`. Access via `usePathname()` to detect current locale.

## File Upload Security

- Max file size: 15MB
- Accepted types: Image files (jpg, png, etc.)
- Storage: Vercel Blob (public access for email delivery)
- Cleanup: Not implemented (files persist indefinitely)

## Contact & Support

Business Email: portraits4life.art@gmail.com
Alternative: wrdevilliers@gmail.com

Built for new parents and their precious memories.
