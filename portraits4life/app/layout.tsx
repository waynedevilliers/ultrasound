import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portraits 4 Life - Ultrasound Art',
  description: 'Artistically enhanced ultrasound images printed on canvas. A beautiful keepsake for new parents.',
};

// The html element lives in app/[locale]/layout.tsx so it can carry the page language.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
