// The closing band of homepage v2: every finished Andromeda Pro template on a
// tilted wall, two rows drifting in opposite directions behind the last call
// to action. Server component, CSS animation only; each row is rendered twice
// so a -50% translate loops without a seam. Reduced motion: the wall holds still.

import { TEMPLATES } from '../design-systems/andromeda-pro/overview-b/overview-data'

const POSTERS = TEMPLATES.filter((t) => t.image || t.imageLight)

function Row({ items, reverse }: { items: typeof POSTERS; reverse?: boolean }) {
  return (
    <div className={`flex w-max gap-5 ${reverse ? 'aic-wall-rev' : 'aic-wall'}`}>
      {[...items, ...items].map((t, i) => (
        <div
          key={`${t.slug}-${i}`}
          className="relative aspect-[16/9] w-[340px] shrink-0 overflow-hidden rounded-xl border border-sand-200 bg-sand-200 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] dark:border-sand-800 dark:bg-sand-900 sm:w-[420px]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {t.imageLight && <img src={t.imageLight} alt="" loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full object-cover ${t.image ? 'dark:hidden' : ''}`} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {t.image && <img src={t.image} alt="" loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full object-cover ${t.imageLight ? 'hidden dark:block' : ''}`} />}
        </div>
      ))}
    </div>
  )
}

export function PosterWall() {
  const shifted = [...POSTERS.slice(3), ...POSTERS.slice(0, 3)]
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_75%_70%_at_50%_50%,black_20%,transparent_80%)]"
    >
      <div className="absolute left-1/2 top-1/2 flex flex-col gap-5 opacity-80 [transform:translate(-50%,-50%)_perspective(1400px)_rotateX(24deg)_rotateZ(-7deg)] dark:opacity-70">
        <Row items={POSTERS} />
        <Row items={[...POSTERS].reverse()} reverse />
        <Row items={shifted} />
      </div>
      <style>{`
        @keyframes aicWall { to { transform: translateX(-50%) } }
        .aic-wall { animation: aicWall 70s linear infinite }
        .aic-wall-rev { animation: aicWall 80s linear infinite reverse }
        @media (prefers-reduced-motion: reduce) { .aic-wall, .aic-wall-rev { animation: none } }
      `}</style>
    </div>
  )
}
