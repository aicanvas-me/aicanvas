/**
 * Routes that opt out of the site theme and always render dark: they paint with
 * their own palette and have no light rendering. Their layouts pin themselves
 * with a scoped `dark` class rather than by touching <html>, which is how the
 * site theme and the preview theme coexist. A scoped class only covers the DOM
 * it wraps, so anything the root layout renders outside those layouts (the
 * mobile nav, the auth dialog) has to ask this question for itself.
 */
export function isPinnedDarkRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  // /design-systems is deliberately NOT in this list: Andromeda ships a light
  // theme and its routes follow the site toggle like any other page.
  return pathname.startsWith('/welcome')
    || pathname.startsWith('/ideation')
    || pathname.startsWith('/lab')
    || pathname.startsWith('/tune')
}
