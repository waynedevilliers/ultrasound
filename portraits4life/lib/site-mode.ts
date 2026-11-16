// Coming-soon mode: set COMING_SOON=true in Vercel (Production only) to show a simple page to every visitor.
// Local development leaves it unset, so the full site is shown there.
export function isComingSoon(): boolean {
  return process.env.COMING_SOON === 'true';
}
