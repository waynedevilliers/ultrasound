import { Geist, Geist_Mono, Playfair_Display } from 'next/font/google';

// Fonts are self-hosted at build time by next/font: no requests to Google at runtime.
export const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const fontClassNames = `${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`;
