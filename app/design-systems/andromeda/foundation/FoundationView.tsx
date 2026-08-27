'use client'

// Foundation — the WHAT of the Andromeda token system, on site chrome
// (sand/olive, Manrope), same editorial rhythm as the components gallery. No
// Andromeda component renders here: swatches and bars are plain painted divs
// showing the primitive VALUES, which is exactly what this page is for.
//
// Client component for one reason: `tokens` comes through the injected-v2
// shim, whose modules carry 'use client' — the same pattern the component
// demos use. Everything here renders statically all the same.
import { SiteFooter } from '../../../components/SiteFooter'
import { tokens } from '../../../lib/andromeda-v2.generated'
import { AndromedaThemeDock } from '../AndromedaThemeWrap'

// ── the theme channel ───────────────────────────────────────────────────────
// Every swatch paints `var(--at-<name>, <dark value>)`. With no light ancestor
// the fallback resolves and the page is pixel-identical to before; the wrap in
// page.tsx defines the --at-* set and the same swatch shows the light value.
// This is the system's own swap contract, not a second one for this page.
const themed = (name: string, value: string) => `var(--at-${name}, ${value})`

// ── data pulled once from tokens.ts ─────────────────────────────────────────

// The ladder is numbered by DEPTH on a 100 grid: 100 is the page ground, 1300
// the strongest ink. (It used to read 0-12 here, which matched no token — the
// thirteen swatches painted nothing at all.)
const NEUTRAL_STOPS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300] as const

const NEUTRALS = NEUTRAL_STOPS.map((stop) => ({
  stop,
  value: (tokens.color.neutral as Record<number, string>)[stop],
}))

// The ink a stop's own label needs. Depth numbering is the role map in both
// themes, so one rule holds for both: the ground-side stops take the deepest
// ink, the ink-side stops take the ground.
const INK = tokens.color.neutral[1300]
const GROUND = tokens.color.neutral[100]
const labelInk = (stop: number) =>
  stop < 1000 ? themed('neutral-1300', INK) : themed('neutral-100', GROUND)

const FAMILIES = [
  { name: 'Brand', key: 'brand', note: 'the live series, the primary action', ramp: tokens.color.brand },
  { name: 'Success', key: 'success', note: 'this moved the good way', ramp: tokens.color.success },
  { name: 'Warning', key: 'warning', note: 'caution, degraded, restricted', ramp: tokens.color.warning },
  { name: 'Danger', key: 'danger', note: 'loss, fault, threshold breach', ramp: tokens.color.danger },
] as const

const FAMILY_STOPS = [100, 200, 300, 400, 500] as const

// Read off the tokens, never re-typed: a hand-copied ramp is a page that
// starts lying the first time a size moves.
const TYPE_ROLES = [
  'textXs', 'textSm', 'textMd', 'textLg', 'textXl', 'text2xl',
  'displayXs', 'displaySm', 'displayMd', 'displayLg', 'displayXl', 'display2xl',
] as const

const px = (value: string) => value.replace('px', '')

// px to rem at the browser default root, the way Untitled UI states both on
// every row of its own scale. The token stays the source; rem is derived here
// so a size that moves cannot leave a stale rem behind.
const rem = (value: string) => `${+(parseFloat(value) / 16).toFixed(4)}rem`

// Tracking is authored in em. The percent is the same number read the way type
// tools state it, which is how Untitled UI writes its display rows as -2%.
const pct = (value: string) => {
  const n = parseFloat(value)
  return n === 0 ? '0' : `${+(n * 100).toFixed(2)}%`
}

const TYPE_RAMP = TYPE_ROLES.map((step) => {
  const size = (tokens.typography.size as Record<string, string>)[step]
  const lead = (tokens.typography.leading as Record<string, string>)[step]
  const track = (tokens.typography.tracking as Record<string, string>)[step]
  return {
    step,
    size,
    lead,
    track,
    sizeText: `${size} / ${rem(size)}`,
    leadText: `${lead} / ${rem(lead)}`,
    trackText: parseFloat(track) === 0 ? '0' : `${track} / ${pct(track)}`,
  }
})

