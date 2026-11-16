// Coming-soon mode: set COMING_SOON=true in Vercel (Production only) to show a simple page to every visitor.
// Local development leaves it unset, so the full site is shown there.
export function isComingSoon(): boolean {
  return process.env.COMING_SOON === 'true';
}

// The coming-soon page for the language of the requested path (German unless the path starts with /en).
export function comingSoonPath(pathname: string): string {
  return pathname.startsWith('/en') ? '/en/coming-soon' : '/de/coming-soon';
}
