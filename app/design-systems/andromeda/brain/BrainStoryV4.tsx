'use client'

// ============================================================
// Andromeda Brain — story page V4 (Three.js · the brain).
// Same choreography as V3, but the hero is an actual BRAIN, drawn
// as a wireframe carrying the four section colours (see the paint
// step in the loader). Floating labels ride the brain's rotation
// and light up as an invisible focus passes them; the orbiting
// bulb that used to play that role was removed.
//
// Model: low-poly "Brain" by Poly by Google, CC BY 3.0 (via Poly
// Pizza) — geometry-only, re-materialed here. Asset lives in
// /public/models/brain.glb (git-excluded; keep the on-page credit
// if this ships). Label text derives from BRAIN_TEASER (real
// folder, names only — never brain CONTENT). Safe for free/anon.
// ============================================================

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Group, Mesh, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { Rotate3d } from 'lucide-react'
import { ArrowRight, Fire, Target, Gauge, Check, X as XIcon } from '@phosphor-icons/react'
import { buttonClasses } from '@/app/components/buttonClasses'
import { usePremiumStatus } from '@/app/components/billing/usePremiumStatus'
import { HeaderSocials } from '@/app/components/HeaderSocials'
import { SiteFooter } from '@/app/components/SiteFooter'
import { BRAIN_TEASER } from '@/app/lib/andromeda-brain-teaser.generated'

// AI Canvas site palette: sand neutrals + olive accent, Manrope + mono fonts.
const C = { base: '#0E0E0F', node: '#9B9B9E', reason: '#B7B7BA', bright: '#F4F4FA', accent: '#DAE4A0', accentBtn: '#A8B94D', muted: '#7B7B7D' }
const SANS = "var(--font-sans), 'Manrope', system-ui, sans-serif"
const MONO = "var(--font-mono, var(--font-jetbrains-mono)), 'Geist Mono', monospace"
const MODEL_URL = '/models/brain.glb'

const FND: readonly string[] = BRAIN_TEASER.sections.find((s) => s.id === 'foundations')?.files ?? []
const CMP: readonly string[] = BRAIN_TEASER.sections.find((s) => s.id === 'component-rules')?.files ?? []
const take = (arr: readonly string[], n: number) => { const step = Math.max(1, Math.floor(arr.length / n)); const o: string[] = []; for (let i = 0; i < arr.length && o.length < n; i += step) o.push(arr[i]); return o }
const LABELS: string[] = [
  ...take(FND, 6), ...take(CMP, 12),
  'color is measurement', 'one frame per surface', 'must · should · may', 'movement signals data',
]

// Bigger, higher-hierarchy "hero" labels — the headline concepts of the brain.
const HERO_LABELS = ['Foundations', 'Component', 'Rules', 'Design Intent', 'tokens']

function mulberry32(seed: number) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

// The four corpus sections and their colours, identical to the premium reader's
// BrainRender.tsx. Kept in step with that file: if the reader's palette moves,
// this moves with it, or the hero and the reader stop being the same brain.
const SECTION_ZONES: { dir: [number, number, number]; hex: string }[] = [
  { dir: [0.2, 0.9, 0.35], hex: '#a78bfa' },   // Index, purple
  { dir: [-0.9, 0.05, 0.4], hex: '#38bdf8' },  // Foundations, cyan
  { dir: [0.9, 0.05, 0.4], hex: '#fb923c' },   // Components, orange
  { dir: [0.0, -0.7, 0.7], hex: '#a3e635' },   // Skills, lime
]


// The brain's one and only look. Unlit on purpose: the vertex colours painted
// onto the geometry carry it, and a lit material would wash them toward the
// light. toneMapped false because this scene renders through ACES filmic at 1.1
// exposure, which compresses and desaturates what it touches, while the premium
// reader has no tone mapping. Opting out is what makes the two brains match.
const makeBrainMaterial = (T: typeof import('three')) =>
  new T.MeshBasicMaterial({ wireframe: true, vertexColors: true, toneMapped: false })