// The one named style. Everything else in the system is a step plus a weight,
// read straight off the ramp above; `label` exists only because it carries a
// property the ramp deliberately does not, which is case. Read off the token,
// never re-typed, and typed against it so removing the style fails the build
// here instead of white-screening this page.
const LABEL = tokens.typography.role.label

const nameOf = (scale: Record<string, string | number>, value: string | number) =>
  Object.entries(scale).find(([, v]) => v === value)?.[0] ?? String(value)

const LABEL_RECIPE = [
  `${px(LABEL.fontSize)} / ${px(LABEL.lineHeight)}`,
  nameOf(tokens.typography.weight, LABEL.fontWeight),
  nameOf(tokens.typography.tracking, LABEL.letterSpacing),
  'uppercase',
].join(' · ')

const SPACING_STEPS = [1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12] as const

const SEMANTIC_GROUPS = [
  ['text', 'the four inks: primary, secondary, muted, faint'],
  ['surface', 'the grounds and the interaction steps a fill climbs'],
  ['border', 'the hairline ladder, subtle to strong, plus the floating frame'],
  ['status', 'four tones × six roles: surface, border, text, on, onMuted, fill'],
  ['action', 'what a control does: primary, secondary, danger, and their states'],
  ['focus', 'the ring, the glow, and their invalid forms'],
  ['selection', 'the mark, the track, the selected edge'],
  ['chart', 'baseline, live, context, threshold, grid, and the stacked ramp'],
] as const

// Ligatures off: this is a literal identifier, and Manrope would fuse the two
// hyphens that make it a custom property into one dash.
function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-semibold text-sand-900 [font-variant-ligatures:none] dark:text-sand-50">
      {children}
    </code>
  )
}

// Bodies are JSX, not strings, so a CSS custom property can be a code span.
// Manrope ligates a double hyphen into one long dash, which turned
// `--component-role` into a property name that does not exist.
const LAYERS = [
  {
    n: '1',
    title: 'Primitives',
    body: (
      <>
        The neutral ladder and four hue families. A theme author retunes these; a component
        never reads them. The neutrals are numbered by depth in the stack, not by lightness:
        100 is the page ground and 1300 the strongest ink, so the numbering keeps its meaning
        when the ground inverts.
      </>
    ),
  },
  {
    n: '2',
    title: 'Semantic',
    body: (
      <>
        The sentence a screen author says: status.danger.text, surface.raised, focus.ring.
        Every component reads this layer and only this layer. A semantic token exists only
        where two good authors would genuinely differ. Where a ladder rule already decides,
        the rule teaches and no token is minted.
      </>
    ),
  },
  {
    n: '3',
    title: 'Component wires',
    body: (
      <>
        A <Code>--component-role</Code> custom property inside the one file that owns it,
        pointing at exactly one semantic token. It exists only where the element that knows
        the variant is not the element that paints the colour, so the wiring never leaves the
        file you are reading.
      </>
    ),
  },
] as const

// ── page ─────────────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 mt-14 text-xl font-bold text-sand-900 dark:text-sand-50">{children}</h2>
  )
}

