/**
 * Routes that opt out of the site theme and always render dark.
 *
 * These subtrees are not site chrome: they paint with their own palette and
 * have no light rendering. Their layouts pin themselves with a scoped `dark`
 * class rather than by touching <html>, which is the same mechanism a component
 * preview uses and the reason the site theme and the preview theme can coexist.
 *
 * A scoped class only covers the DOM it wraps, so anything the root layout
 * renders outside those layouts — the mobile nav, the auth dialog — has to ask
 * this question for itself or it shows up light on top of a dark page.
 */
export function isPinnedDarkRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  // /design-systems is deliberately NOT in this list: Andromeda ships a
  // light theme and every one of its routes, the brain pages included,
  // follows the site toggle like any other page.
  return pathname.startsWith('/welcome')
    || pathname.startsWith('/ideation')
    || pathname.startsWith('/lab')
    || pathname.startsWith('/tune')
}
