// The routes drawn without the left rail. The rail is for scanning a catalog
// (components, design systems); a page about the product, a plan, a policy or
// an account reads as one centred column under the full top navigation, the
// way the homepage does. TopBar draws that navigation on these routes and the
// Sidebar steps aside. The mobile drawer is unchanged everywhere.

const PAGES = new Set([
  '/',
  // ponytail: /v2 and /v3 are homepage review routes; drop them with the routes.
  '/v2',
  '/v3',
  '/pricing',
  '/mcp',
  '/faq',
  '/about',
  '/contact',
  '/feedback',
  '/welcome',
  '/credits',
  '/impressum',
  '/privacy',
  '/terms',
  '/refund',
  '/premium-license',
  '/kuendigen',
])

export function isRaillessRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
  return PAGES.has(path) || path === '/account' || path.startsWith('/account/')
}
