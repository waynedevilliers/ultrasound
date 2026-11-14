import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

const handleI18nRouting = createMiddleware({
  locales: ['en', 'de'],
  defaultLocale: 'de',
  // German always starts, whatever the browser language; the language switch still changes it.
  localeDetection: false,
});

export function middleware(request: NextRequest) {
  return handleI18nRouting(request);
}

export const config = {
  matcher: ['/', '/(de|en)/:path*'],
};
