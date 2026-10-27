// The routes drawn without the left rail. The rail is for scanning a catalog
// (components, design systems); a page about the product, a plan, a policy or
// an account reads as one centred column under the full top navigation, the
// way the homepage does. TopBar draws that navigation on these routes and the
// Sidebar steps aside. The mobile drawer is unchanged everywhere.

const PAGES = new Set([
  '/',
  '/home',
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
])
// /kuendigen is not here: the cancellation flow is frozen as shipped and draws
// its own bar with no site links, so the rail stays its way back to the site.

export function isRaillessRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
  // /docs carries its own list of docs pages (app/docs/layout.tsx), so the
  // catalog rail steps aside there too.
  return (
    PAGES.has(path) ||
    path === '/account' ||
    path.startsWith('/account/') ||
    path === '/docs' ||
    path.startsWith('/docs/')
  )
}
