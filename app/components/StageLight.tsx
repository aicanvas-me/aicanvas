// The site's one lit panel: a light from straight above that fills the panel
// and is gone by its lower half, and a rim that catches it along the top and
// fades out halfway down the sides. Every highlighted surface draws this, so
// they all agree on where the light comes from. The parent is relative,
// overflow-hidden and rounded, with no border of its own; content on it is
// relative so it paints above. Server-safe.
//
// The fill is a radial with eased stops, never a blurred disc, so it shows no
// bands. Its two colours are per-theme custom properties, read by one inline
// gradient (commas in an arbitrary value escape awkwardly).
const FILL = [
  'radial-gradient(70% 45% at 50% 0%, var(--stage-light), color-mix(in srgb, var(--stage-light) 70%, transparent) 22%, color-mix(in srgb, var(--stage-light) 38%, transparent) 45%, color-mix(in srgb, var(--stage-light) 14%, transparent) 70%, transparent)',
  'linear-gradient(to bottom, var(--stage-tint), transparent 65%)',
].join(', ')

const TOP_LINE =
  'linear-gradient(90deg, transparent 15%, color-mix(in srgb, var(--color-sand-50) 45%, transparent) 50%, transparent 85%)'

export function StageLight() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] [--stage-light:var(--color-sand-50)] [--stage-tint:var(--color-sand-200)] dark:[--stage-light:color-mix(in_srgb,var(--color-sand-50)_20%,transparent)] dark:[--stage-tint:color-mix(in_srgb,var(--color-sand-50)_5%,transparent)]"
        style={{ background: FILL }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] border border-sand-300 [mask-image:linear-gradient(to_bottom,black,transparent_55%)] dark:border-sand-50/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-px dark:block"
        style={{ background: TOP_LINE }}
      />
    </>
  )
}
