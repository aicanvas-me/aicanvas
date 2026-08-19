'use client'

// Foundation — the WHAT of the Andromeda token system, on site chrome
// (sand/olive, Manrope), same editorial rhythm as the components gallery. No
// Andromeda component renders here: swatches and bars are plain painted divs
// showing the primitive VALUES, which is exactly what this page is for.
//
// Client component for one reason: `tokens` comes through the injected-v2
// shim, whose modules carry 'use client' — the same pattern the component
// demos use. Everything here renders statically all the same.
import { tokens } from '../../../lib/andromeda-v2.generated'

// ── data pulled once from tokens.ts ─────────────────────────────────────────

const NEUTRALS = Array.from({ length: 13 }, (_, i) => ({
  stop: i,
  value: (tokens.color.neutral as Record<number, string>)[i],
}))

const FAMILIES = [
  { name: 'Brand', note: 'the live series, the primary action', ramp: tokens.color.brand },
  { name: 'Success', note: 'this moved the good way', ramp: tokens.color.success },
  { name: 'Warning', note: 'caution, degraded, restricted', ramp: tokens.color.warning },
  { name: 'Danger', note: 'loss, fault, threshold breach', ramp: tokens.color.danger },
] as const

const FAMILY_STOPS = [100, 200, 300, 400, 500] as const

const TYPE_RAMP = [
  ['textXs', '10 / 14'],
  ['textSm', '12 / 18'],
  ['textMd', '14 / 20'],
  ['textLg', '16 / 24'],
  ['textXl', '18 / 28'],
  ['text2xl', '20 / 30'],
  ['displayXs', '24 / 32'],
  ['displaySm', '30 / 38'],
  ['displayMd', '36 / 44'],
  ['displayLg', '48 / 60'],
  ['displayXl', '60 / 72'],
  ['display2xl', '72 / 90'],
] as const

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

const LAYERS = [
  {
    n: '1',
    title: 'Primitives',
    body:
      'The neutral ladder and four hue families. A theme author retunes these; a component never reads them. The neutrals are numbered by depth in the stack, not by lightness — 0 is the page ground and 12 the strongest ink — so the numbering keeps its meaning when the ground inverts.',
  },
  {
    n: '2',
    title: 'Semantic',
    body:
      'The sentence a screen author says: status.danger.text, surface.raised, focus.ring. Every component reads this layer and only this layer. A semantic token exists only where two good authors would genuinely differ — where a ladder rule already decides, the rule teaches and no token is minted.',
  },
  {
    n: '3',
    title: 'Component wires',
    body:
      'A --component-role custom property inside the one file that owns it, pointing at exactly one semantic token. It exists only where the element that knows the variant is not the element that paints the colour, so the wiring never leaves the file you are reading.',
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
        Thirteen greys, numbered by depth: 0 is the page ground, 12 the strongest ink.
        Surfaces, borders and text are all roles pointing into this one ladder.
      </p>
      <div className="overflow-hidden rounded-xl border border-sand-300 dark:border-sand-800">
        <div className="flex">
          {NEUTRALS.map((n) => (
            <div key={n.stop} className="group relative h-20 flex-1" style={{ backgroundColor: n.value }}>
              <span
                className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-semibold"
                style={{ color: n.stop < 7 ? NEUTRALS[12].value : NEUTRALS[0].value }}
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
        Five stops each, 100 light to 500 deep, plus two alphas and a guaranteed-contrast
        `on` ink. Colour is never the only channel: a tone always rides with a glyph,
        a position, or a label.
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
                  style={{ backgroundColor: (f.ramp as Record<number, string>)[stop] }}
                  title={`${f.name.toLowerCase()}.${stop}`}
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
        A role names a size AND its leading — adopting one means taking both. Text roles
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
    </main>
  )
}