// ── editorial copy helpers ──────────────────────────────────────────────────
// sand tokens: sand-900 #1B1B1C surface, sand-800 #2D2D2E border
const PANEL: React.CSSProperties = { background: 'transparent', border: '1px solid #2D2D2E', borderRadius: 16, padding: '24px 28px' }
// Smaller sibling of PANEL — the solid-surface card treatment reused by the
// bento side tiles and the "How it works" benefit cards.
const PANEL_SOLID: React.CSSProperties = { background: '#1B1B1C', border: '1px solid #2D2D2E', borderRadius: 12, padding: 20 }
// Section description, matching the homepage: text-base, leading-relaxed,
// sand-400, mt-3, and the max-w-2xl measure the homepage sets on its own
// description. 672 of the 896 column keeps a comfortable line length instead of
// running the full width.
const SECTION_DESC: React.CSSProperties = {
  fontSize: 16,
  color: C.node,
  lineHeight: 1.625,
  maxWidth: 672,
  margin: '12px 0 0',
}
function Chip({ children }: { children: React.ReactNode }) {
  return <span style={{ fontFamily: MONO, fontSize: 12, color: C.reason, background: '#1B1B1C', border: '1px solid #2D2D2E', borderRadius: 6, padding: '3px 9px', whiteSpace: 'nowrap', display: 'inline-block' }}>{children}</span>
}
// The full corpus manifest, derived from the teaser itself rather than a
// hand-listed three, so a section added to the brain shows up here instead of
// being counted in the total and rendered nowhere. REMAINDER is the entry
// layer the sections do not cover (the index the agent opens first, the
// component inventory, the conformance tool); it self-corrects as the brain
// grows, and disappears entirely once every file has a section.
const MANIFEST = BRAIN_TEASER.sections as readonly { id: string; label: string; files: readonly string[] }[]
const SECTIONED = MANIFEST.reduce((n, s) => n + s.files.length, 0)
const REMAINDER = BRAIN_TEASER.totalFiles - SECTIONED
// One line per known section. An unknown id (the list is growing) renders
// without a gloss rather than with a wrong one.
const GLOSS: Record<string, string> = {
  foundations: 'How the system thinks. Color, layout, spacing, motion, states, voice.',
  'component-rules': 'One file per component, holding the decisions that make it Andromeda instead of generic.',
  skills: 'Working modes for the agent: build with the system, and review work against it.',
  index: 'The entry point, and the inventory of what already exists so the agent stops reinventing components.',
  tools: 'A conformance check the agent can run against its own output.',
}
// These describe how the agent works, not what you end up with. The flow
// diagram above already names the outcomes, and when these read as outcomes too
// the page made the same three promises twice within a screen of each other.
const BENEFITS = [
  { label: 'Faster', icon: <Gauge weight="regular" size={18} />, body: 'It starts from decisions that are already written down, instead of trying options until one looks right.' },
  { label: 'Accurate', icon: <Target weight="regular" size={18} />, body: 'It reaches for the components that already exist before it invents anything new.' },
  { label: 'Efficient', icon: <Fire weight="regular" size={18} />, body: 'No tokens burned exploring ground the system already settled.' },
]

// Classic workflow pains (left) vs what an AI-native system delivers (right).
// Right-side claims stay to what Andromeda + the Brain actually ship — code,
// tokens, and machine-readable rules. No Figma-to-code bridge is implied.
const COMPARE = [
  { classic: 'Documentation nobody reads, if it exists at all', native: 'Rules written down in a form your agent reads' },
  { classic: 'Designers in Figma, developers in code, intent lost in the handoff', native: 'No handoff: the system is already code and tokens' },
  { classic: 'Weeks from a mock-up to a production-ready screen', native: 'On-brand screens from the system on the first prompt' },
  { classic: 'New screens drift off-brand as the team grows', native: 'New work builds against the same rules, so it holds' },
  { classic: 'Every change is another Figma to code round trip', native: 'Change a token, and everything built on it follows' },
]

// Section separator: the AI Canvas wire mark, three across, like the homepage divider.
function WireDivider() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 64, margin: '48px 0' }} aria-hidden>
      {[0, 1, 2].map((i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={i} src="/ai-canvas-wire.svg" alt="" width={28} height={24} />
      ))}
    </div>
  )
}

