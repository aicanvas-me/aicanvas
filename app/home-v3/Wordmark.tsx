// The page signs off with the name across the full width: grainy letters that
// brighten toward the bottom edge, where the page ends and cuts them off.
// Decorative only (the footer above carries the name for assistive tech), so
// it is aria-hidden. Server component, CSS only.

// Fine film grain, tiled. Painted INTO the letters with background-clip, so it
// only shows where there is ink.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")"

export function Wordmark() {
  return (
    // shrink-0: the page column is a flex column that owns the scroll, and an
    // overflow-hidden flex item there would otherwise shrink to nothing.
    <div aria-hidden className="pointer-events-none relative w-full shrink-0 select-none overflow-hidden">
      <style>{`
        .v3-wordmark {
          background-image: ${GRAIN}, linear-gradient(to bottom, rgb(23 23 26 / 0.02) 10%, rgb(23 23 26 / 0.34) 100%);
        }
        .dark .v3-wordmark {
          background-image: ${GRAIN}, linear-gradient(to bottom, rgb(255 255 255 / 0.03) 10%, rgb(255 255 255 / 0.62) 100%);
        }
      `}</style>
      <p
        className="v3-wordmark -mb-[0.2em] whitespace-nowrap bg-clip-text text-center font-extrabold leading-[0.82] tracking-[-0.055em] text-transparent [-webkit-background-clip:text]"
        style={{ fontSize: 'clamp(4rem, 18.5vw, 22rem)' }}
      >
        AI<span className="inline-block w-[0.24em]" />CANVAS
      </p>
    </div>
  )
}
