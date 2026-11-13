// Decides whether a menu item is the current page. Parent items stay active on
// child pages. Anchor-only items (sections on the landing page) are never active
// on their own, because they are not pages.
export function isActiveItem(itemPath: string, pathname: string, locale: string): boolean {
  const home = `/${locale}`;
  const current = pathname.replace(/\/$/, '') || '/';
  if (itemPath === '') return current === home;
  const target = `${home}${itemPath}`;
  return current === target || current.startsWith(`${target}/`);
}
