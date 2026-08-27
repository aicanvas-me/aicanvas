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

const TYPE_RAMP = TYPE_ROLES.map((role) => {
  const size = (tokens.typography.size as Record<string, string>)[role]
  const lead = (tokens.typography.leading as Record<string, string>)[role]
  return [role, `${px(size)} / ${px(lead)}`] as const
})

// Layer 2 for type. Same contract as the ramp above: every value is read off
// the token, never re-typed, so a role that moves moves this page with it. The
// key is typed against the token, so deleting or renaming a role fails the
// build here instead of white-screening this page at render.
const TYPE_ROLE_SPECIMENS: ReadonlyArray<
  readonly [keyof typeof tokens.typography.role, string, string]
> = [
  // Sentence case on purpose: the uppercase you read below is the ROLE doing
  // its work, not a shouty string. It is the only property that tells `label`
  // and `meta` apart at a glance, both being 10 / 14.
  ['label', 'Bearing', 'column heads, axis and legend labels, kickers, stat captions'],
  ['meta', '04:21 · 12 units', 'unit suffixes, timestamps, counts'],
  ['body', 'The panel reads at twelve pixels.', 'running copy inside a panel'],
  ['bodyStrong', 'The selected row.', 'selected row, emphasised term, active tab'],
  ['panelTitle', 'Reactor core', 'the title of one panel'],
  ['sectionTitle', 'Mission control', 'the title of a region holding several panels'],
]

const nameOf = (scale: Record<string, string | number>, value: string | number) =>
  Object.entries(scale).find(([, v]) => v === value)?.[0] ?? String(value)

const TYPE_ROLES_TABLE = TYPE_ROLE_SPECIMENS.map(([key, specimen, use]) => {
  const style = tokens.typography.role[key]
  const recipe = [
    `${px(style.fontSize)} / ${px(style.lineHeight)}`,
    nameOf(tokens.typography.weight, style.fontWeight),
    nameOf(tokens.typography.tracking, style.letterSpacing),
    'textTransform' in style && style.textTransform === 'uppercase' ? 'uppercase' : null,
  ]
    .filter(Boolean)
    .join(' · ')
  return { key, specimen, use, style, recipe }
})

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
        A role names a size AND its leading, so adopting one means taking both. Text roles
        for UI and reading, display roles for hero numerals and headings.
      </p>
      <div className="overflow-hidden rounded-xl border border-sand-300 dark:border-sand-800">
        <div className="grid grid-cols-2 gap-x-4 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-sand-500 sm:grid-cols-4">
          <span>Role</span>
          <span>size / leading</span>
          <span className="hidden sm:block">Role</span>
          <span className="hidden sm:block">size / leading</span>
        </div>
        <div className="grid grid-cols-1 border-t border-sand-300 dark:border-sand-800 sm:grid-cols-2">
          {TYPE_RAMP.map(([role, pair], i) => (
            <div
              key={role}
              className={`flex items-baseline justify-between px-4 py-2 ${
                i > 0 ? 'border-t border-sand-300 dark:border-sand-800 sm:[&:nth-child(2)]:border-t-0' : ''
              }`}
            >
              <code className="text-[13px] font-semibold text-sand-900 dark:text-sand-50">{role}</code>
              <span className="text-[13px] tabular-nums text-sand-600 dark:text-sand-400">{pair}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Type roles ── */}
      <SectionHeading>Type roles</SectionHeading>
      <p className="mb-4 max-w-2xl text-sm text-sand-600 dark:text-sand-400">
        The ramp above is ingredients. A role is the finished dish: family, size, leading,
        weight, tracking and case as one object, named for what the text <em>is</em>. A
        component spreads a role and overrides at most one property. Roles carry no colour,
        so ink stays a separate decision.
      </p>
      <div className="overflow-hidden rounded-xl border border-sand-300 dark:border-sand-800">
        {TYPE_ROLES_TABLE.map(({ key, specimen, use, style, recipe }, i) => (
          <div
            key={key}
            className={`px-4 py-4 ${i > 0 ? 'border-t border-sand-300 dark:border-sand-800' : ''}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <code className="text-[13px] font-semibold text-sand-900 dark:text-sand-50">
                role.{key}
              </code>
              <span className="text-[12px] tabular-nums text-sand-500">{recipe}</span>
            </div>
            <p
              className="mt-2 text-sand-900 dark:text-sand-50"
              style={style as React.CSSProperties}
            >
              {specimen}
            </p>
            <p className="mt-1.5 text-[12px] text-sand-500">{use}</p>
          </div>
        ))}
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
