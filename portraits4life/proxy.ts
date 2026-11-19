import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { comingSoonPath, isComingSoon } from '@/lib/site-mode';

const handleI18nRouting = createMiddleware({
  locales: ['en', 'de'],
  defaultLocale: 'de',
  // German always starts, whatever the browser language; the language switch still changes it.
  localeDetection: false,
});

// Next 16 calls this file convention proxy (formerly middleware). It runs before every matched request.
export function proxy(request: NextRequest) {
  // Coming-soon mode: every site page is answered with the coming-soon page, so no site content is sent.
  if (isComingSoon()) {
    const url = request.nextUrl.clone();
    url.pathname = comingSoonPath(request.nextUrl.pathname);
    return NextResponse.rewrite(url);
  }
  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/', '/(de|en)/:path*'],
};
