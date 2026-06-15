Portraits 4 Life — Claude Code Build Instructions

Project Overview

Build a bilingual (German + English) Next.js landing page and order page for Portraits 4 Life — a service that artistically enhances ultrasound images and prints them on canvas for new parents.


Tech Stack


Next.js 14+ (App Router)
Tailwind CSS for styling
shadcn/ui for components (buttons, cards, tabs)
next-intl for German/English language switching
TypeScript



Design Direction


Look in /screenshots/ for color and design references from the existing Wix site and use them as inspiration
Look in /images/ for any product or hero images to use on the landing page
Tone: warm, emotional, premium — this is a keepsake for new mothers
Palette hint: soft, warm tones — creams, dusty rose, deep charcoal, gold accents
Typography: elegant serif for headlines, clean sans-serif for body
Mobile-first, fully responsive
Language switcher (DE / EN) in the header



Pages to Build

1. / — Landing Page

Header


Logo: "Portraits 4 Life" (text logo for now)
Navigation: Home | Order | Formats | Contact
Language switcher: DE | EN


Hero Section


Large emotional headline (see copy below)
Subheadline
Two CTA buttons: "Jetzt bestellen / Order Now" and "Formate ansehen / View Formats"
Hero image: use an image from /images/ if available, otherwise a warm placeholder


How It Works — 3 Steps


Upload your ultrasound image
We artistically enhance it
Receive your canvas print or digital file


Product/Pricing Tiers
Two cards side by side:

Digital DownloadCanvas PrintHigh-res JPEGPrinted on canvas€9–15From €29 (30×30cm)Instant delivery~2 weeks delivery

Sizes for canvas:


30×30 cm — €29
40×40 cm — €39
50×50 cm — €55


Optional Add-ons (mention as bullet points)


Child's name added
Number of weeks in the womb


Contact Section


Email: portraits4life.art@gmail.com
CTA Button linking to order page and mailto


Footer


Simple: Logo, email, copyright



2. /order — Order / Bestellen Page

Page Title: Bestellen / Order

Upload Form (no backend needed yet — UI only, form submits to mailto or shows a success message)

Fields:


Name
Email
Product choice: Digital Download / Canvas Print (dropdown or radio)
Canvas size (if canvas selected): 30×30 / 40×40 / 50×50
Optional: Child's name
Optional: Weeks in womb
Upload field 1: Ultrasound photo (max 15MB)
Upload field 2: Second photo if needed (e.g. for couple portrait) (max 15MB)
Message / special requests (textarea)
Submit button


Information Sections below the form (accordion or cards):

For Ultrasound Portrait:


Choose a clear ultrasound image — profile views work best
You will be notified immediately if the image is usable
If not, you can submit a new image


For Individual Portrait:


Choose a clear photo of the person (300dpi preferred)
You will be notified if the photo meets requirements


For Couple Portrait:


Choose one profile photo per person — doesn't need to be a joint photo
300dpi quality preferred
You will be notified, and can submit new photos if needed


Payment info:


After confirmation email, payment via PayPal, bank transfer, or credit card
Link to payment page: https://luiseschwarze.wixsite.com/website-4/bezahlen



Copy

German (primary)

Hero headline: ULTRASOUND ART

Hero body:


Ein schwarz-weißes Ultraschallbild im Miniformat ist Schnee von gestern. Lass dir die allererste Aufnahme deines Kindes verewigen! Ich bearbeite das Ultraschallbild künstlerisch und hebe es farblich hervor.
Auf Leinwand gedruckt, hast du nicht nur eine wunderschöne Erinnerung, sondern auch eine moderne, anschauliche Deko für deine Wohnung.
Auf Wunsch mit Namen deines Kindes und Anzahl der Wochen im Mutterleib.



How to order:


Ganz einfach: Kontaktiere mich per Klick auf den unten stehenden Button oder schreibe mir direkt: portraits4life.art@gmail.com und teile mir deine Wünsche mit. Du kannst zwischen verschiedenen Formaten wählen. Sende mir dein Ultraschallbild im Uploadbereich. Ich erstelle dir auf digitalem Weg ein wunderschönes Portrait, dass dein kleines schwarz-weiß Bild zum Kunstwerk werden lässt. Bei der digitalen Bearbeitung setze ich Akzente, um das Kind besonders hervorzuheben. Bei dieser Variante bezahlst du das kleine Meisterwerk vorab. Nach Zahlungseingang erhältst du das Bild in ca. 2 Wochen.



English (translated equivalents)

Hero headline: ULTRASOUND ART

Hero body:


A tiny black-and-white ultrasound photo is a thing of the past. Let the very first image of your child live forever! I artistically enhance your ultrasound image and bring it to life with colour.
Printed on canvas, you'll have not just a beautiful memory, but a modern, striking piece of décor for your home.
Optionally personalised with your child's name and number of weeks in the womb.




External Links


Formats page: https://luiseschwarze.wixsite.com/website-4/formate
Upload/order: https://luiseschwarze.wixsite.com/website-4/wedding-order
Payment: https://luiseschwarze.wixsite.com/website-4/bezahlen
Email: portraits4life.art@gmail.com



File & Folder Structure

portraits4life/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx          # Landing page
│   │   └── order/
│   │       └── page.tsx      # Order page
├── components/
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── HowItWorks.tsx
│   ├── PricingTiers.tsx
│   ├── ContactSection.tsx
│   ├── OrderForm.tsx
│   └── Footer.tsx
├── messages/
│   ├── de.json               # German strings
│   └── en.json               # English strings
├── public/
│   └── images/               # Place product/hero images here
├── screenshots/              # Reference screenshots from existing site
└── tailwind.config.ts


Notes for Claude Code


Images directory: check /public/images/ for any available photos and use them
Screenshots directory: check /screenshots/ and extract color palette + design cues
No backend required for now — the order form should send via mailto or display a "we'll be in touch" confirmation
Keep the design warm and emotional — this is for new parents
The language switcher should persist the user's choice (localStorage or cookie)
Do NOT use placeholder lorem ipsum — use the real copy provided above
Start with the landing page, get it looking good, then build the order page



First Command to Run

bashnpx create-next-app@latest portraits4life --typescript --tailwind --app --src-dir=false
cd portraits4life
npx shadcn@latest init
npx shadcn@latest add button card tabs accordion
npm install next-intl

Then build page by page starting with app/[locale]/page.tsx.