export function FoundationView() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 pt-8 pb-20 sm:px-6 sm:pt-14">
      <AndromedaThemeDock />
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-olive-600 dark:text-olive-400">
        Andromeda · Foundation
      </p>
      <h1 className="text-3xl font-extrabold text-sand-900 dark:text-sand-50 sm:text-4xl">
        The primitives
      </h1>
      <p className="mt-3 max-w-2xl text-sand-600 dark:text-sand-400">
        Every Andromeda component is built from the values on this page, read through a
        three-layer token architecture. This is the what; the judgment layer that teaches
        when and how to use each value ships with the Brain.
      </p>

      {/* ── The three layers ── */}
      <SectionHeading>Three layers</SectionHeading>
      <div className="grid gap-4 sm:grid-cols-3">
        {LAYERS.map((l) => (
          <div
            key={l.n}
            className="rounded-xl border border-sand-300 bg-sand-100 p-4 dark:border-sand-800 dark:bg-sand-900"
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-sand-500">
              Layer {l.n}
            </p>
            <h3 className="mb-2 text-sm font-bold text-sand-900 dark:text-sand-50">{l.title}</h3>
            <p className="text-[13px] leading-relaxed text-sand-600 dark:text-sand-400">{l.body}</p>
          </div>
        ))}
      </div>

      {/* ── Neutrals ── */}
      <SectionHeading>The neutral ladder</SectionHeading>
      <p className="mb-4 max-w-2xl text-sm text-sand-600 dark:text-sand-400">
        Thirteen greys, numbered by depth: 100 is the page ground, 1300 the strongest ink.
        Surfaces, borders and text are all roles pointing into this one ladder.
      </p>
      <div className="overflow-hidden rounded-xl border border-sand-300 dark:border-sand-800">
        <div className="flex">
          {NEUTRALS.map((n) => (
            <div
              key={n.stop}
              className="group relative h-20 flex-1"
              style={{ backgroundColor: themed(`neutral-${n.stop}`, n.value) }}
            >
              <span
                className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-semibold"
                style={{ color: labelInk(n.stop) }}
              >
                {n.stop}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Families ── */}
      <SectionHeading>Four hue families</SectionHeading>
      <p className="mb-4 max-w-2xl text-sm text-sand-600 dark:text-sand-400">
        Five stops each, 100 through 500, plus two alphas and a guaranteed-contrast{' '}
        <Code>on</Code> ink. Which end of the ramp reads light flips with the theme. Colour is
        never the only channel: a tone always rides with a glyph, a position, or a label.
      </p>
      <div className="space-y-3">
        {FAMILIES.map((f) => (
          <div key={f.name} className="flex items-center gap-4">
            <div className="w-24 shrink-0">
              <p className="text-sm font-bold text-sand-900 dark:text-sand-50">{f.name}</p>
              <p className="text-[11px] leading-tight text-sand-500">{f.note}</p>
            </div>
            <div className="flex h-12 flex-1 overflow-hidden rounded-lg border border-sand-300 dark:border-sand-800">
              {FAMILY_STOPS.map((stop) => (
                <div
                  key={stop}
                  className="flex-1"
                  style={{
                    backgroundColor: themed(
                      `${f.key}-${stop}`,
                      (f.ramp as Record<number, string>)[stop],
                    ),
                  }}
                  title={`${f.key}.${stop}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Semantic naming ── */}
      <SectionHeading>Semantic roles</SectionHeading>
      <p className="mb-4 max-w-2xl text-sm text-sand-600 dark:text-sand-400">
        Components never read a primitive. They say what they mean, in eight role groups:
      </p>
      <div className="overflow-hidden rounded-xl border border-sand-300 dark:border-sand-800">
        {SEMANTIC_GROUPS.map(([name, what], i) => (
          <div
            key={name}
            className={`flex items-baseline gap-4 px-4 py-2.5 ${
              i > 0 ? 'border-t border-sand-300 dark:border-sand-800' : ''
            }`}
          >
            <code className="w-24 shrink-0 text-[13px] font-semibold text-sand-900 dark:text-sand-50">
              {name}
            </code>
            <span className="text-[13px] text-sand-600 dark:text-sand-400">{what}</span>
          </div>
        ))}
      </div>

      {/* ── Typography ── */}
      <SectionHeading>The type ramp</SectionHeading>
      <p className="mb-4 max-w-2xl text-sm text-sand-600 dark:text-sand-400">
        A step names three values, not one: a size, its leading, and its tracking. Taking a
        step means taking all three. Tracking is a function of size here, open at the small
        end where letterforms crowd and pulled in at the display end where large type sets
        loose. Weight is the second axis and stays a component&rsquo;s choice.
      </p>
      {/* The specimen is the point, so it gets the flexible column and the
          numbers are pinned right. Wide on purpose: the row scrolls inside its
          own container rather than squeezing the display steps. */}
      <div className="overflow-x-auto rounded-xl border border-sand-300 dark:border-sand-800">
        <div className="min-w-[46rem]">
          <div className="grid grid-cols-[7rem_1fr_9rem_9rem_8rem] gap-x-6 border-b border-sand-300 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-sand-500 dark:border-sand-800">
            <span>Step</span>
            <span>Specimen</span>
            <span className="text-right">Size</span>
            <span className="text-right">Line height</span>
            <span className="text-right">Tracking</span>
          </div>
          {TYPE_RAMP.map(({ step, size, lead, track, sizeText, leadText, trackText }, i) => (
            <div
              key={step}
              className={`grid grid-cols-[7rem_1fr_9rem_9rem_8rem] items-center gap-x-6 px-4 py-3 ${
                i > 0 ? 'border-t border-sand-300 dark:border-sand-800' : ''
              }`}
            >
              <code className="text-[13px] font-semibold text-sand-900 dark:text-sand-50">{step}</code>
              <span
                className="overflow-hidden whitespace-nowrap text-sand-900 dark:text-sand-50"
                style={{ fontSize: size, lineHeight: lead, letterSpacing: track }}
              >
                Aa
              </span>
              <span className="text-right text-[12px] tabular-nums text-sand-600 dark:text-sand-400">{sizeText}</span>
              <span className="text-right text-[12px] tabular-nums text-sand-600 dark:text-sand-400">{leadText}</span>
              <span className="text-right text-[12px] tabular-nums text-sand-500">{trackText}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── The one named style ── */}
      <SectionHeading>The one named style</SectionHeading>
      <p className="mb-4 max-w-2xl text-sm text-sand-600 dark:text-sand-400">
        Everything in the system is a step plus a weight. There is exactly one exception,
        because it carries something the ramp deliberately does not: case. Uppercase is a
        decision a component makes, not a property of a size, so it lives here and nowhere
        else. It carries no colour either, so ink stays a separate decision.
      </p>
      <div className="rounded-xl border border-sand-300 px-4 py-4 dark:border-sand-800">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <code className="text-[13px] font-semibold text-sand-900 dark:text-sand-50">
            typography.role.label
          </code>
          <span className="text-[12px] tabular-nums text-sand-500">{LABEL_RECIPE}</span>
        </div>
        {/* Sentence case on purpose: the uppercase you read is the style doing its work. */}
        <p className="mt-2 text-sand-900 dark:text-sand-50" style={LABEL as React.CSSProperties}>
          Bearing
        </p>
        <p className="mt-1.5 text-[12px] text-sand-500">
          column heads, axis and legend labels, kickers, stat captions
        </p>
      </div>

      {/* ── Spacing ── */}
      <SectionHeading>Spacing</SectionHeading>
      <p className="mb-4 max-w-2xl text-sm text-sand-600 dark:text-sand-400">
        A 4px grid with one half-step. Control heights ride their own three-rung ladder
        (28 / 32 / 40) so fields, buttons and toggles in a row always agree.
      </p>
      <div className="space-y-2">
        {SPACING_STEPS.map((step) => {
          const value = (tokens.spacing as Record<number, string>)[step]
          return (
            <div key={step} className="flex items-center gap-4">
              <code className="w-10 shrink-0 text-right text-[13px] font-semibold text-sand-900 dark:text-sand-50">
                {step}
              </code>
              <div
                className="h-3 rounded-sm bg-olive-500 dark:bg-olive-400"
                style={{ width: `calc(${value} * 4)` }}
              />
              <span className="text-[12px] tabular-nums text-sand-500">{value}</span>
            </div>
          )
        })}
      </div>

      <SiteFooter />
    </main>
  )
}
