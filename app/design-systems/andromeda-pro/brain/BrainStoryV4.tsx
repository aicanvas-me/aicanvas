'use client'

// ============================================================
// Andromeda Pro Brain: the story page. A hero in the overview's shape, then a
// stage where the brain turns in the void, painted in the same brand ramp as
// the overview's BrainWireframe (brand 400 at the stem up to a light neutral
// at the crown), so the two pages show one object. Floating labels ride the
// brain's rotation and light up as an invisible focus passes them.
//
// Model: low-poly Brain by Poly by Google, CC BY 3.0 (via Poly Pizza),
// geometry only, re-materialed here. Asset lives in /public/models/brain.glb;
// the attribution the license asks for is on /credits. Every count and label
// derives from BRAIN_TEASER (section labels and file names only, never brain
// content), so the page is safe for free and anonymous visitors.
// ============================================================

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import type { Mesh } from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { Rotate3d } from 'lucide-react'
import { Check, LockSimple, X as XIcon } from '@phosphor-icons/react'
import { buttonClasses } from '@/app/components/buttonClasses'
import { usePremiumStatus } from '@/app/components/billing/usePremiumStatus'
import { SiteFooter } from '@/app/components/SiteFooter'
import { SystemTierChip } from '@/app/_components/SystemTierChip'
import { BRAIN_TEASER } from '@/app/lib/andromeda-pro-brain-teaser.generated'
import { BRAIN_TEASER as LEGACY_TEASER } from '@/app/lib/andromeda-brain-teaser.generated'
import { tokens } from '@/app/lib/andromeda-pro.generated'
import type { Theme } from '@/app/components/ThemeProvider'
import { BRAIN_GROUND, LINE_STOPS, oklchToLinearSrgb } from '../overview-b/BrainWireframe'

// The flow diagram's connector gradients and travelling dots paint from these.
// They sit inside an SVG stop and a CSS string, where a Tailwind class cannot
// reach, so they ride CSS variables (see brainVars below) that flip with the
// `dark` class on <html>.
const PALETTE = {
  dark:  { accent: 'var(--color-olive-400)', accentBtn: 'var(--color-olive-500)', muted: 'var(--color-sand-500)', line: 'var(--color-sand-800)' },
  light: { accent: 'var(--color-olive-600)', accentBtn: 'var(--color-olive-600)', muted: 'var(--color-sand-500)', line: 'var(--color-sand-200)' },
} as const satisfies Record<Theme, Record<string, string>>
type BrainColor = keyof typeof PALETTE.dark
const C = Object.fromEntries((Object.keys(PALETTE.dark) as BrainColor[]).map((k) => [k, `var(--brain-${k})`])) as Record<BrainColor, string>
const brainVars = (t: Theme) => (Object.keys(PALETTE[t]) as BrainColor[]).map((k) => `--brain-${k}: ${PALETTE[t][k]};`).join(' ')
const SANS = "var(--font-sans), 'Manrope', system-ui, sans-serif"
const MONO = "var(--font-mono, var(--font-jetbrains-mono)), 'Geist Mono', monospace"
const MODEL_URL = '/models/brain.glb'

// The stage is the void in both site themes, like the overview's brain card,
// so its inks are fixed instead of following the site palette.
const STAGE_INK = {
  label: '#9B9B9E',
  hero: '#F4F4FA',
  lit: tokens.color.brand[300],
  halo: 'rgba(0,0,0,0.9)',
  status: '#7B7B7D',
}

// Medium buttons, class for class with the overview hero.
const BTN_PRIMARY = `${buttonClasses({ variant: 'primary', size: 'md' })} h-10`
const BTN_SECONDARY = `${buttonClasses({ variant: 'outline', size: 'md' })} h-10`
// The overview's card surface.
const PANEL_CLASS = 'rounded-2xl border border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900'
const PANEL_SHADOW =
  'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.10)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.40),0_12px_32px_rgba(0,0,0,0.55)]'

// Counts in running copy read as words; anything past twenty stays a numeral.
const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
]
const numberWord = (n: number) => NUMBER_WORDS[n] ?? String(n)
const capitalWord = (n: number) => {
  const w = numberWord(n)
  return w.charAt(0).toUpperCase() + w.slice(1)
}

const filesOf = (id: string): readonly string[] =>
  (BRAIN_TEASER.sections as readonly { id: string; files: readonly string[] }[]).find((s) => s.id === id)?.files ?? []
const FND = filesOf('foundations')
const CMP = filesOf('component-rules')

// Legacy vs Pro: every count is read off both teasers, so the table moves
// when either brain does.
const legacyFilesOf = (id: string): readonly string[] =>
  (LEGACY_TEASER.sections as readonly { id: string; files: readonly string[] }[]).find((s) => s.id === id)?.files ?? []
const VERSUS_ROWS = [
  { label: 'Files', legacy: LEGACY_TEASER.totalFiles as number, pro: BRAIN_TEASER.totalFiles as number },
  { label: 'Foundations', legacy: legacyFilesOf('foundations').length, pro: FND.length },
  { label: 'Component rules', legacy: legacyFilesOf('component-rules').length, pro: CMP.length },
  { label: 'Tools', legacy: legacyFilesOf('tools').length, pro: filesOf('tools').length },
]
const NEW_FOUNDATIONS = FND.filter((f) => !legacyFilesOf('foundations').includes(f))
const NEW_COMPONENTS = CMP.filter((f) => !legacyFilesOf('component-rules').includes(f))
// A build without the Pro brain writes the same fallback into both teasers,
// so the table would compare Legacy with itself. Nothing new = no section.
const SHOW_VERSUS = NEW_FOUNDATIONS.length + NEW_COMPONENTS.length > 0
const NEW_LINE = [
  NEW_FOUNDATIONS.length ? `New foundations: ${NEW_FOUNDATIONS.join(', ')}.` : '',
  NEW_COMPONENTS.length ? `New component rules: ${NEW_COMPONENTS.join(', ')}.` : '',
]
  .filter(Boolean)
  .join(' ')
const IMPROVEMENTS = [
  {
    title: 'Three color layers',
    line: 'Raw colors belong to the theme. A component only reads what a color means, and the done-gate fails any component that reaches past that line.',
  },
  {
    title: 'Themes that stay live',
    line: 'Tokens are read when the page runs, not baked in at build, so one component serves light and dark. Canvas and SVG get their own rule.',
  },
  {
    title: 'One type ladder',
    line: 'Small, medium and large controls take 12, 14 and 16px type, with a 12px floor. Your agent stops guessing font sizes.',
  },
  {
    title: 'Checked by scripts, not by eye',
    line: 'Contrast is measured in both themes, and every accent and status color follows one shape law. A retune that hurts readability fails a check before anyone looks.',
  },
]
const SKILLS = filesOf('skills')
const TOOLS = filesOf('tools')

// One string, not counts interleaved with JSX text: the split form hydrated
// with a space missing on the overview page.
const HERO_BODY = `${BRAIN_TEASER.totalFiles} files your AI agent reads before it builds: the system's rules and inventory, ${numberWord(FND.length)} foundations, a rule file for each of the ${numberWord(CMP.length)} components, ${numberWord(SKILLS.length)} skills and ${numberWord(TOOLS.length)} tools. Every file name is open on this page. Premium puts the files in your project.`

