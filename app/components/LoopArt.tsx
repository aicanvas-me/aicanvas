// Three small drawn pictures with one quiet loop each, for pages that are
// mostly text (About, FAQ): a licence sheet getting stamped, a system grid
// filling its empty slot and passing its check, a lock opening on MIT.
// Inline SVG and CSS only, so they render on the server. The resting style of
// every moving part is its finished frame, so under reduced motion each
// picture stands still in its final state. Decorative: always aria-hidden.

const ANIM = `
.vb-art .vb-move { transform-box: fill-box; transform-origin: center }
.vb-shackle { transform: translateY(-12px); animation: vb-unlock 4.8s cubic-bezier(.22,1,.36,1) infinite }
.vb-glow { animation: vb-glow 4.8s cubic-bezier(.22,1,.36,1) infinite }
.vb-seal { animation: vb-stamp 4.8s cubic-bezier(.22,1,.36,1) infinite }
.vb-ripple { opacity: 0; animation: vb-ripple 4.8s ease-out infinite }
.vb-fill { animation: vb-fill 5.2s cubic-bezier(.22,1,.36,1) infinite }
.vb-scan { opacity: 0; animation: vb-scan 5.2s ease-in-out infinite }
.vb-check { animation: vb-check 5.2s cubic-bezier(.22,1,.36,1) infinite }
@keyframes vb-unlock { 0%, 18% { transform: translateY(0) } 34%, 82% { transform: translateY(-12px) } 100% { transform: translateY(0) } }
@keyframes vb-glow { 0%, 22% { opacity: 0; transform: scale(.85) } 40%, 80% { opacity: 1; transform: scale(1) } 100% { opacity: 0; transform: scale(.85) } }
@keyframes vb-stamp { 0%, 10% { opacity: 0; transform: translate(10px, -16px) scale(1.35) } 26% { opacity: 1; transform: translate(0, 0) scale(.94) } 32%, 84% { opacity: 1; transform: none } 100% { opacity: 0; transform: none } }
@keyframes vb-ripple { 0%, 26% { opacity: 0; transform: scale(1) } 30% { opacity: .5 } 60%, 100% { opacity: 0; transform: scale(1.8) } }
@keyframes vb-fill { 0%, 14% { opacity: 0; transform: scale(.5) } 30%, 88% { opacity: 1; transform: scale(1) } 100% { opacity: 0; transform: scale(.5) } }
@keyframes vb-scan { 0%, 32% { opacity: 0; transform: translateY(0) } 36% { opacity: .5 } 58% { opacity: .5; transform: translateY(92px) } 62%, 100% { opacity: 0; transform: translateY(92px) } }
@keyframes vb-check { 0%, 60% { opacity: 0; transform: scale(.4) } 68%, 88% { opacity: 1; transform: scale(1) } 100% { opacity: 0; transform: scale(1) } }
@media (prefers-reduced-motion: reduce) { .vb-art * { animation: none !important } }
`

// React hoists a <style> with href + precedence into the head once, however
// many pictures a page shows.
function Styles() {
  return (
    <style href="aic-loop-art" precedence="default">
      {ANIM}
    </style>
  )
}

const PAPER = 'fill-sand-50 stroke-sand-300 dark:fill-sand-950 dark:stroke-sand-700'
const LINE = 'fill-sand-200 dark:fill-sand-800'
const PAPER_SHADOW = { filter: 'drop-shadow(0 8px 12px rgb(0 0 0 / 0.16))' }

type ArtProps = { className?: string }

// Commercial use: a licence sheet, stamped.
export function LicenceStamp({ className = 'size-36' }: ArtProps) {
  return (
    <>
      <Styles />
      <svg viewBox="0 0 120 120" className={`vb-art overflow-visible ${className}`} aria-hidden>
        <rect x="30" y="14" width="60" height="80" rx="10" strokeWidth="1.5" className={PAPER} style={PAPER_SHADOW} />
        <rect x="40" y="27" width="24" height="4" rx="2" className="fill-sand-300 dark:fill-sand-700" />
        <rect x="40" y="39" width="40" height="3" rx="1.5" className={LINE} />
        <rect x="40" y="47" width="34" height="3" rx="1.5" className={LINE} />
        <rect x="40" y="55" width="38" height="3" rx="1.5" className={LINE} />
        <rect x="40" y="63" width="22" height="3" rx="1.5" className={LINE} />
        <circle cx="80" cy="86" r="17" fill="none" strokeWidth="1.5" className="vb-move vb-ripple stroke-accent" />
        <g className="vb-move vb-seal">
          <circle cx="80" cy="86" r="17" className="fill-accent" />
          <path d="M72.5 86.5l5 5 10-11" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="stroke-accent-foreground" />
        </g>
      </svg>
    </>
  )
}

// A system the agent extends: the empty slot fills, a check runs over the
// grid, and it passes.
export function SystemFill({ className = 'size-36' }: ArtProps) {
  const cells = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ x: 16 + (i % 3) * 32, y: 16 + Math.floor(i / 3) * 32 }))
  return (
    <>
      <Styles />
      <svg viewBox="0 0 120 120" className={`vb-art overflow-visible ${className}`} aria-hidden>
        {cells.map(({ x, y }, i) => (
          <rect key={i} x={x} y={y} width="24" height="24" rx="7" className={LINE} />
        ))}
        <rect x="80.75" y="80.75" width="22.5" height="22.5" rx="6.5" fill="none" strokeWidth="1.5" strokeDasharray="3 3" className="stroke-sand-400 dark:stroke-sand-600" />
        <rect x="80" y="80" width="24" height="24" rx="7" className="vb-move vb-fill fill-accent" />
        <rect x="10" y="12" width="100" height="1.5" rx="0.75" className="vb-scan fill-accent" />
        <g className="vb-move vb-check">
          <circle cx="104" cy="80" r="8" className="fill-success" />
          <path d="M100.5 80.2l2.4 2.4 4.6-5" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="stroke-sand-50 dark:stroke-sand-950" />
        </g>
      </svg>
    </>
  )
}

// Free means MIT: the lock is open.
export function OpenLock({ className = 'size-36' }: ArtProps) {
  return (
    <>
      <Styles />
      <svg viewBox="0 0 120 120" className={`vb-art overflow-visible ${className}`} aria-hidden>
        <circle cx="60" cy="72" r="46" className="vb-move vb-glow fill-sand-200/70 dark:fill-sand-800/40" />
        <path d="M44 64V42a16 16 0 0 1 32 0v22" fill="none" strokeWidth="7" strokeLinecap="round" className="vb-shackle stroke-sand-400 dark:stroke-sand-600" />
        <rect x="28" y="56" width="64" height="46" rx="14" strokeWidth="1.5" className={PAPER} style={PAPER_SHADOW} />
        <text x="60" y="84" textAnchor="middle" className="fill-sand-900 font-mono text-[12px] font-semibold tracking-[0.2em] dark:fill-sand-50">
          MIT
        </text>
      </svg>
    </>
  )
}
