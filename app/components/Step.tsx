// ─── Step ──────────────────────────────────────────────────────────────────
// Numbered timeline row used in install/setup widgets across the site.
// Renders a small bordered square marker on the left and arbitrary content
// on the right. When `isLast` is false (the default), a vertical dotted
// connector animates down into the gap below, ending at the next marker.
//
// The parent container should use a vertical gap of 24px (e.g. space-y-6).
// The animation keyframe `aicStepDot` lives in globals.css.

export function Step({
  number,
  isLast,
  children,
}: {
  number: number | string
  isLast?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative flex items-start gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sand-200 bg-sand-100 text-xs font-bold text-sand-700 dark:border-sand-700 dark:bg-sand-900 dark:text-sand-300">
        {number}
      </div>
      {!isLast && (
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[-24px] left-[15px] top-8 w-px overflow-hidden text-sand-300/70 dark:text-sand-700/70"
          style={{
            backgroundImage:
              'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '1px 8px',
            animation: 'aicStepDot 1.5s linear infinite',
          }}
        />
      )}
      <div className="min-w-0 flex-1 pt-1.5">{children}</div>
    </div>
  )
}