const take = (arr: readonly string[], n: number) => { const step = Math.max(1, Math.floor(arr.length / n)); const o: string[] = []; for (let i = 0; i < arr.length && o.length < n; i += step) o.push(arr[i]); return o }
// Deduplicated because the labels double as React keys, and nothing stops a
// foundation and a component rule from one day sharing a name.
const LABELS: string[] = [...new Set([
  ...take(FND, 6), ...take(CMP, 10), ...SKILLS,
  ...['verify-andromeda', 'light-contrast.selfcheck'].filter((name) => TOOLS.includes(name)),
  'must · should · may', 'color is measurement',
])]

const sentenceCase = (label: string) => {
  const i = label.indexOf(' ')
  return i < 0 ? label : label.slice(0, i) + label.slice(i).toLowerCase()
}

// Bigger, higher-hierarchy "hero" labels: the brain's own sections.
const HERO_LABELS: string[] = BRAIN_TEASER.sections.map((s) => sentenceCase(s.label))

function mulberry32(seed: number) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

// ── editorial copy helpers ──────────────────────────────────────────────────
// Column, overline and section head, class for class with the overview page, so
// the two routes share one editorial frame.
function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-5xl px-4 sm:px-6 ${className}`}>{children}</div>
}

function Overline({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-olive-600 dark:text-olive-400">{children}</p>
  )
}

function SectionHead({ overline, title, sub, id }: { overline: string; title: React.ReactNode; sub?: React.ReactNode; id: string }) {
  return (
    <div className="max-w-2xl">
      <Overline>{overline}</Overline>
      {/* The h2 carries the anchor id, so its scroll margin has to clear the
          sticky bar (64px on phones), the overline above it (24px) and the
          32px the Section reveal still has to rise after the jump lands. */}
      <h2 id={id} className="mt-2 scroll-mt-32 text-2xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
        {title}
      </h2>
      {sub ? <p className="mt-2 text-base leading-relaxed text-sand-600 dark:text-sand-400">{sub}</p> : null}
    </div>
  )
}

const MANIFEST = BRAIN_TEASER.sections as readonly { id: string; label: string; files: readonly string[] }[]
// Keyed by section id. An unknown id (the list is growing) renders without a
// gloss or suffix rather than with a wrong one.
const GLOSS: Record<string, string> = {
  index: 'Where the agent starts. The rules set the system-wide laws, and the inventory lists what already exists, so it reuses a component before inventing one.',
  foundations: 'How the system thinks: color, type, spacing, layout, motion, states, theming, charts and voice.',
  'component-rules': 'One file per component, holding the decisions that make it Andromeda Pro instead of generic.',
  skills: `${capitalWord(SKILLS.length)} working modes. One builds with the system, the other reviews a finished build against every must rule.`,
  tools: 'Scripts the agent runs on its own work: a done-gate for finished screens, contrast checks for both themes and a palette snapshot.',
}
// The teaser publishes bare names; these put back the suffix each file has on
// disk, so a name here matches the one the agent actually opens.
const SUFFIX: Record<string, string> = {
  index: '.md',
  foundations: '.md',
  'component-rules': '.rules.md',
  skills: '/SKILL.md',
  tools: '.mjs',
}
// A chip names a file only if the teaser has it, so a file the brain drops
// leaves its step instead of being advertised. Skills and tools stay bare to
// keep the chips short.
const fileChip = (sectionId: string, file: string) =>
  !filesOf(sectionId).includes(file) ? null
  : sectionId === 'skills' || sectionId === 'tools' ? file
  : file + (SUFFIX[sectionId] ?? '')

// The agent's loop, in the order the two skills run it.
const LOOP = [
  {
    title: 'Start at the index',
    line: "It reads the system's rules first, then checks the inventory, so it reuses a component before inventing one.",
    chips: [['index', 'rules'], ['index', 'INVENTORY']],
  },
  {
    title: 'Open what the task needs',
    line: 'Only the foundations and component rules this screen touches, never a guess from generic taste.',
    chips: [['foundations', 'layout'], ['component-rules', 'Button']],
  },
  {
    title: 'Build on the tokens',
    line: 'The building skill keeps every value on a token, and a quick color check runs while it works.',
    chips: [['skills', 'building-with-andromeda']],
  },
  {
    title: 'Check before it says done',
    line: 'The done-gate runs on the finished screen, then the review skill walks every must rule.',
    chips: [['tools', 'verify-andromeda'], ['skills', 'reviewing-against-andromeda']],
  },
].map((step) => ({
  ...step,
  chips: step.chips.map(([sectionId, file]) => fileChip(sectionId, file)).filter((c): c is string => c !== null),
}))

// Right-side claims stay to what Andromeda Pro and the Brain actually ship:
// code, tokens and written rules. No design-tool-to-code bridge is implied.
const COMPARE = [
  { classic: 'Docs written for people, skipped by agents', brain: 'Rules written for the agent that builds' },
  { classic: 'Intent lost between the mock-up and the code', brain: 'No handoff: the system is already code and tokens' },
  { classic: 'Every new screen drifts a little further off-brand', brain: 'Every screen is built against the same rules' },
  { classic: 'Done means it looked right once', brain: 'Done means it passed the done-gate' },
  { classic: 'A change means another design-to-code round trip', brain: 'Change a token and everything built on it follows' },
]

// The flow diagram: what goes in, the judgment in the middle, what comes out.
// Counts come from the teaser so the picture cannot drift from the corpus.
const FLOW_IN = [
  { title: 'Tokens', sub: 'three layers' },
  { title: 'Components', sub: `${CMP.length} with their own rules` },
  { title: 'Your prompt', sub: 'what you want built' },
]
// Three things you get, in widening scope: this screen, the whole surface, and
// every screen after. The middle used to read "Decisions, not guesses", which
// described the process rather than naming something you walk away with.
const FLOW_OUT = [
  { title: 'On-brand screen', sub: 'checked before it is done' },
  { title: 'Consistent everywhere', sub: 'color, motion, spacing' },
  { title: 'Same rules next time', sub: 'no drift as you grow' },
]
// Row rhythm is shared with the connector geometry: three rows of ROW_H with
// ROW_GAP between them put the middle row dead centre, where the brain sits and
// where every curve converges.
const ROW_H = 58
const ROW_GAP = 16
const FLOW_H = ROW_H * 3 + ROW_GAP * 2
const Y_TOP = ROW_H / 2
const Y_MID = FLOW_H / 2
const Y_BOT = FLOW_H - ROW_H / 2
// The connectors get their own fixed-width grid column, so each SVG is drawn at
// exactly its own size and nothing is stretched. Stretching an SVG to fill a
// fluid column is what flattened these curves into diagonals before. Because the
// SVG is 1:1 with CSS pixels, the same path strings drive the HTML dots on top.
const LINK_W = 104

// The centre card, and the wireframe brain across the top of it: a still of the
// brand-ramp brain, stored at 2x display size. Its ground is a flat
// rgb(14,14,15), the sand-950 the card is painted in both site themes, so the
// image has no visible edge either way.
const IMG_W = 78
const IMG_H = 65
const CARD_PAD_TOP = 14
const CARD_PAD_BOTTOM = 16
const IMG_GAP = 10
// Text block: the title line plus the count line under it.
const CARD_TEXT_H = 33
const CARD_H = CARD_PAD_TOP + IMG_H + IMG_GAP + CARD_TEXT_H + CARD_PAD_BOTTOM
// Connectors meet the middle of the card. The card is centred on the row, so
// that is simply the row's own centre line.
const CONVERGE_Y = Y_MID

// Control points at 60% of the run give a true S: it leaves the node
// horizontally and arrives at the brain horizontally.
const curve = (y1: number, y2: number) =>
  `M0,${y1} C${LINK_W * 0.6},${y1} ${LINK_W * 0.4},${y2} ${LINK_W},${y2}`

// A journey is three legs of equal length: in, through the brain, out. Starting
// one every leg means exactly one dot on a left connector, one inside the brain
// and one on a right connector at any moment, and each dot hands its position to
// the next at the card edge. Lane i enters at row i and leaves at row 2 - i, so
// the paths cross rather than running in parallel.
const LEG = 2.8
const JOURNEY = LEG * 3
const IN_ROWS = ['top', 'mid', 'bot'] as const
const OUT_ROWS = ['bot', 'mid', 'top'] as const
const Y_OF = { top: Y_TOP, mid: Y_MID, bot: Y_BOT }

// Three things keep this from reading as a metronome, and none of them change
// the cycle length, so one dot per side is still guaranteed:
//   - the outgoing side sits half a leg off the incoming one, so the two sides
//     never launch together, which was the robotic part;
//   - a few tenths of jitter per lane, hand-picked rather than random so server
//     and client render the same thing;
//   - a different ease per lane, so they do not all glide at one speed.
const HALF_LEG = LEG / 2
const JITTER_IN = [0, 0.22, -0.14]
const JITTER_OUT = [0.12, -0.2, 0.3]
const EASES = ['cubic-bezier(.4,.05,.6,.95)', 'linear', 'cubic-bezier(.3,0,.7,1)']

function FlowLinks({ mode }: { mode: 'in' | 'out' }) {
  const rows = (mode === 'in' ? IN_ROWS : OUT_ROWS).map((row, i) => ({
    d: mode === 'in' ? curve(Y_OF[row], CONVERGE_Y) : curve(CONVERGE_Y, Y_OF[row]),
    // in: leg 0 of journey i. out: leg 2, so two legs later, plus the offset.
    delay:
      mode === 'in'
        ? i * LEG + JITTER_IN[i]
        : (i * LEG + LEG * 2 + HALF_LEG + JITTER_OUT[i]) % JOURNEY,
    ease: EASES[(mode === 'in' ? i : i + 1) % EASES.length],
  }))
  return (
    <div className="flow-link" style={{ position: 'relative', width: LINK_W, height: FLOW_H }}>
      <svg aria-hidden width={LINK_W} height={FLOW_H} viewBox={`0 0 ${LINK_W} ${FLOW_H}`} style={{ display: 'block' }}>
        <defs>
          {/* userSpaceOnUse, not the default objectBoundingBox: a shape with a
              zero-area bounding box is not rendered at all under the default,
              which is what made the flat connectors disappear. */}
          <linearGradient id={`flow-${mode}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={LINK_W} y2="0">
            <stop offset="0%" style={{ stopColor: mode === 'in' ? C.line : C.muted }} />
            <stop offset="100%" style={{ stopColor: mode === 'in' ? C.muted : C.line }} />
          </linearGradient>
        </defs>
        {rows.map((r) => (
          <path key={r.d} d={r.d} fill="none" stroke={`url(#flow-${mode})`} strokeWidth={1} />
        ))}
      </svg>
      {rows.map((r) => (
        <span
          key={r.d}
          aria-hidden
          className="flow-dot"
          style={{ offsetPath: `path("${r.d}")`, animationDelay: `${r.delay.toFixed(2)}s`, animationTimingFunction: r.ease } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

const FLOW_NODE = 'flex flex-col justify-center rounded-[10px] border border-sand-200 bg-sand-100 px-3.5 dark:border-sand-800 dark:bg-sand-900'
const FLOW_HEAD = 'mb-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-sand-600 dark:text-sand-400'

function FlowNode({ title, sub }: { title: string; sub: string }) {
  return (
    <div className={FLOW_NODE} style={{ height: ROW_H }}>
      <span className="text-[13px] font-semibold text-sand-900 dark:text-sand-50">{title}</span>
      <span className="mt-px text-[11px] text-sand-600 dark:text-sand-400">{sub}</span>
    </div>
  )
}

function BrainFlow() {
  return (
    <>
      <style>{`
        .flow-heads, .flow-grid { display: grid; grid-template-columns: 1fr ${LINK_W}px 190px ${LINK_W}px 1fr; }
        .flow-col { display: flex; flex-direction: column; gap: ${ROW_GAP}px; }
        .flow-mid { display: flex; align-items: center; }
        /* The dot rides the same path string the line is drawn from, so the two
           can never disagree. offset-anchor centres it on the path by default. */
        .flow-dot {
          position: absolute; top: 0; left: 0;
          width: 5px; height: 5px; border-radius: 50%;
          background: ${C.accent};
          box-shadow: 0 0 6px ${C.accentBtn};
          opacity: 0;
          animation: flow-dot ${JOURNEY.toFixed(1)}s linear infinite;
        }
        /* A dot travels its slot, then goes dark at the card edge. Nothing is
           drawn over the card: the middle leg is the beat where the brain is
           working, and a dot surfaces again on the far side.
           29% rather than a full third: the few tenths of slack are what let the
           per-lane jitter run without two dots ever sharing a side. */
        @keyframes flow-dot {
          0%    { offset-distance: 0%;   opacity: 1; }
          29%   { offset-distance: 100%; opacity: 1; }
          29.1% { offset-distance: 100%; opacity: 0; }
          100%  { offset-distance: 100%; opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .flow-dot { display: none; }
        }
        /* Stack below lg: from 768px the site rail takes 240px, and the five
           column grid needs about 610px of its own. */
        @media (max-width: 1023px) {
          .flow-heads { display: none; }
          .flow-grid { grid-template-columns: 1fr; gap: ${ROW_GAP}px; }
          .flow-link { display: none; }
        }
      `}</style>

      {/* A touch more air than when a paragraph sat above: the diagram is the
          section's body now, not a figure under prose. */}
      <div className="flow-heads" style={{ marginTop: 36 }}>
        <p className={FLOW_HEAD}>What goes in</p>
        <span />
        <p className={`${FLOW_HEAD} text-center`}>The judgment</p>
        <span />
        <p className={`${FLOW_HEAD} text-right`}>What comes out</p>
      </div>

      <div className="flow-grid">
        <div className="flow-col">
          {FLOW_IN.map((n) => (
            <FlowNode key={n.title} {...n} />
          ))}
        </div>

        <FlowLinks mode="in" />

        <div className="flow-mid">
          {/* The focal card is the void in both site themes, like the hero
              stage, so its inks are fixed for the dark ground. The olive border
              stays a hairline: full strength read heavy beside the sand
              hairlines around it. */}
          <div
            className="flex w-full flex-col items-center justify-start rounded-[10px] border border-olive-500/40 bg-sand-950"
            style={{ height: CARD_H, padding: `${CARD_PAD_TOP}px 0 ${CARD_PAD_BOTTOM}px` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/andromeda-pro-brain-wire.webp"
              alt=""
              width={IMG_W}
              height={IMG_H}
              loading="lazy"
              decoding="async"
              style={{ display: 'block' }}
            />
            <span className="text-[13px] font-bold text-sand-50" style={{ marginTop: IMG_GAP }}>Andromeda Pro Brain</span>
            <span className="mt-0.5 font-mono text-[11px] text-olive-400">{`${BRAIN_TEASER.totalFiles} files`}</span>
          </div>
        </div>

        <FlowLinks mode="out" />

        <div className="flow-col">
          {FLOW_OUT.map((n) => (
            <FlowNode key={n.title} {...n} />
          ))}
        </div>
      </div>
    </>
  )
}

// Tailwind's lg: the site rail takes 240px from md, so the two-column explorer
// only fits from here. Server snapshot is false, matching the stacked layout
// the server renders.
const LG_QUERY = '(min-width: 1024px)'
const subscribeLg = (onChange: () => void) => {
  const mql = window.matchMedia(LG_QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}
const useLgUp = () => useSyncExternalStore(subscribeLg, () => window.matchMedia(LG_QUERY).matches, () => false)

const DEFAULT_TAB = 'component-rules'
const PANEL_ID = 'brain-corpus-panel'
const tabId = (id: string) => `brain-corpus-tab-${id}`
// On a phone the names run one column, so a 49-name section is a long scroll.
// Past this many they wait behind a button; from sm every name shows.
const PHONE_PREVIEW = 12
// Characters of 13px mono (about 7.8px each) one name column holds at the
// narrowest width a layout starts at, so a longer name drops a column instead
// of truncating: two columns at 640px, two or three at 1280px beside the rail.
const SM_TWO_COL_CHARS = 31
const XL_TWO_COL_CHARS = 41
const XL_THREE_COL_CHARS = 26

function CorpusExplorer() {
  const [activeId, setActiveId] = useState(() => (MANIFEST.some((s) => s.id === DEFAULT_TAB) ? DEFAULT_TAB : MANIFEST[0]?.id))
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const lgUp = useLgUp()
  const [expanded, setExpanded] = useState(false)
  const activeIndex = Math.max(0, MANIFEST.findIndex((s) => s.id === activeId))
  const rowRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const hasScrolled = useRef(false)
  // Below lg the default tab sits past the right edge of a phone row. Scroll
  // the row itself: scrollIntoView would also move the page vertically. The
  // first pass is instant so nothing slides on load.
  useEffect(() => {
    const row = rowRef.current
    const tab = tabRefs.current[activeIndex]
    const instant = !hasScrolled.current || reduce
    hasScrolled.current = true
    if (!row || !tab || row.scrollWidth <= row.clientWidth) return
    const left = tab.offsetLeft
    const right = left + tab.offsetWidth
    const target =
      left < row.scrollLeft ? left
      : right > row.scrollLeft + row.clientWidth ? right - row.clientWidth
      : row.scrollLeft
    if (target !== row.scrollLeft) row.scrollTo({ left: target, behavior: instant ? 'auto' : 'smooth' })
  }, [activeIndex, reduce])
  // "Show all" removes itself on click, so focus moves to the first name it
  // revealed instead of falling back to the document.
  const firstRevealedRef = useRef<HTMLLIElement>(null)
  useEffect(() => {
    if (expanded) firstRevealedRef.current?.focus()
  }, [expanded])
  const sec = MANIFEST[activeIndex]
  if (!sec) return null
  const suffix = SUFFIX[sec.id] ?? ''
  const gloss = GLOSS[sec.id]
  const longest = Math.max(0, ...sec.files.map((f) => f.length + suffix.length))
  const smCols = longest <= SM_TWO_COL_CHARS ? 'sm:grid-cols-2' : ''
  const xlCols = longest <= XL_THREE_COL_CHARS ? 'xl:grid-cols-3' : longest <= XL_TWO_COL_CHARS ? 'xl:grid-cols-2' : ''
  const select = (id: string) => {
    setActiveId(id)
    setExpanded(false)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = MANIFEST.length - 1
    const next =
      e.key === 'ArrowDown' || e.key === 'ArrowRight' ? (activeIndex === last ? 0 : activeIndex + 1)
      : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? (activeIndex === 0 ? last : activeIndex - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : -1
    if (next < 0) return
    e.preventDefault()
    select(MANIFEST[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[200px_minmax(0,1fr)]">
      {/* Below lg a scrolling row, so five tabs do not stack into a tall column
          on a phone before the names even start. */}
      {/* relative makes the row each tab's offsetParent, which the scroll
          effect above measures against. */}
      <div
        ref={rowRef}
        role="tablist"
        aria-label="Brain sections"
        aria-orientation={lgUp ? 'vertical' : 'horizontal'}
        onKeyDown={onKeyDown}
        className="relative flex gap-1 overflow-x-auto [scrollbar-width:none] lg:flex-col lg:self-start lg:overflow-visible"
      >
        {MANIFEST.map((s, i) => {
          const selected = i === activeIndex
          return (
            <button
              key={s.id}
              ref={(el) => { tabRefs.current[i] = el }}
              type="button"
              role="tab"
              id={tabId(s.id)}
              aria-selected={selected}
              aria-controls={PANEL_ID}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(s.id)}
              className={`flex shrink-0 items-baseline justify-between gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-olive-500/40 ${
                selected
                  ? 'bg-sand-200 text-sand-900 dark:bg-sand-800 dark:text-sand-50'
                  : 'text-sand-600 hover:bg-sand-200/60 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-800/60 dark:hover:text-sand-50'
              }`}
            >
              <span>{sentenceCase(s.label)}</span>
              <span
                className={`font-mono text-xs tabular-nums ${
                  selected ? 'text-olive-600 dark:text-olive-400' : 'text-sand-600 dark:text-sand-400'
                }`}
              >
                {s.files.length}
              </span>
            </button>
          )
        })}
      </div>

      <div role="tabpanel" id={PANEL_ID} aria-labelledby={tabId(sec.id)} className={`${PANEL_CLASS} ${PANEL_SHADOW} p-4 sm:p-6`}>
        {gloss ? <p className="max-w-2xl text-sm leading-relaxed text-sand-700 dark:text-sand-300">{gloss}</p> : null}
        {/* No hairline without a gloss above it to divide from. */}
        <div className={gloss ? 'mt-4 border-t border-sand-200 pt-4 dark:border-sand-800' : undefined}>
          <ul className={`grid min-h-[12rem] grid-cols-1 content-start gap-x-4 ${smCols} ${xlCols}`}>
            {sec.files.map((f, i) => {
              const name = f + suffix
              return (
                // Hidden with CSS, not left out, so the server HTML lists every name.
                <li
                  key={f}
                  ref={i === PHONE_PREVIEW ? firstRevealedRef : undefined}
                  tabIndex={i === PHONE_PREVIEW ? -1 : undefined}
                  className={`flex min-w-0 items-center gap-2 rounded py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-olive-500/40 ${!expanded && i >= PHONE_PREVIEW ? 'max-sm:hidden' : ''}`}
                >
                  <LockSimple weight="regular" size={14} aria-hidden className="shrink-0 text-sand-400 dark:text-sand-600" />
                  <span title={name} className="truncate font-mono text-[13px] text-sand-700 dark:text-sand-300">
                    {name}
                  </span>
                </li>
              )
            })}
          </ul>
          {!expanded && sec.files.length > PHONE_PREVIEW ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-2 rounded text-sm font-semibold text-olive-600 hover:text-olive-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 sm:hidden dark:text-olive-400 dark:hover:text-olive-300"
            >
              {`Show all ${sec.files.length} files`}
            </button>
          ) : null}
          <p className="sr-only">File contents are part of Premium.</p>
        </div>
      </div>
    </div>
  )
}

// Scroll-reveal wrapper, the same recipe as the site's Section component on
// /pricing and /about (fade + rise on first entry, once: true).
function Section({ children, className, 'aria-labelledby': labelledBy }: { children: React.ReactNode; className?: string; 'aria-labelledby'?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
      aria-labelledby={labelledBy}
    >
      {children}
    </motion.section>
  )
}

export function BrainStoryV4() {
  const hostRef = useRef<HTMLDivElement>(null)
  const labelEls = useRef<(HTMLDivElement | null)[]>([])
  const heroEls = useRef<(HTMLDivElement | null)[]>([])
  // smoothed (eased) screen positions, parallel to labelEls/heroEls — lazily
  // seeded on the first frame each label is seen, see the render loop.
  const labelSmooth = useRef<Array<{ x: number; y: number } | undefined>>([])
  const heroSmooth = useRef<Array<{ x: number; y: number } | undefined>>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [loadProgress, setLoadProgress] = useState(0)
  // Read through a ref so toggling reduced motion never rebuilds the WebGL
  // context; kickRef draws a frame (and restarts the loop if motion is allowed).
  const reduce = useReducedMotion()
  const reduceRef = useRef(reduce)
  const kickRef = useRef<() => void>(() => {})
  useEffect(() => {
    reduceRef.current = reduce
    kickRef.current()
  }, [reduce])

  // Premium subscribers already have the brain — re-label the CTA into the
  // viewer instead of pitching an upgrade. Treat the in-flight 'unknown' state
  // as open (NOT not-premium) so a paying customer is never flashed an upgrade
  // pitch while entitlement loads or if the API errors — same tri-state rule as
  // TemplateChrome/TopAuthPill. Anon/free derive to 'not-premium' synchronously,
  // and /explore is server-gated, so this never grants a free user access.
  const canOpen = usePremiumStatus() !== 'not-premium'
  const ctaLabel = canOpen ? 'Open the reader' : 'Get Premium'
  const ctaHref = canOpen ? '/design-systems/andromeda-pro/brain/explore' : '/pricing'

  // label positions spread over the WHOLE sphere around the brain (top, bottom, left, right,
  // front, back) via an even golden-angle spiral + a little jitter and varied distance.
  const dirs = useMemo(() => {
    const rnd = mulberry32(0x51a7)
    const n = LABELS.length
    const GA = Math.PI * (3 - Math.sqrt(5))
    return LABELS.map((_, i) => {
      const y = 1 - ((i + 0.5) / n) * 2            // +1 .. -1 (top to bottom)
      const rad = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = GA * i + rnd() * 0.7
      const dist = 1.02 + rnd() * 0.34             // float out around the brain
      return [Math.cos(theta) * rad * dist, y * dist, Math.sin(theta) * rad * dist] as [number, number, number]
    })
  }, [])

  // hero labels sit on their own wider ring so they read as the headline tier
  const heroDirs = useMemo(() => {
    const rnd = mulberry32(0x2b1d)
    const n = HERO_LABELS.length
    const GA = Math.PI * (3 - Math.sqrt(5))
    return HERO_LABELS.map((_, i) => {
      const y = 1 - ((i + 0.5) / n) * 2
      const rad = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = GA * i + 1.2 + rnd() * 0.5
      const dist = 1.42 + rnd() * 0.22
      return [Math.cos(theta) * rad * dist, y * dist, Math.sin(theta) * rad * dist] as [number, number, number]
    })
  }, [])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let alive = true, raf = 0, visible = false
    let renderer: import('three').WebGLRenderer | undefined
    let resizeObserver: ResizeObserver | undefined
    let viewObserver: IntersectionObserver | undefined
    let cleanupInput = () => {}

    ;(async () => {
      const [THREE, { GLTFLoader }] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/GLTFLoader.js'),
      ])
      if (!alive) return

      // one-time, mount-only constrained-device/connection check — a lower
      // static pixel-ratio cap for slow connections or low core counts. Not a
      // live watchdog: decided once here and never revisited.
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
      const isConstrained = conn?.saveData || ['slow-2g', '2g', '3g'].includes(conn?.effectiveType ?? '') || (navigator.hardwareConcurrency ?? 8) <= 4

      let W = host.clientWidth || 800, H = host.clientHeight || 600
      // Transparent canvas: the void ground is the stage's CSS background. No
      // tone mapping, so the ramp reads exactly as it does on the overview.
      const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
      renderer = r
      r.setClearColor(0x000000, 0)
      // Cap at 2: a wireframe is nothing but hairlines, and below native
      // resolution the browser upscales them thick and soft. Constrained
      // devices still get less.
      r.setSize(W, H); r.setPixelRatio(Math.min(window.devicePixelRatio || 1, isConstrained ? 1.5 : 2))
      r.domElement.style.opacity = '0'
      r.domElement.style.transition = 'opacity 0.6s ease'
      host.appendChild(r.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(38, W / H, 0.01, 100)
      camera.position.set(0, 0.3, 3)

      const stops = LINE_STOPS.map((css) =>
        new THREE.Color().setRGB(...oklchToLinearSrgb(css), THREE.LinearSRGBColorSpace),
      )
      const colorAt = (t: number, out: InstanceType<typeof THREE.Color>) => {
        const x = Math.min(Math.max(t, 0), 1) * (stops.length - 1)
        const i = Math.min(Math.floor(x), stops.length - 2)
        return out.copy(stops[i]).lerp(stops[i + 1], x - i)
      }

      let brainRoot: import('three').Group | null = null, ready = false
      const radius = 1

      // drag-to-spin state. Idle motion is separate and stops under reduced motion.
      const spin = { active: false, lastX: 0, lastY: 0, rotX: 0, rotY: 0, velY: 0 }
      // Under reduced motion the loop stops once input settles; this keeps it
      // drawing long enough for the eased labels to land.
      let lastInputAt = 0

      let runningT = 0
      // Frame time from performance.now(): THREE.Clock is deprecated.
      let last = performance.now()
      const flyPos = new THREE.Vector3(), wp = new THREE.Vector3(), projScratch = new THREE.Vector3()
      const spinEuler = new THREE.Euler(), spinQuat = new THREE.Quaternion()

      const tick = () => {
        raf = 0
        const now = performance.now()
        // cap dt so a CPU stall pauses motion instead of teleporting it; a real
        // clock instead of a frame-count assumption is what keeps drag inertia
        // and label positions deterministic in time.
        const dt = Math.min((now - last) / 1000, 1 / 30)
        last = now
        const still = reduceRef.current === true
        // Reduced motion freezes time: no idle orbit, no focus travel.
        if (!still) runningT += dt
        const t = runningT
        const transitionDuration = spin.active ? '0ms' : '90ms, 140ms'
        const R = radius

        // Invisible focus on an organic (non-linear) orbit. Nothing renders
        // here; the labels below use its position to decide which are lit.
        const a1 = t * 0.62, a2 = t * 0.37
        flyPos.set(
          Math.cos(a1) * R * 0.98 + Math.sin(a2 * 1.3) * R * 0.16,
          Math.sin(a1 * 0.8) * R * 0.42 + Math.cos(t * 0.9) * R * 0.12 + R * 0.12,
          Math.sin(a1) * R * 0.98 + Math.cos(a2 * 0.7) * R * 0.16,
        )

        // camera: the idle orbit. Backed off on a portrait stage, so a phone
        // keeps the brain's full width in frame.
        const orb = t * 0.12, d = (R * 2.6) / Math.min(1, camera.aspect)
        camera.position.set(Math.sin(orb) * d, R * 0.35, Math.cos(orb) * d)
        camera.lookAt(0, R * 0.05, 0)

        // drag-to-spin the brain, with release inertia (decay rate is per
        // real second via dt * 60, not per frame — same feel at any fps)
        if (!spin.active) { spin.rotY += spin.velY; spin.velY *= Math.pow(0.94, dt * 60) }
        if (brainRoot) brainRoot.rotation.set(spin.rotX, spin.rotY, 0)
        spinQuat.setFromEuler(spinEuler.set(spin.rotX, spin.rotY, 0))
        const activity = Math.min(1, Math.abs(spin.velY) * 34 + (spin.active ? 0.7 : 0))

        // labels: rotate WITH the brain (dragging carries them past the focus), light up near it
        const ease = 1 - Math.exp(-18 * dt)
        for (let i = 0; i < dirs.length; i++) {
          const el = labelEls.current[i]; if (!el) continue
          wp.set(dirs[i][0], dirs[i][1], dirs[i][2]).multiplyScalar(R).applyQuaternion(spinQuat)
          const near = 1 - Math.min(1, wp.distanceTo(flyPos) / (R * 0.9))
          projScratch.copy(wp).project(camera)
          const behind = projScratch.z > 1
          const targetX = Math.max(70, Math.min(W - 70, (projScratch.x * 0.5 + 0.5) * W)), targetY = (-projScratch.y * 0.5 + 0.5) * H
          let sm = labelSmooth.current[i]
          if (!sm) { sm = { x: targetX, y: targetY }; labelSmooth.current[i] = sm }
          sm.x += (targetX - sm.x) * ease; sm.y += (targetY - sm.y) * ease
          const op = behind ? 0 : Math.min(1, 0.12 + 0.88 * near * near + activity * 0.5)
          el.style.transform = `translate(-50%,-50%) translate(${Math.round(sm.x)}px,${Math.round(sm.y)}px) scale(${0.9 + near * 0.25})`
          el.style.opacity = String(op)
          el.style.color = near > 0.55 ? STAGE_INK.lit : STAGE_INK.label
          el.style.transitionDuration = transitionDuration
        }

        // hero labels — bigger, brighter, always fairly present
        for (let i = 0; i < heroDirs.length; i++) {
          const el = heroEls.current[i]; if (!el) continue
          wp.set(heroDirs[i][0], heroDirs[i][1], heroDirs[i][2]).multiplyScalar(R).applyQuaternion(spinQuat)
          const near = 1 - Math.min(1, wp.distanceTo(flyPos) / (R * 1.1))
          projScratch.copy(wp).project(camera)
          const behind = projScratch.z > 1
          const targetX = Math.max(110, Math.min(W - 110, (projScratch.x * 0.5 + 0.5) * W)), targetY = (-projScratch.y * 0.5 + 0.5) * H
          let sm = heroSmooth.current[i]
          if (!sm) { sm = { x: targetX, y: targetY }; heroSmooth.current[i] = sm }
          sm.x += (targetX - sm.x) * ease; sm.y += (targetY - sm.y) * ease
          const op = behind ? 0 : Math.min(1, 0.42 + 0.58 * near + activity * 0.4)
          el.style.transform = `translate(-50%,-50%) translate(${Math.round(sm.x)}px,${Math.round(sm.y)}px) scale(${0.96 + near * 0.14})`
          el.style.opacity = String(op)
          el.style.color = near > 0.5 ? STAGE_INK.lit : STAGE_INK.hero
          el.style.transitionDuration = transitionDuration
        }

        r.render(scene, camera)
        const settling = spin.active || Math.abs(spin.velY) > 1e-4 || now - lastInputAt < 500
        if (alive && visible && (!still || settling)) raf = requestAnimationFrame(tick)
      }
      // Starts one frame, and the loop if motion is allowed. Nothing to draw
      // until the model lands.
      const kick = () => {
        if (!alive || !ready || raf) return
        last = performance.now() // drop the time spent paused, so nothing jumps
        raf = requestAnimationFrame(tick)
      }
      kickRef.current = kick

      // The stage changes size with its breakpoints and with the site rail, so
      // follow the box itself rather than the window.
      resizeObserver = new ResizeObserver(() => {
        W = host.clientWidth || W; H = host.clientHeight || H
        r.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix()
        // Counts as input, so a frozen loop keeps drawing until the eased
        // labels reach their new spots.
        lastInputAt = performance.now()
        kick()
      })
      resizeObserver.observe(host)

      // The loop only runs while the stage is on screen.
      viewObserver = new IntersectionObserver(([entry]) => {
        visible = entry?.isIntersecting ?? false
        if (visible) kick()
      })
      viewObserver.observe(host)

      const onDown = (e: PointerEvent) => {
        spin.active = true; spin.lastX = e.clientX; spin.lastY = e.clientY; spin.velY = 0
        lastInputAt = performance.now()
        try { host.setPointerCapture(e.pointerId) } catch {}
        host.style.cursor = 'grabbing'
        kick()
      }
      const onMove = (e: PointerEvent) => {
        if (!spin.active) return
        const dx = e.clientX - spin.lastX, dy = e.clientY - spin.lastY
        spin.lastX = e.clientX; spin.lastY = e.clientY
        spin.velY = dx * 0.006
        spin.rotY += spin.velY
        spin.rotX = Math.max(-0.7, Math.min(0.7, spin.rotX + dy * 0.006))
        lastInputAt = performance.now()
        kick()
      }
      const onUp = () => {
        if (!spin.active) return
        spin.active = false; host.style.cursor = 'grab'
        lastInputAt = performance.now()
        kick()
      }
      host.addEventListener('pointerdown', onDown)
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      // touch-action pan-y hands a vertical swipe to the page, which ends the
      // drag with pointercancel instead of pointerup; without these the spin
      // would stay active forever.
      window.addEventListener('pointercancel', onUp)
      host.addEventListener('lostpointercapture', onUp)
      cleanupInput = () => {
        host.removeEventListener('pointerdown', onDown)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
        host.removeEventListener('lostpointercapture', onUp)
      }

      new GLTFLoader().load(MODEL_URL, (gltf: GLTF) => {
        if (!alive) return
        const model = gltf.scene
        // Poly models are often authored off-origin and at arbitrary scale.
        // Normalize to unit radius and recenter, so the camera framing is
        // reliable regardless of the source model.
        model.updateWorldMatrix(true, true)
        let box = new THREE.Box3().setFromObject(model)
        let sphere = box.getBoundingSphere(new THREE.Sphere())
        model.scale.setScalar(1 / (sphere.radius || 1))
        model.updateWorldMatrix(true, true)
        box = new THREE.Box3().setFromObject(model)
        sphere = box.getBoundingSphere(new THREE.Sphere())
        model.position.sub(sphere.center)
        model.updateWorldMatrix(true, true)
        box = new THREE.Box3().setFromObject(model)
        const size = box.getSize(new THREE.Vector3())

        // The overview's ramp, painted by height: brand 400 at the stem up to a
        // light neutral at the crown. One unlit material for every mesh, so the
        // ramp reads exactly.
        const material = new THREE.MeshBasicMaterial({
          vertexColors: true,
          wireframe: true,
          transparent: true,
          opacity: 1,
          depthWrite: false,
        })
        const v = new THREE.Vector3()
        const c = new THREE.Color()
        model.traverse((o) => {
          // Duck-typed on purpose: instanceof breaks when two copies of three load.
          const mesh = o as Mesh
          if (!mesh.isMesh) return
          // A copy per mesh, so writing its colours never touches a shared
          // geometry the model reuses elsewhere.
          const geometry = mesh.geometry.clone()
          const pos = geometry.getAttribute('position')
          const colors = new Float32Array(pos.count * 3)
          for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld)
            colorAt((v.y - box.min.y) / (size.y || 1), c).toArray(colors, i * 3)
          }
          geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
          mesh.geometry = geometry
          mesh.material = material
        })
        // The recentring moved the model, not its pivot, so rotating the model
        // itself would swing it around its old origin and pull it off the
        // labels. A pivot at the origin turns it in place.
        const pivot = new THREE.Group()
        pivot.add(model)
        scene.add(pivot)
        brainRoot = pivot

        ready = true; setStatus('ready')
        // fade the canvas in over the first rendered frames
        requestAnimationFrame(() => { r.domElement.style.opacity = '1' })
        kick()
      }, (event: ProgressEvent) => {
        if (alive && event.total) setLoadProgress(Math.round((event.loaded / event.total) * 100))
      }, () => { if (alive) setStatus('error') })
    })().catch(() => { if (alive) setStatus('error') })

    return () => {
      alive = false; kickRef.current = () => {}
      cancelAnimationFrame(raf); resizeObserver?.disconnect(); viewObserver?.disconnect(); cleanupInput()
      // forceContextLoss releases the actual WebGL context (browsers cap ~16);
      // dispose() alone leaks it, so repeated mounts of the story would run out.
      try { try { renderer?.forceContextLoss() } catch {} renderer?.dispose(); if (renderer?.domElement && host.contains(renderer.domElement)) host.removeChild(renderer.domElement) } catch {}
    }
  }, [dirs, heroDirs])

  return (
    <div className="brain-story flex min-h-screen flex-col bg-sand-50 dark:bg-sand-950">
      <style>{`
        .brain-story { ${brainVars('light')} }
        .dark .brain-story { ${brainVars('dark')} }
      `}</style>

      <Container className="pt-10 sm:pt-16">
        {/* ── Hero, in the overview hero's shape ── */}
        <section aria-labelledby="brain-hero" className="max-w-3xl">
          <Overline>Built for agents</Overline>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1
              id="brain-hero"
              className="text-4xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-5xl"
            >
              Andromeda Pro Brain
            </h1>
            <SystemTierChip tier="pro" />
          </div>
          <p className="mt-3 text-xl font-bold text-sand-900 dark:text-sand-50">
            Components are the pieces. The Brain is the judgment.
          </p>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-sand-700 dark:text-sand-300">{HERO_BODY}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={ctaHref} className={BTN_PRIMARY}>
              {ctaLabel}
            </Link>
            <Link href="#brain-corpus" className={BTN_SECONDARY}>
              See what&apos;s inside
            </Link>
          </div>
        </section>

        {/* ── The stage: the void in both site themes, like the overview's brain card ── */}
        <div
          className={`relative mt-10 h-[380px] overflow-hidden rounded-2xl border border-sand-200 dark:border-sand-800 sm:h-[520px] ${PANEL_SHADOW}`}
          style={{ background: BRAIN_GROUND }}
        >
          <div
            ref={hostRef}
            style={{ position: 'absolute', inset: 0, cursor: 'grab', touchAction: 'pan-y' }}
          />
          {/* floating labels layer */}
          <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {LABELS.map((txt, i) => (
              <div
                key={txt}
                ref={(el) => { labelEls.current[i] = el }}
                style={{ position: 'absolute', top: 0, left: 0, opacity: 0, fontFamily: MONO, fontSize: 12, letterSpacing: '0.02em', color: STAGE_INK.label, whiteSpace: 'nowrap', textShadow: `0 0 8px ${STAGE_INK.halo}`, willChange: 'transform,opacity', transition: 'transform 90ms linear, opacity 140ms linear' }}
              >
                {txt}
              </div>
            ))}
          </div>
          {/* hero labels layer (bigger / higher hierarchy) */}
          <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {HERO_LABELS.map((txt, i) => (
              <div
                key={txt}
                ref={(el) => { heroEls.current[i] = el }}
                style={{ position: 'absolute', top: 0, left: 0, opacity: 0, fontFamily: SANS, fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', color: STAGE_INK.hero, whiteSpace: 'nowrap', textShadow: `0 0 14px ${STAGE_INK.halo}`, willChange: 'transform,opacity', transition: 'transform 90ms linear, opacity 140ms linear' }}
              >
                {txt}
              </div>
            ))}
          </div>
          {status !== 'ready' && (
            <div aria-hidden style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: STAGE_INK.status }}>
              {status === 'error' ? 'Scene unavailable' : loadProgress > 0 ? `Loading the brain… ${loadProgress}%` : 'Loading the brain…'}
            </div>
          )}
          {/* Drag affordance, a static rotate-3d icon. In the corner because the
              hero labels pass through the bottom centre. */}
          <div style={{ position: 'absolute', right: 16, bottom: 16, pointerEvents: 'none' }}>
            <Rotate3d size={26} color={STAGE_INK.lit} strokeWidth={1.5} />
          </div>
        </div>

        {/* Classic vs the Brain: the workflow contrast */}
        <Section className="mt-20" aria-labelledby="brain-difference">
          <SectionHead
            id="brain-difference"
            overline="The difference"
            title="Where the classic workflow leaks."
            sub="A design system made for people loses intent at every handoff. One made for agents is already code, tokens and written rules."
          />

          <div className={`mt-8 overflow-hidden ${PANEL_CLASS} ${PANEL_SHADOW}`}>
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr>
                  <th scope="col" className="px-4 py-3 font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-sand-600 sm:px-5 dark:text-sand-400">
                    Classic design system
                  </th>
                  {/* The lifted column, like the overview ledger's Premium
                      column: one surface, no colour. */}
                  <th scope="col" className="border-l border-sand-200 bg-sand-50 px-4 py-3 font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-olive-600 sm:px-5 dark:border-sand-800 dark:bg-sand-950 dark:text-olive-400">
                    With the Brain
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row.classic}>
                    <td className="border-t border-sand-200 px-4 py-3.5 align-top text-sm leading-relaxed text-sand-600 sm:px-5 dark:border-sand-800 dark:text-sand-400">
                      <div className="flex gap-2.5">
                        <XIcon weight="regular" size={15} aria-hidden className="mt-0.5 shrink-0 text-sand-400 dark:text-sand-600" />
                        <span className="min-w-0 break-words">{row.classic}</span>
                      </div>
                    </td>
                    <td className="border-l border-t border-sand-200 bg-sand-50 px-4 py-3.5 align-top text-sm leading-relaxed text-sand-900 sm:px-5 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-50">
                      <div className="flex gap-2.5">
                        <Check weight="regular" size={15} aria-hidden className="mt-0.5 shrink-0 text-olive-600 dark:text-olive-400" />
                        <span className="min-w-0 break-words">{row.brain}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-sand-600 dark:text-sand-400">
            Your agent does the building. You stay in the loop, and you decide what ships.
          </p>
        </Section>

        {/* What it is */}
        <Section className="mt-20" aria-labelledby="brain-flow">
          <SectionHead id="brain-flow" overline="The design brain" title="The taste lives in the system, not the prompt." />
          {/* Kicker, headline, diagram. No paragraph: the picture is the
              explanation, and prose above it only said the same thing first. */}

          <BrainFlow />
        </Section>

        {/* What's inside: section tabs and every file name, locked */}
        <Section className="mt-20" aria-labelledby="brain-corpus">
          <SectionHead
            id="brain-corpus"
            overline="What's inside"
            title={`The ${BRAIN_TEASER.totalFiles} files your agent reads first.`}
            sub="Rules written for the machine: when a color may carry meaning, how far a panel may breathe, what every state owes the user. The names are open. What is written inside them ships with Premium."
          />

          <CorpusExplorer />
        </Section>

        {/* Legacy vs Pro: why this Brain is a step forward. Hidden when the Pro brain is not bundled. */}
        {SHOW_VERSUS && (
        <Section className="mt-20" aria-labelledby="brain-versus">
          <SectionHead
            id="brain-versus"
            overline="Legacy vs Pro"
            title="A step forward from the Andromeda Brain."
            sub="The Pro Brain grew out of Andromeda Legacy. It covers more of the system, closes the gaps agents slipped through, and hands the checking to scripts."
          />

          <div className={`mt-8 overflow-x-auto ${PANEL_CLASS} ${PANEL_SHADOW}`}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th scope="col" className="px-4 py-3 sm:px-5">
                    <span className="sr-only">Measure</span>
                  </th>
                  <th scope="col" className="px-4 py-3 font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-sand-600 sm:px-5 dark:text-sand-400">
                    Legacy Brain
                  </th>
                  <th scope="col" className="border-l border-sand-200 bg-sand-50 px-4 py-3 font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-olive-600 sm:px-5 dark:border-sand-800 dark:bg-sand-950 dark:text-olive-400">
                    Pro Brain
                  </th>
                </tr>
              </thead>
              <tbody>
                {VERSUS_ROWS.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" className="border-t border-sand-200 px-4 py-3.5 text-sm font-semibold text-sand-900 sm:px-5 dark:border-sand-800 dark:text-sand-50">
                      {row.label}
                    </th>
                    <td className="border-t border-sand-200 px-4 py-3.5 text-sm tabular-nums text-sand-600 sm:px-5 dark:border-sand-800 dark:text-sand-400">
                      {row.legacy}
                    </td>
                    <td className="border-l border-t border-sand-200 bg-sand-50 px-4 py-3.5 text-sm font-semibold tabular-nums text-sand-900 sm:px-5 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-50">
                      {row.pro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-sand-600 dark:text-sand-400">
            {NEW_LINE}
          </p>

          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {IMPROVEMENTS.map((item) => (
              <li key={item.title} className={`${PANEL_CLASS} p-5`}>
                <h3 className="text-base font-bold text-sand-900 dark:text-sand-50">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-sand-600 dark:text-sand-400">{item.line}</p>
              </li>
            ))}
          </ul>
        </Section>
        )}

        {/* How it works */}
        <Section className="mt-20" aria-labelledby="brain-how">
          <SectionHead
            id="brain-how"
            overline="How it works"
            title="Your agent reads it, not you."
            sub={`Nobody has to learn the system or keep it in their head. The ${numberWord(SKILLS.length)} skills walk your agent through the same four steps on every build.`}
          />
          {/* Two columns at most: four beside the rail leave a card about 190px
              inside, and the longest chip needs about 196px on one line. */}
          <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {LOOP.map((step, i) => (
              <li key={step.title} className={`${PANEL_CLASS} flex flex-col p-5`}>
                <span aria-hidden className="font-mono text-xs font-semibold tabular-nums text-olive-600 dark:text-olive-400">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-base font-bold text-sand-900 dark:text-sand-50">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-sand-600 dark:text-sand-400">{step.line}</p>
                {step.chips.length > 0 ? (
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                    {step.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-md border border-sand-200 bg-sand-50 px-2 py-0.5 font-mono text-[11px] text-sand-700 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-300"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </Section>

        {/* Closing card, class for class with the overview's, so the two pages
            close the same way. The primary button stays premium-aware: a
            subscriber gets the reader, everyone else gets pricing. */}
        <Section
          aria-labelledby="brain-get"
          className="relative mt-20 overflow-hidden rounded-2xl border border-olive-500/20 bg-gradient-to-br from-olive-500/8 via-transparent to-transparent p-8 text-center ring-1 ring-inset ring-olive-500/10"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-40 w-64 rounded-full bg-olive-500/10 blur-3xl" />
          </div>
          <h2 id="brain-get" className="relative text-2xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
            Give your agent the Brain.
          </h2>
          <p className="relative mt-2 text-base text-sand-700 dark:text-sand-300">
            {`One command installs all ${BRAIN_TEASER.totalFiles} files in your project, and running it again updates them. Premium also opens the reader, with every rule a click away while you work.`}
          </p>
          <div className="relative mt-6 flex flex-wrap justify-center gap-3">
            <Link href={ctaHref} className={BTN_PRIMARY}>
              {ctaLabel}
            </Link>
            <Link href="/design-systems/andromeda-pro" className={BTN_SECONDARY}>
              Explore Andromeda Pro
            </Link>
          </div>
        </Section>
      </Container>

      {/* footer, consistent with the content pages */}
      <Container className="mt-16 pb-10">
        <SiteFooter />
      </Container>
    </div>
  )
}
