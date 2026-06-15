# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Portraits 4 Life** is a bilingual (German/English) Next.js landing page and order page for a service that artistically enhances ultrasound images and prints them on canvas for new parents. The site uses a warm, emotional design with elegant typography and soft, premium color palette.

## Tech Stack & Setup

**Framework**: Next.js 14+ (App Router)
**Language**: TypeScript
**Styling**: Tailwind CSS + shadcn/ui components
**Internationalization**: next-intl (German/English)
**Package Manager**: npm

### Initial Setup

```bash
npx create-next-app@latest portraits4life --typescript --tailwind --app --src-dir=false
cd portraits4life
npx shadcn@latest init
npx shadcn@latest add button card tabs accordion
npm install next-intl
```

### Development Commands

```bash
npm run dev           # Start development server (http://localhost:3000)
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm test              # Run tests (if configured)
```

## Architecture

### i18n Structure (next-intl)

The application uses file-based routing with locale parameters:

```
app/
├── [locale]/
│   ├── layout.tsx       # Root layout with locale provider
│   ├── page.tsx         # Landing page (/)
│   └── order/
│       └── page.tsx     # Order page (/order)
messages/
├── de.json              # German translations
└── en.json              # English translations
```

**Key Pattern**: All pages are wrapped in `[locale]` directory. URLs are `/en/`, `/de/`, `/en/order/`, `/de/order/`. The language switcher persists the user's choice via localStorage or cookies.

### Component Structure

Components are organized by page section:

```
components/
├── Header.tsx           # Logo, nav (Home | Order | Formats | Contact), language switcher
├── Hero.tsx             # Emotional headline, subheadline, dual CTA buttons
├── HowItWorks.tsx       # 3-step process (Upload → Enhance → Receive)
├── PricingTiers.tsx     # Digital Download vs Canvas Print cards
├── ContactSection.tsx   # Email, CTA button
├── OrderForm.tsx        # Multi-field form with file uploads
└── Footer.tsx           # Logo, email, copyright
```

Each component uses `useTranslations()` from next-intl to access localized strings.

### Translations Pattern

Strings are stored in `messages/de.json` and `messages/en.json`. Example structure:

```json
{
  "header": {
    "home": "Home",
    "order": "Bestellen / Order",
    "formats": "Formate",
    "contact": "Kontakt"
  },
  "hero": {
    "headline": "ULTRASOUND ART",
    "body": "..."
  }
}
```

Import translations in components:
```typescript
const t = useTranslations();
<h1>{t('hero.headline')}</h1>
```

## Design Principles

### Color Palette
- **Primary Accent**: Dusty rose (use for CTAs, highlights)
- **Headlines**: Elegant serif font, warm tones
- **Body Text**: Clean sans-serif, soft gray
- **Backgrounds**: Creams, whites, deep charcoal accents
- **Gold Accents**: For premium feel

### Tone & Voice
- Warm, emotional, premium — this is a keepsake for new mothers
- Copy should feel personal and artistic, not corporate
- Mobile-first responsive design
- Elegant, not trendy

### Typography
- **Headlines**: Serif font for elegance (e.g., Playfair Display, Georgia)
- **Body**: Sans-serif for readability (e.g., Inter, Poppins)
- Reference `/screenshots/` for existing design direction

### Images & Assets
- Product/hero images: place in `public/images/`
- Reference images: check `/screenshots/` for color palette and design cues
- Ultrasound image example: use warm, artistic enhancement as visual concept

## Form Handling

The order form (OrderForm.tsx) is **UI-only** at this stage — no backend integration required:

- Submit button can trigger `mailto:` link or show success confirmation modal
- File uploads show file picker (no actual upload processing)
- Fields: Name, Email, Product choice (dropdown), Canvas size, Child's name, Weeks in womb, Upload fields (2 max 15MB), Message/special requests
- Information sections below form use accordion or card layout explaining image requirements

## Common Development Tasks

### Adding a new translation string
1. Add key to both `messages/de.json` and `messages/en.json`
2. Use `t('key.path')` in components via `useTranslations()`

### Adding a new shadcn component
```bash
npx shadcn@latest add <component-name>
```

### Creating a new page
1. Create folder in `app/[locale]/new-page/`
2. Add `page.tsx` with locale-aware layout
3. Add route to Header navigation
4. Add translation strings for any labels

### Styling with Tailwind
- Use Tailwind utility classes (no custom CSS unless necessary)
- Ensure mobile-first responsive design (test at 375px, 768px, 1024px+)
- Maintain warm, premium aesthetic across all breakpoints

## Key Files & Their Roles

| File | Purpose |
|------|---------|
| `app/[locale]/layout.tsx` | Root layout, locale provider setup |
| `app/[locale]/page.tsx` | Landing page with Header, Hero, HowItWorks, Pricing, Contact, Footer |
| `app/[locale]/order/page.tsx` | Order/Bestellen page with OrderForm and info sections |
| `messages/de.json`, `messages/en.json` | All user-facing strings (use only real copy, no lorem ipsum) |
| `tailwind.config.ts` | Tailwind configuration (color palette, fonts) |

## Implementation Notes

- **No backend yet**: Order form shows confirmation or mailto — no database
- **Copy**: Use the real German and English copy provided in instructions.md — no placeholder lorem ipsum
- **Language Persistence**: Language switcher choice should persist (localStorage or cookie)
- **Build Order**: Start with landing page (landing), then order page (order) — both fully responsive
- **Design References**: Check `/screenshots/` for existing Wix site inspiration and `/images/` for available product photos