// The flow diagram: what goes in, the judgment in the middle, what comes out.
// Counts come from the teaser so the picture cannot drift from the corpus.
const FLOW_IN = [
  { title: 'Tokens', sub: 'the values' },
  { title: 'Components', sub: `${MANIFEST.find((s) => s.id === 'component-rules')?.files.length ?? 0} ready to use` },
  { title: 'Your prompt', sub: 'what you want built' },
]
// Three things you get, in widening scope: this screen, the whole surface, and
// every screen after. The middle used to read "Decisions, not guesses", which
// described the process rather than naming something you walk away with.
const FLOW_OUT = [
  { title: 'On-brand screen', sub: 'first try, not the fifth' },
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

// The centre card, and the wireframe brain across the top of it. The source PNG
// is 732x660 and 400KB, and nearly a third of that height is empty margin; it
// ships trimmed to its content box, resized to 2x display size and converted to
// WebP, which is 7.7KB. Trimming is what closes the gap under the artwork, and
// the display size is set so the brain itself renders exactly as before. Its
// background is rgb(14,14,15), the sand-950 the card is painted, so the image
// has no visible edge.
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
            <stop offset="0%" stopColor={mode === 'in' ? '#2D2D2E' : '#7B7B7D'} />
            <stop offset="100%" stopColor={mode === 'in' ? '#7B7B7D' : '#2D2D2E'} />
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

function BrainFlow() {
  const node: React.CSSProperties = {
    height: ROW_H,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 14px',
    background: '#1B1B1C',
    border: '1px solid #2D2D2E',
    borderRadius: 10,
  }
  const head: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: C.muted,
    margin: '0 0 10px',
  }
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
        @media (max-width: 760px) {
          .flow-heads { display: none; }
          .flow-grid { grid-template-columns: 1fr; gap: ${ROW_GAP}px; }
          .flow-link { display: none; }
        }
      `}</style>

      {/* A touch more air than when a paragraph sat above: the diagram is the
          section's body now, not a figure under prose. */}
      <div className="flow-heads" style={{ marginTop: 36 }}>
        <p style={head}>What goes in</p>
        <span />
        <p style={{ ...head, textAlign: 'center' }}>The judgment</p>
        <span />
        <p style={{ ...head, textAlign: 'right' }}>What comes out</p>
      </div>

      <div className="flow-grid">
        <div className="flow-col">
          {FLOW_IN.map((n) => (
            <div key={n.title} style={node}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.bright }}>{n.title}</span>
              <span style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{n.sub}</span>
            </div>
          ))}
        </div>

        <FlowLinks mode="in" />

        <div className="flow-mid">
          {/* The focal card. Painted sand-950, the same colour the image's own
              background is, so the artwork has no visible edge. */}
          {/* Border stays 1px, as every card here is. Full-strength olive read
              heavy beside the sand hairlines around it, so it is dialled back to
              a true hairline that still marks this as the focal card. */}
          <div style={{ ...node, height: CARD_H, width: '100%', padding: `${CARD_PAD_TOP}px 0 ${CARD_PAD_BOTTOM}px`, alignItems: 'center', justifyContent: 'flex-start', background: C.base, borderColor: 'rgba(168,185,77,0.55)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/andromeda-brain-wire.webp"
              alt=""
              width={IMG_W}
              height={IMG_H}
              loading="lazy"
              decoding="async"
              style={{ display: 'block' }}
            />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.bright, marginTop: IMG_GAP }}>Andromeda Brain</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.accent, marginTop: 2 }}>{BRAIN_TEASER.totalFiles} files</span>
          </div>
        </div>

        <FlowLinks mode="out" />

        <div className="flow-col">
          {FLOW_OUT.map((n) => (
            <div key={n.title} style={node}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.bright }}>{n.title}</span>
              <span style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{n.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

// The teaser publishes names for the sectioned files only, so the entry layer
// (index, inventory, tool) arrives as a count with no names. These are the
// three at the current pin. The moment inject-premium ships its index and tools
// sections the names come from the data and this list stops being read.
// Hand-listed until then, sliced to REMAINDER so it can never claim more
// files than the brain actually has.
const ENTRY_FILES = ['rules.md', 'INVENTORY.md', 'check-colors']

// The explorer's rail: every section, plus the entry layer the sections do not
// cover yet, so the rail always accounts for all 56 files.
const EXPLORER = [
  ...MANIFEST.map((s) => ({ id: s.id, label: s.label, count: s.files.length, files: s.files, gloss: GLOSS[s.id] })),
  ...(REMAINDER > 0
    ? [{
        id: 'index-tooling',
        label: 'Index and tooling',
        count: REMAINDER,
        files: ENTRY_FILES.slice(0, REMAINDER) as readonly string[],
        gloss: 'The entry point the agent opens first, the inventory of what already exists so it stops reinventing components, and a conformance tool it can run against its own output.',
      }]
    : []),
]

// Section rail on the left, that section's file names on the right, every name
// locked. Two columns, not three, so a 39-name list stays readable at this
// width. A rail entry the teaser gives no names for (the entry layer, until its
// section ships) shows its gloss instead of an empty grid.
function CorpusExplorer() {
  const [active, setActive] = useState(0)
  const sec = EXPLORER[active]
  return (
    <>
      <style>{`
        .corpus-explorer { display: grid; grid-template-columns: 260px 1fr; gap: 24px; }
        /* Hover and selected match the site's left nav: sand-800 at 60% on
           hover, solid sand-800 when selected. */
        .corpus-rail-item { width: 100%; text-align: left; background: none; border: none; cursor: pointer; display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 16px 18px; border-radius: 0 8px 8px 0; transition: background 0.15s ease, color 0.15s ease; }
        .corpus-rail-item:hover { background: rgba(45,45,46,0.6); }
        .corpus-rail-item[aria-current='true'] { background: #2D2D2E; }
        .corpus-file { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; transition: background 0.15s ease; }
        .corpus-file:hover { background: #1B1B1C; }
        @media (max-width: 760px) {
          .corpus-explorer { grid-template-columns: 1fr; }
          .corpus-files { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div className="corpus-explorer" style={{ marginTop: 32 }}>
        {/* alignSelf start, so the rail keeps its own height. Stretching it to
            the grid row made its rule run on past the last item whenever the
            pane was the taller of the two. */}
        <div style={{ borderLeft: '1px solid #2D2D2E', alignSelf: 'start' }}>
          {EXPLORER.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className="corpus-rail-item"
              onClick={() => setActive(i)}
              aria-current={i === active}
              style={{
                borderLeft: `2px solid ${i === active ? C.accentBtn : 'transparent'}`,
                marginLeft: -1,
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: i === active ? C.bright : C.muted }}>
                {s.label}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: C.accent, opacity: i === active ? 1 : 0.55 }}>{s.count}</span>
            </button>
          ))}
        </div>

        <div style={{ ...PANEL, padding: 20 }}>
          {sec.files.length > 0 ? (
            <div className="corpus-files" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {sec.files.map((f) => (
                <div key={f} className="corpus-file">
                  {/* One marker shape and one colour everywhere, so the pane
                      reads as a set rather than four different treatments. */}
                  <span aria-hidden style={{ width: 8, height: 8, borderRadius: 2, background: C.accent, flexShrink: 0 }} />
                  <span style={{ fontFamily: MONO, fontSize: 13, color: C.node }}>{f}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 15, lineHeight: 1.7, color: C.node, margin: 0, padding: '10px 12px' }}>{sec.gloss}</p>
          )}
        </div>
      </div>
    </>
  )
}

