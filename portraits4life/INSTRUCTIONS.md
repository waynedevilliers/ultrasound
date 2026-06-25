# Development Instructions for Next Session

## What Has Been Completed

### 1. Project Setup
- Next.js 14+ with TypeScript
- Tailwind CSS v4 configuration
- shadcn/ui components (button, card, tabs, accordion)
- Folder structure: app/[locale]/, components/, messages/

### 2. Core Pages & Routing
- Landing page: `/en` and `/de` (bilingual)
- Order page: `/en/order` and `/de/order` (bilingual)
- Dynamic locale routing using [locale] parameter in app directory
- usePathname() for locale detection (no next-intl library)

### 3. Components Built

#### Header (components/Header.tsx)
- Logo display (logo.avif)
- Bilingual navigation (Home/Start, Order/Bestellen, Formats/Formate, Contact/Kontakt)
- Language switcher button (EN/DE toggle)
- Locale-specific links
- Responsive navigation

#### Hero Section (components/Hero.tsx)
- Bilingual headline "ULTRASOUND ART"
- Descriptive body text (English + German)
- Two CTA buttons with locale-specific links
- Hero image (ultrasound.avif)

#### How It Works (components/HowItWorks.tsx)
- 3-step process with numbered cards (1, 2, 3)
- Steps: Upload → Enhance → Receive
- Bilingual titles and descriptions
- Hover effects on cards

#### Gallery (components/Gallery.tsx)
- 2 artwork images (ultrasound2.avif, ultrasound3.avif)
- Click-to-enlarge modal functionality
- Images displayed in 2-column grid
- Hover scale effect (scale-105)
- Modal closes on X button click or outside click
- Responsive sizing

#### Pricing Tiers (components/PricingTiers.tsx)
- Digital JPEG option: €30-50 (1 week delivery)
- Canvas prints: €69 (30x30cm), €89 (40x40cm), €119 (50x50cm) (1-2 weeks delivery)
- Card-based layout
- CTA buttons for each tier
- Bilingual content

#### FAQ (components/FAQ.tsx)
- 5 bilingual Q&A items
- Accordion-style expand/collapse
- Questions cover: processing time, image formats, preview approval, shipping, satisfaction guarantee
- Contact link in FAQ footer

#### Contact Section (components/ContactSection.tsx)
- Dark gradient background
- Email display (portraits4life.art@gmail.com)
- Bilingual heading and description
- CTA button linking to order page

#### Order Form (components/OrderForm.tsx)
- Name field (required)
- Email field (required, with validation)
- Product dropdown (Digital JPEG / Canvas Print)
- Conditional canvas size dropdown (only when canvas selected)
- Optional fields: Child's name, Weeks in womb
- File upload fields (2 fields, max 15MB each)
- Special requests textarea
- Submit button
- Success message display on submission

#### Order Info (components/OrderInfo.tsx)
- 4 accordion sections: Ultrasound Portraits, Individual Portraits, Couple Portraits, Payment
- Bilingual titles and detailed descriptions
- Uses shadcn/ui accordion component

#### Footer (components/Footer.tsx)
- Company name and logo
- Email contact
- Copyright info
- Bilingual content

### 4. Translations
- messages/en.json: All English copy
- messages/de.json: All German translations
- No placeholder text, all real copy

