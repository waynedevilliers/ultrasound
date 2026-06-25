# Portraits 4 Life

A bilingual (English/German) Next.js landing page and order form for a service that artistically enhances ultrasound images and prints them on canvas for new parents.

## Product Overview

Portraits 4 Life transforms black-and-white ultrasound images into beautiful, artistic prints. The service offers:

- Digital JPEG enhancements (€30-50, 1 week delivery)
- Canvas prints in three sizes:
  - 30x30cm: €69
  - 40x40cm: €89
  - 50x50cm: €119
  (1-2 weeks delivery)

## Technology Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (button, card, tabs, accordion)
- **Testing**: Jest + React Testing Library
- **Internationalization**: Dynamic routing with usePathname (EN/DE)

## Key Features

1. **Bilingual Support**: Full English/German interface with language switcher in header
2. **Responsive Design**: Mobile-first design tested at 320px-1920px viewports
3. **Image Gallery**: Click-to-enlarge modal for viewing artwork samples
4. **Order Form**: Multi-field form with conditional fields, file uploads, and validation
5. **Comprehensive Tests**: 65+ tests covering functionality, responsiveness, and languages

## Project Structure

```
portraits4life/
├── app/[locale]/
│   ├── layout.tsx          # Root layout with locale provider
│   ├── page.tsx            # Landing page
│   └── order/
│       └── page.tsx        # Order page
├── components/
│   ├── Header.tsx          # Navigation + language switcher
│   ├── Hero.tsx            # Hero section with CTA
│   ├── HowItWorks.tsx      # 3-step process
│   ├── Gallery.tsx         # Image gallery with modal
│   ├── PricingTiers.tsx    # Pricing options
│   ├── FAQ.tsx             # FAQ section with accordion
│   ├── ContactSection.tsx  # Contact info and CTA
│   ├── OrderForm.tsx       # Order form component
│   ├── OrderInfo.tsx       # Order information accordion
│   └── Footer.tsx          # Footer
├── messages/
│   ├── en.json             # English translations
│   └── de.json             # German translations
├── public/images/
│   ├── logo.avif           # Company logo
│   ├── ultrasound.avif     # Hero image
│   ├── ultrasound2.avif    # Gallery image 1
│   └── ultrasound3.avif    # Gallery image 2
├── __tests__/              # Test files
├── jest.config.ts          # Jest configuration
├── jest.setup.ts           # Jest setup
└── TEST_GUIDE.md           # Testing documentation
```

## Development

### Setup

```bash
npm install
npm run dev
```

Visit http://localhost:3000/en or http://localhost:3000/de

### Build

```bash
npm run build
npm start
```

### Testing

```bash
npm test              # Run all tests
npm test:watch       # Watch mode
npm test:coverage    # Coverage report
```

### Linting

```bash
npm run lint
```

## Pages

### Landing Page (`/en`, `/de`)
- Hero section with headline and CTA buttons
- How It Works (3-step process)
- Image Gallery (2 artwork samples with click-to-enlarge)
- Pricing Tiers (digital and canvas options)
- FAQ (5 questions with expand/collapse)
- Contact Section with email and CTA

### Order Page (`/en/order`, `/de/order`)
- Multi-field order form with validation
- Product selection (Digital JPEG or Canvas Print)
- Conditional canvas size dropdown
- File upload inputs (max 15MB)
- Order information accordion
- Success message on submission

## Translations

All content is translated to English and German in:
- `messages/en.json`
- `messages/de.json`

Language detection uses `usePathname()` to check if URL starts with `/de`.

## Testing

65+ tests covering:
- Component rendering
- Language switching functionality
- Mobile responsiveness (5 breakpoints)
- Form validation and submission
- Image gallery modal functionality
- Accessibility (labels, alt text, semantic HTML)

See `TEST_GUIDE.md` for detailed test documentation.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive from 320px (iPhone SE) to 1920px (desktop)

## Performance

- Image optimization with Next.js Image component
- AVIF format for smaller file sizes
- Tailwind CSS for minimal CSS output
- No external API calls (form submission ready for backend)

## Next Steps

See INSTRUCTIONS.md for detailed information on what remains to be implemented.

## Contact

Email: portraits4life.art@gmail.com