// Scroll-reveal wrapper — same recipe as the site's Section component on
// /pricing and /about (fade + rise on first entry, once: true). Kept local
// since this page styles with inline style objects, not Tailwind className.
function Section({ children, className, style, delay = 0 }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  )
}

// Card-level reveal — smaller offset/duration than Section, matching the
// site's PlanCard sibling-stagger recipe (explicit delay = base + i * step).
function BenefitCard({ benefit, delay }: { benefit: (typeof BENEFITS)[number]; delay: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ display: 'flex', flexDirection: 'column', ...PANEL_SOLID }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ display: 'flex', width: 32, height: 32, flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: '#2D2D2E', color: C.reason }}>
          {benefit.icon}
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.bright }}>{benefit.label}</span>
      </div>
      <p style={{ flex: 1, fontSize: 14, color: C.node, lineHeight: 1.625, margin: 0 }}>{benefit.body}</p>
    </motion.div>
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

  // Premium subscribers already have the brain — re-label the CTA into the
  // viewer instead of pitching an upgrade. Treat the in-flight 'unknown' state
  // as open (NOT not-premium) so a paying customer is never flashed an upgrade
  // pitch while entitlement loads or if the API errors — same tri-state rule as
  // TemplateChrome/TopAuthPill. Anon/free derive to 'not-premium' synchronously,
  // and /explore is server-gated, so this never grants a free user access.
  const canOpen = usePremiumStatus() !== 'not-premium'
  const ctaLabel = canOpen ? 'Read the brain' : 'Get the brain with premium'
  const ctaHref = canOpen ? '/design-systems/andromeda/brain/explore' : '/pricing'

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
    let alive = true, raf = 0
    let renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera
    let onResize = () => {}
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
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
      // Cap at 2, matching the premium reader. It used to cap at 1.5, so on a
      // retina screen the canvas rendered below native and the browser upscaled
      // it: every hairline wire came out thick and soft. A wireframe is nothing
      // but hairlines, so it pays that cost far harder than a solid mesh would,
      // and the scene is much cheaper now that the lights and the environment
      // map are gone. Constrained devices still get less.
      renderer.setSize(W, H); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isConstrained ? 1.5 : 2))
      renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1
      // The render loop only starts once the model lands, and an opaque
      // (alpha:false) canvas with an uninitialized buffer composites as a
      // WHITE flash on some GPUs. Clear it to the void immediately, and keep
      // the canvas transparent until the first real frames fade it in.
      renderer.setClearColor(new THREE.Color(C.base), 1)
      renderer.clear()
      renderer.domElement.style.opacity = '0'
      renderer.domElement.style.transition = 'opacity 0.6s ease'
      host.appendChild(renderer.domElement)

      scene = new THREE.Scene(); scene.background = new THREE.Color(C.base)

      // kick the GLTF fetch off as early as correctness allows — right after
      // scene exists (onLoad only needs scene.add(model) + THREE + the state
      // below), BEFORE the GPU-bound PMREM/env-map generation and lights/camera
      // setup that used to run first and delay the fetch for no reason.
      let brainRoot: Group | null = null, radius = 1, ready = false
      const brainMeshes: Mesh[] = []

      const loader = new GLTFLoader()
      loader.load(MODEL_URL, (gltf: GLTF) => {
        if (!alive) return
        const model = gltf.scene
        // Duck-typed on purpose: instanceof breaks when two copies of three load.
        model.traverse((o) => { const m = o as Mesh; if (m.isMesh) brainMeshes.push(m) })
        scene.add(model)
        // Poly models are often authored off-origin and at arbitrary scale.
        // Update world matrices first, then normalize to unit radius + recenter,
        // so the camera framing is reliable regardless of the source model.
        model.updateWorldMatrix(true, true)
        let mbox = new THREE.Box3().setFromObject(model)
        let msph = mbox.getBoundingSphere(new THREE.Sphere())
        model.scale.setScalar(1 / (msph.radius || 1))
        model.updateWorldMatrix(true, true)
        mbox = new THREE.Box3().setFromObject(model)
        msph = mbox.getBoundingSphere(new THREE.Sphere())
        model.position.sub(msph.center)
        radius = 1
        brainRoot = model

        // Radiant wireframe, painted the same way the premium reader paints its
        // brain (BrainRender.tsx): the four section colours blended by how
        // closely each vertex faces each section. Same palette, same weighting,
        // so the hero and the reader are recognisably the same object, and the
        // colours mean something rather than being a decorative rainbow.
        //
        // new THREE.Color(hex) yields LINEAR channels, which is what a vertex
        // colour buffer wants. An earlier pass here used setHSL, whose default
        // colour space is the working one, so sRGB-intended values went in
        // untranslated and the whole mesh washed out toward white.
        const zoneCols = SECTION_ZONES.map((z) => {
          const c = new THREE.Color(z.hex)
          return [c.r, c.g, c.b] as [number, number, number]
        })
        const zoneDirs = SECTION_ZONES.map((z) => new THREE.Vector3(z.dir[0], z.dir[1], z.dir[2]).normalize())
        for (const mesh of brainMeshes) {
          const geo = mesh.geometry
          if (!geo?.attributes?.position || geo.attributes.color) continue
          const pos = geo.attributes.position
          geo.computeBoundingBox()
          const bb = geo.boundingBox!
          const cx = (bb.min.x + bb.max.x) / 2
          const cy = (bb.min.y + bb.max.y) / 2
          const cz = (bb.min.z + bb.max.z) / 2
          const colors = new Float32Array(pos.count * 3)
          const d = new THREE.Vector3()
          for (let i = 0; i < pos.count; i++) {
            d.set(pos.getX(i) - cx, pos.getY(i) - cy, pos.getZ(i) - cz).normalize()
            let wsum = 0
            const w = [0, 0, 0, 0]
            for (let k = 0; k < 4; k++) {
              const dot = Math.max(0, d.dot(zoneDirs[k]))
              // cubed so each section holds its own area, plus an epsilon so no
              // wire on the far side goes fully black
              w[k] = dot * dot * dot + 0.04
              wsum += w[k]
            }
            let r = 0, g = 0, b = 0
            for (let k = 0; k < 4; k++) {
              const t = w[k] / wsum
              r += zoneCols[k][0] * t
              g += zoneCols[k][1] * t
              b += zoneCols[k][2] * t
            }
            colors[i * 3] = r
            colors[i * 3 + 1] = g
            colors[i * 3 + 2] = b
          }
          geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        }

        for (const mesh of brainMeshes) mesh.material = makeBrainMaterial(THREE)

        // The orbiting bulb and its point light are gone. The wireframe is
        // unlit, so that light lit nothing; all it did was fly a bright dot
        // across the scene. Its path survives below as an invisible focus, which
        // is what still walks the glow along the labels.

        ready = true; setStatus('ready')
        // fade the canvas in over the first rendered frames
        requestAnimationFrame(() => { renderer.domElement.style.opacity = '1' })
        // the render loop only starts once there's something to actually
        // render — no more compositing an empty scene while the asset streams in.
        loop()
      }, (event: ProgressEvent) => {
        if (alive && event.total) setLoadProgress(Math.round((event.loaded / event.total) * 100))
      }, () => { if (alive) setStatus('error') })

      // No lights and no environment map. The brain is an unlit wireframe, so
      // every one of them rendered nothing; generating the PMREM environment
      // alone was real work on every mount.

      camera = new THREE.PerspectiveCamera(38, W / H, 0.01, 100)
      camera.position.set(0, 0.3, 3)

      onResize = () => {
        W = host.clientWidth || W; H = host.clientHeight || H
        renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)

      // drag-to-spin state (replaces the old hover-to-chase). Idle is untouched.
      const spin = { active: false, lastX: 0, lastY: 0, rotX: 0, rotY: 0, velY: 0 }
      const onDown = (e: PointerEvent) => {
        spin.active = true; spin.lastX = e.clientX; spin.lastY = e.clientY; spin.velY = 0
        try { host.setPointerCapture(e.pointerId) } catch {}
        host.style.cursor = 'grabbing'
      }
      const onMove = (e: PointerEvent) => {
        if (!spin.active) return
        const dx = e.clientX - spin.lastX, dy = e.clientY - spin.lastY
        spin.lastX = e.clientX; spin.lastY = e.clientY
        spin.velY = dx * 0.006
        spin.rotY += spin.velY
        spin.rotX = Math.max(-0.7, Math.min(0.7, spin.rotX + dy * 0.006))
      }
      const onUp = () => { spin.active = false; host.style.cursor = 'grab' }
      host.addEventListener('pointerdown', onDown)
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      cleanupInput = () => {
        host.removeEventListener('pointerdown', onDown)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }

      const clock = new THREE.Clock()
      let runningT = 0
      const flyPos = new THREE.Vector3(), wp = new THREE.Vector3(), projScratch = new THREE.Vector3()
      const spinEuler = new THREE.Euler(), spinQuat = new THREE.Quaternion()

      const loop = () => {
        raf = requestAnimationFrame(loop)
        // cap dt so a CPU stall / backgrounded tab pauses motion instead of
        // teleporting it; a real clock instead of a frame-count assumption is
        // what keeps drag inertia and label positions deterministic in time.
        const dt = Math.min(clock.getDelta(), 1 / 30)
        runningT += dt
        const t = runningT
        const transitionDuration = spin.active ? '0ms' : '90ms, 140ms'

        if (ready) {
          const R = radius
          // Invisible focus on an organic (non-linear) orbit. Nothing renders
          // here any more; the labels below use its position to decide which of
          // them is currently lit.
          const a1 = t * 0.62, a2 = t * 0.37
          flyPos.set(
            Math.cos(a1) * R * 0.98 + Math.sin(a2 * 1.3) * R * 0.16,
            Math.sin(a1 * 0.8) * R * 0.42 + Math.cos(t * 0.9) * R * 0.12 + R * 0.12,
            Math.sin(a1) * R * 0.98 + Math.cos(a2 * 0.7) * R * 0.16,
          )

          // camera: the idle orbit only (the default state — unchanged)
          const orb = t * 0.12, d = R * 2.6
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
            el.style.color = near > 0.55 ? C.accent : C.node
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
            el.style.color = near > 0.5 ? C.accent : C.bright
            el.style.transitionDuration = transitionDuration
          }
        }
        renderer.render(scene, camera)
      }
      // first loop() call now happens inside the GLTF onLoad callback above,
      // once ready — see the "ready = true" line.
    })().catch(() => { if (alive) setStatus('error') })

    return () => {
      alive = false; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); cleanupInput()
      // forceContextLoss releases the actual WebGL context (browsers cap ~16);
      // dispose() alone leaks it, so repeated mounts of the story would run out.
      try { try { renderer?.forceContextLoss() } catch {} renderer?.dispose(); if (renderer?.domElement && host.contains(renderer.domElement)) host.removeChild(renderer.domElement) } catch {}
    }
  }, [dirs])

  return (
    <div style={{ minHeight: '100vh', background: C.base, display: 'flex', flexDirection: 'column' }}>
      {/* top tab — left-aligned breadcrumb (Andromeda -> overview, current page
          in olive), consistent with the content pages' breadcrumb pattern. */}
      <header className="sticky top-0 z-50 hidden h-14 items-center justify-between gap-4 border-b border-sand-800 bg-sand-950 px-6 md:flex">
        <nav aria-label="Breadcrumb" className="min-w-0 truncate text-sm font-semibold">
          <Link href="/design-systems/andromeda" className="text-sand-400 transition-colors hover:text-sand-100">
            Andromeda
          </Link>
          <span className="mx-1 text-sand-600">/</span>
          <span className="text-olive-500">Andromeda Brain</span>
        </nav>
        <div className="flex items-center justify-end">
          <HeaderSocials />
        </div>
      </header>

      {/* 3D hero — centered, top */}
      <div style={{ position: 'relative', height: '64vh', minHeight: 420 }}>
        <div
          ref={hostRef}
          style={{ position: 'absolute', inset: 0, cursor: 'grab', touchAction: 'pan-y' }}
        />
        {/* The appearance stepper is gone: the brain has one look now, the
            gradient wireframe, so there was nothing left to step through. */}
        {/* floating labels layer */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {LABELS.map((txt, i) => (
            <div
              key={txt}
              ref={(el) => { labelEls.current[i] = el }}
              style={{ position: 'absolute', top: 0, left: 0, opacity: 0, fontFamily: MONO, fontSize: 12, letterSpacing: '0.02em', color: C.node, whiteSpace: 'nowrap', textShadow: '0 0 8px rgba(0,0,0,0.9)', willChange: 'transform,opacity', transition: 'transform 90ms linear, opacity 140ms linear' }}
            >
              {txt}
            </div>
          ))}
        </div>
        {/* hero labels layer (bigger / higher hierarchy) */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          {HERO_LABELS.map((txt, i) => (
            <div
              key={txt}
              ref={(el) => { heroEls.current[i] = el }}
              style={{ position: 'absolute', top: 0, left: 0, opacity: 0, fontFamily: SANS, fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', color: C.bright, whiteSpace: 'nowrap', textShadow: '0 0 14px rgba(0,0,0,0.95)', willChange: 'transform,opacity', transition: 'transform 90ms linear, opacity 140ms linear' }}
            >
              {txt}
            </div>
          ))}
        </div>
        {status !== 'ready' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted }}>
            {status === 'error' ? 'Scene unavailable' : loadProgress > 0 ? `Loading the brain… ${loadProgress}%` : 'Loading the brain…'}
          </div>
        )}
        {/* drag affordance: a static rotate-3d icon (olive) */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 16, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
          <Rotate3d size={26} color={C.accent} strokeWidth={1.5} />
        </div>
      </div>

      {/* ── Hero caption (centered) — homepage hero sizes: h1 text-2xl sm:text-4xl, sub text-base ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', fontFamily: SANS, padding: '28px 24px 0' }}>
        {/* Slide-in entrance, same rhythm as the homepage hero (fade + rise, staggered) */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          style={{ fontSize: 'clamp(24px,4.5vw,36px)', color: C.bright, fontWeight: 800, letterSpacing: '-0.025em', margin: 0, lineHeight: 1.1 }}
        >
          The Andromeda <span style={{ color: C.accentBtn }}>Brain</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18 }}
          style={{ fontSize: 16, color: C.node, maxWidth: 576, lineHeight: 1.625, margin: '16px 0 0', fontWeight: 400 }}
        >
          Tokens and components are the pieces. The brain is the judgment that assembles them: every foundation, component rule, skill and tool your AI agent reads, so what it builds already matches the system instead of a guess.
        </motion.p>
        {/* two CTAs, same hierarchy as the homepage hero (primary olive + outline). Premium
            branch: the gate routes premium users to the brain viewer when this becomes the real page. */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.26 }}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 24 }}
        >
          <Link href={ctaHref} className={buttonClasses({ variant: 'primary', size: 'lg' })}>
            {ctaLabel}
            <ArrowRight weight="regular" size={14} />
          </Link>
          <Link href="/design-systems/andromeda" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
            Explore Andromeda
          </Link>
        </motion.div>
      </div>

      {/* 3-icon wire divider directly below the hero */}
      <WireDivider />

      {/* ── Editorial sections (left-aligned, framed panels). max-w-4xl (896) + sm:px-6, matches the homepage content column. ── */}
      <div style={{ width: '100%', maxWidth: 896, margin: '0 auto', padding: '8px 24px 8px', fontFamily: SANS }}>

        {/* Why it exists — the system is built to grow */}
        <Section>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, margin: 0 }}>Why it exists</p>
          <h2 style={{ fontSize: 20, color: C.bright, fontWeight: 700, letterSpacing: '-0.01em', margin: '6px 0 0' }}>
            Built to grow, not to freeze
          </h2>
          <style>{`
            .why-bento {
              display: grid;
              grid-template-columns: repeat(24, minmax(0, 1fr));
              grid-template-areas:
                "grow grow grow grow grow grow grow grow grow grow beyond beyond beyond beyond beyond beyond beyond beyond beyond beyond beyond beyond beyond beyond"
                "grow grow grow grow grow grow grow grow grow grow experiment experiment experiment experiment experiment experiment experiment trust trust trust trust trust trust trust";
              gap: 14px;
              margin-top: 24px;
            }
            .why-bento-grow { grid-area: grow; }
            .why-bento-beyond { grid-area: beyond; }
            .why-bento-experiment { grid-area: experiment; }
            .why-bento-trust { grid-area: trust; }
            @media (max-width: 720px) {
              .why-bento {
                grid-template-columns: 1fr;
                grid-template-areas: none;
              }
              .why-bento-grow,
              .why-bento-beyond,
              .why-bento-experiment,
              .why-bento-trust { grid-area: auto; }
            }
          `}</style>

          <div className="why-bento">
            <div className="why-bento-grow" style={{ ...PANEL, minHeight: 236, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accentBtn }}>01 · Built to evolve</span>
              <div style={{ marginTop: 40 }}>
                <p style={{ fontSize: 'clamp(24px,3.5vw,34px)', color: C.bright, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08, margin: 0 }}>
                  A system that grows with the work.
                </p>
                <p style={{ fontSize: 14, color: C.node, lineHeight: 1.625, margin: '16px 0 0' }}>
                  Most design systems hand you a fixed kit and stop. The brain is built the other way: to grow, not freeze.
                </p>
              </div>
            </div>

            <div className="why-bento-beyond" style={{ ...PANEL_SOLID }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accentBtn }}>02 · Go beyond</span>
              <h3 style={{ fontSize: 18, color: C.bright, fontWeight: 700, letterSpacing: '-0.01em', margin: '16px 0 0' }}>Past the screens that already exist</h3>
              <p style={{ fontSize: 14, color: C.node, lineHeight: 1.625, margin: '10px 0 0' }}>
                Because the rules are written down, your agent can create new work that is still unmistakably Andromeda.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
                <Chip>Compose layouts</Chip>
                <Chip>Extend patterns</Chip>
                <Chip>Explore components</Chip>
              </div>
            </div>

            <div className="why-bento-experiment" style={{ ...PANEL_SOLID, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accentBtn }}>03 · Experiment fast</span>
              <p style={{ fontSize: 20, color: C.bright, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25, margin: 0 }}>
                Try an idea.<br />Push it further.
              </p>
            </div>

            <div className="why-bento-trust" style={{ ...PANEL_SOLID, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accentBtn }}>Built on the rules</span>
              <p style={{ fontSize: 14, color: C.reason, lineHeight: 1.625, margin: '24px 0 0' }}>
                Trust that what comes back belongs to the system because it was built against the same rules.
              </p>
            </div>
          </div>
        </Section>

        {/* Classic vs AI-native — the workflow contrast */}
        <Section className="mt-16 sm:mt-24">
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, margin: 0 }}>The difference</p>
          <h2 style={{ fontSize: 20, color: C.bright, fontWeight: 700, letterSpacing: '-0.01em', margin: '6px 0 0' }}>
            Where the classic workflow leaks
          </h2>
          <p style={{ ...SECTION_DESC, margin: '12px 0 24px' }}>
            The classic workflow loses time and intent at every step from Figma to production. When the system is already code and tokens, those steps disappear.
          </p>

          <style>{`
            .cmp-grid { display: grid; grid-template-columns: 1fr 1fr; }
            .cmp-cell { padding: 14px 18px; display: flex; gap: 10px; align-items: flex-start; }
            @media (max-width: 600px) {
              .cmp-grid { grid-template-columns: 1fr; }
              .cmp-left { border-right: none !important; }
            }
          `}</style>
          <div style={{ border: '1px solid #2D2D2E', borderRadius: 16, overflow: 'hidden' }}>
            <div className="cmp-grid">
              <div className="cmp-cell cmp-left" style={{ borderRight: '1px solid #2D2D2E', borderBottom: '1px solid #2D2D2E', fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.muted }}>
                Classic design system
              </div>
              <div className="cmp-cell" style={{ borderBottom: '1px solid #2D2D2E', background: 'rgba(168,185,77,0.05)', fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.accentBtn }}>
                AI-native design system
              </div>
            </div>
            {COMPARE.map((row, i) => (
              <div key={i} className="cmp-grid">
                <div className="cmp-cell cmp-left" style={{ borderRight: '1px solid #2D2D2E', borderTop: i === 0 ? 'none' : '1px solid #2D2D2E' }}>
                  <XIcon weight="regular" size={15} color={C.muted} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 14, color: C.node, lineHeight: 1.5 }}>{row.classic}</span>
                </div>
                <div className="cmp-cell" style={{ borderTop: i === 0 ? 'none' : '1px solid #2D2D2E', background: 'rgba(168,185,77,0.05)' }}>
                  <Check weight="regular" size={15} color={C.accentBtn} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 14, color: C.bright, lineHeight: 1.5 }}>{row.native}</span>
                </div>
              </div>
            ))}
          </div>
          {/* A typed asterisk rather than a 16px icon: it reads as a footnote
              marker on the sentence, which is what it is. */}
          <div style={{ marginTop: 20, border: '1px solid #2D2D2E', borderRadius: 16, padding: '16px 24px', background: 'rgba(168,185,77,0.05)' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.accentBtn, lineHeight: 1.5, margin: 0 }}>
              <span style={{ marginRight: 6 }}>*</span>
              The agent builds fast and accurate. You stay in the loop, and you decide what ships.
            </p>
          </div>
        </Section>

        {/* What it is */}
        <Section className="mt-16 sm:mt-24">
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, margin: 0 }}>The design brain</p>
          <h2 style={{ fontSize: 20, color: C.bright, fontWeight: 700, letterSpacing: '-0.01em', margin: '6px 0 0' }}>
            The taste lives in the system, not the prompt
          </h2>
          {/* Kicker, headline, diagram. No paragraph: the picture is the
              explanation, and prose above it only said the same thing first. */}

          <BrainFlow />
        </Section>

        {/* Browse the corpus — rail plus locked file names */}
        <Section className="mt-16 sm:mt-24">
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, margin: 0 }}>The corpus</p>
          <h2 style={{ fontSize: 20, color: C.bright, fontWeight: 700, letterSpacing: '-0.01em', margin: '6px 0 0' }}>
            <span style={{ color: C.accentBtn }}>{BRAIN_TEASER.totalFiles} files</span> the agent reads before it writes a line.
          </h2>
          <p style={{ ...SECTION_DESC }}>
            Not documentation for you. Rules for the machine: when a color is allowed to carry meaning, how far a panel may breathe, what every state owes the user. The names are open. The judgment inside them ships with Premium.
          </p>

          <CorpusExplorer />
        </Section>

        {/* How it works */}
        <Section className="mt-16 sm:mt-24">
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, margin: 0 }}>How it works</p>
          <h2 style={{ fontSize: 20, color: C.bright, fontWeight: 700, letterSpacing: '-0.01em', margin: '6px 0 0' }}>
            Your agent reads it, not you
          </h2>
          <p style={{ ...SECTION_DESC }}>
            Nobody has to learn the system or keep it in their head. The agent opens the files the task needs, and builds against them.
          </p>
          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
            {BENEFITS.map((benefit, i) => (
              <BenefitCard key={benefit.label} benefit={benefit} delay={0.1 + i * 0.08} />
            ))}
          </div>
        </Section>

        {/* Closing CTA — the homepage's final-CTA panel, class for class, so the
            two pages close the same way. The primary button stays premium-aware:
            a subscriber gets the reader, everyone else gets pricing. */}
        <Section className="mt-16 sm:mt-24" style={{ marginBottom: 8 }}>
          <div className="relative overflow-hidden rounded-2xl border border-olive-500/20 bg-gradient-to-br from-olive-500/8 via-transparent to-transparent p-8 text-center ring-1 ring-inset ring-olive-500/10">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-64 rounded-full bg-olive-500/10 blur-3xl" />
            </div>
            <p className="relative text-xs font-semibold uppercase tracking-wider text-sand-600">
              How to get it
            </p>
            <h2 className="relative mt-2 text-xl font-bold text-sand-50">
              Andromeda components are free for everyone.
            </h2>
            <p className="relative mt-2 text-base text-sand-500">
              The brain is the premium layer: one install puts all {BRAIN_TEASER.totalFiles} files in your project, and the web reader keeps every rule a click away while you work.
            </p>
            <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href={ctaHref} className={buttonClasses({ variant: 'primary', size: 'lg' })}>
                {ctaLabel}
                <ArrowRight weight="regular" size={14} />
              </Link>
              <Link href="/design-systems/andromeda" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
                Explore Andromeda
              </Link>
            </div>
          </div>
        </Section>
      </div>

      {/* footer, consistent with the content pages */}
      <div style={{ width: '100%', maxWidth: 896, margin: '0 auto', padding: '0 24px 24px', fontFamily: SANS }}>
        <SiteFooter />
      </div>
    </div>
  )
}