### 5. Styling
- Tailwind CSS utility classes throughout
- Playfair Display font for headlines (elegant serif)
- Responsive breakpoints: mobile (320px), tablet (768px), desktop (1024px+)
- Hover effects on interactive elements
- Box shadows for depth
- Color palette: warm tones with pink accent (#ef3d6c)

### 6. Testing Suite
- Jest configuration (jest.config.ts, jest.setup.ts)
- React Testing Library setup
- 65+ tests across 5 test files:
  - Header.test.tsx: Navigation, language switching, responsiveness
  - Gallery.test.tsx: Image rendering, modal, responsiveness
  - OrderForm.test.tsx: Form validation, file upload, submission
  - Integration.test.tsx: Full page sections, language consistency
  - Responsiveness.test.tsx: Mobile-first, breakpoints, touch targets
- TEST_GUIDE.md: Complete testing documentation

### 7. Current State
- Development server runs successfully at localhost:3000
- All pages render correctly in both English and German
- Gallery images display properly with click-to-enlarge functionality
- Language switcher works (routes between /en and /de)
- Form inputs are functional with validation
- Mobile responsiveness tested at multiple viewports
- All tests configured and documented

---

## What Still Needs to Be Done

### 1. Backend Integration
- Form submission endpoint (handle POST request from OrderForm)
- Store order data in database
- Send confirmation email to user
- Handle file uploads (image storage)
- Email notifications to admin (portraits4life.art@gmail.com)
- Payment processing (PayPal, bank transfer, credit card)

### 2. Database Setup
- User/order schema
- Image storage (AWS S3 or similar)
- Order status tracking
- Email templates

### 3. Admin Dashboard (Optional)
- View submitted orders
- Approve/reject image submissions
- Update order status
- Send progress updates to customers

### 4. Payment Integration
- Stripe, PayPal, or similar payment gateway
- Secure payment handling
- Invoice generation
- Payment confirmation flow

### 5. Email System
- Transactional email service (SendGrid, Mailgun, etc.)
- Order confirmation email template
- Image approval notification
- Shipping notification
- Admin alerts for new orders

### 6. Image Processing
- Backend image processing to generate artwork
- Before/after image storage
- Preview generation for customer approval
- High-resolution file generation for printing

### 7. Authentication (If Needed)
- User accounts for tracking orders
- Password reset
- Order history viewing
- Invoice download

### 8. Analytics & SEO
- Google Analytics integration
- Meta tags and Open Graph
- Sitemap.xml generation
- robots.txt configuration

### 9. Deployment
- Environment variables configuration
- Database deployment
- Image storage setup
- CI/CD pipeline (if using GitHub Actions)
- Production domain setup

### 10. Maintenance & Monitoring
- Error logging (Sentry or similar)
- Performance monitoring
- Uptime monitoring
- Customer support system

---

## Files Changed in This Session

### Created
- jest.config.ts
- jest.setup.ts
- __tests__/Header.test.tsx
- __tests__/Gallery.test.tsx
- __tests__/OrderForm.test.tsx
- __tests__/Integration.test.tsx
- __tests__/Responsiveness.test.tsx
- TEST_GUIDE.md
- README.md (this file)
- INSTRUCTIONS.md (this document)

### Modified
- package.json: Added testing dependencies and test scripts

### Existing (No Changes)
- All component files (already completed in previous session)
- All translation files
- All page files
- Configuration files (next.config.ts, tailwind.config.ts, etc.)

---

## Important Notes for Next Developer

### Locale Handling
- Uses Next.js App Router with [locale] dynamic segment
- No next-intl library (simplified approach)
- Language detection: `usePathname().startsWith('/de')`
- Language switching: Replace pathname /en with /de (or vice versa)

### Image Gallery
- Images are plain HTML img tags (not Next.js Image component)
- Files: ultrasound2.avif, ultrasound3.avif in public/images/
- Click handler opens fullscreen modal with image.src
- Modal managed with React useState

### Form Validation
- HTML5 required attributes
- Email field has type="email" for browser validation
- File inputs accept image/* MIME types
- Max file size enforced by maxLength attribute (15MB)

### Testing
- Tests use jest.mock for next/navigation
- Image component mocked to render as img tags
- usePathname() mocked to return specific locale
- 65+ tests provide comprehensive coverage

### Known Limitations
- No backend (form submits to success message only)
- No database integration
- No email system
- No payment processing
- Images are placeholder/sample files

---

## Git Commits in This Session

1. `730152f` - test: Add comprehensive test suite for functionality, responsiveness, and language
2. `8d7d8d4` - feat: Add lightbox modal for full-size gallery images
3. `cc8e98d` - improve: Make gallery images bigger and more interactive
4. Previous commits from earlier session

---

## Quick Start for Next Developer

1. Clone repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Visit http://localhost:3000/en or http://localhost:3000/de
5. Run tests: `npm test`
6. Check TEST_GUIDE.md for testing details
7. See CLAUDE.md for project standards and guidelines

---

## Key Architecture Decisions

1. **Locale Handling**: Used dynamic routing [locale] instead of next-intl for simplicity
2. **Image Gallery**: Implemented click-to-enlarge as modal instead of separate page
3. **Form**: Client-side validation only (no backend validation yet)
4. **Testing**: Comprehensive unit and integration tests to ensure functionality

---

## Environment Variables Needed (For Backend Integration)

```
DATABASE_URL=
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=
SENDGRID_API_KEY=
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
ADMIN_EMAIL=portraits4life.art@gmail.com
ENVIRONMENT=development|production
```

---

**Last Updated**: 2026-06-23
**Status**: Frontend complete, Backend pending
