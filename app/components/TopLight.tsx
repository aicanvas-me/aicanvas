// The site's one light: olive, straight overhead, fading down from the top
// edge of a card or a band. Every lit surface draws this one, so the whole
// site agrees on where the light comes from. The parent is relative (and
// overflow-hidden with its radius, so the light keeps the corners); content
// that sits on it is relative too, to paint above it. Server-safe.
export function TopLight() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-40"
      style={{ backgroundImage: 'radial-gradient(70% 100% at 50% 0%, rgb(168 185 77 / 0.12), transparent 70%)' }}
    />
  )
}
