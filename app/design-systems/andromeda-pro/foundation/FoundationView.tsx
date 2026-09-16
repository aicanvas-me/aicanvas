'use client'

// Foundation — the WHAT of the Andromeda token system, on site chrome
// (sand/olive, Manrope), same editorial rhythm as the components gallery.
// Swatches and bars are plain painted divs showing the primitive VALUES, which
// is what this page is for. The one Andromeda component is the Badge inside
// the shared layer cards.
//
// Client component for one reason: `tokens` comes through the injected-v2
// shim, whose modules carry 'use client' — the same pattern the component
// demos use. Everything here renders statically all the same.
import { useRef } from 'react'
import { SiteFooter } from '../../../components/SiteFooter'
import { SwatchTooltip } from './SwatchTooltip'
import { LayerCards } from '../overview-b/FoundationLayers'
import { tokens } from '../../../lib/andromeda-pro.generated'
import { andromedaVars, andromedaLightVars } from '../../../lib/andromeda-pro-helpers.generated'

// ── the theme channel ───────────────────────────────────────────────────────
// Every swatch paints `var(--at-<name>, <dark value>)`. With no themed
// ancestor the fallback resolves, i.e. dark. Each specimen below sets its own
// local --at-* set on a light AND a dark wrapper (see ThemeBlock) so both
// renderings show at once — this is the system's own swap contract, not a
// second one for this page, just scoped to a div instead of documentElement.
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

// ── The family pivot ────────────────────────────────────────────────────────
// Both columns are RESOLVED from the same functions the site paints with, so
// this table cannot drift from the theme: the dark set is what a component
// renders with no wrapper, the light set is what a light ancestor overrides it
// with. The stop numbers are recovered by matching each value back against its
// ramp, so they are read, never re-typed.
const DARK_VARS = andromedaVars() as Record<string, string>
const LIGHT_VARS = andromedaLightVars() as Record<string, string>

const stripVar = (value: string) => {
  const m = /^var\([^,]+,\s*(.*)\)$/.exec(String(value))
  return m ? m[1] : String(value)
}

// ── Local light/dark wrapper ────────────────────────────────────────────────
// The page used to carry one floating dock that flipped a single --at-* set
// on documentElement (AndromedaThemeWrap); a reader had to toggle it to see
// the other theme. Now both themes render at once, so each specimen gets its
// own pair of wrappers that pin the FULL --at-* set for one theme on a plain
// div — same channel, same two helpers, just scoped locally instead of to the
// document. `themed()` calls inside keep working unchanged: they already read
// through var(--at-<name>, <dark literal>), so whichever wrapper a swatch sits
// under is the value it shows. The swatch tooltip reads a computed style, but
// only the swatch's own resolved background, which is exactly what this
// scoping produces.
const DARK_AT_VARS: Record<string, string> = Object.fromEntries(
  Object.entries(DARK_VARS)
    .filter(([, v]) => /^var\(--at-/.test(String(v)))
    .map(([name, v]) => [name.replace('--andromeda-', '--at-'), stripVar(v)]),
)

const THEME_STYLE = {
  light: LIGHT_VARS as React.CSSProperties,
  dark: DARK_AT_VARS as React.CSSProperties,
}

const THEME_ORDER = ['light', 'dark'] as const

function ThemeBlock({
  theme,
  children,
}: {
  theme: (typeof THEME_ORDER)[number]
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-sand-500">{theme}</p>
      <div style={THEME_STYLE[theme]}>{children}</div>
    </div>
  )
}

const TONES = [
  { tone: 'info', name: 'Brand', ramp: tokens.color.brand },
  { tone: 'success', name: 'Success', ramp: tokens.color.success },
  { tone: 'warning', name: 'Warning', ramp: tokens.color.warning },
  { tone: 'danger', name: 'Danger', ramp: tokens.color.danger },
] as const

const PIVOT_ROLES = [
  ['text', 'Text', 'a status word, a value, a chart label'],
  ['on-muted', 'Secondary text', 'the quieter second line beside it'],
  ['mark', 'Foreground and borders', 'icons, dots, chart lines, frames'],
  ['fill', 'Background fill', 'a rail, a filled chip, a track'],
] as const

const stopOf = (ramp: Record<string, string>, value: string) =>
  Object.entries(ramp).find(([, v]) => v === value)?.[0] ?? '-'

const PIVOT_TABLE = PIVOT_ROLES.map(([suffix, title, what]) => ({
  suffix,
  title,
  what,
  cells: TONES.map(({ tone, name, ramp }) => {
    const dark = stripVar(DARK_VARS[`--andromeda-status-${tone}-${suffix}`] ?? '')
    const light = LIGHT_VARS[`--at-status-${tone}-${suffix}`] ?? ''
    const r = ramp as unknown as Record<string, string>
    return { name, dark, light, darkStop: stopOf(r, dark), lightStop: stopOf(r, light) }
  }),
}))

const DARK_GROUND = tokens.color.neutral[100]
// The light page ground, read from the light set rather than restated.
const LIGHT_GROUND = LIGHT_VARS['--at-neutral-100'] ?? '#ffffff'

// ── Every colour, both themes ───────────────────────────────────────────────
// Enumerated from the dark var set rather than listed by hand, so a token added
// to the system appears here on its own. Only colour-bearing vars carry the
// var(--at-…, value) shape, which is exactly the set the theme can touch.
const GROUP_ORDER = [
  ['neutral', 'Neutrals', 'numbered by depth in the stack, not by lightness, so 100 is the page ground in both themes and the ladder never folds'],
  ['text', 'Text', 'the four neutral inks'],
  ['surface', 'Surfaces', 'grounds and the steps a fill climbs under the pointer'],
  ['border', 'Borders', 'the hairline ladder'],
  ['brand', 'Brand ramp', 'the primitive stops every brand role points at'],
  ['status', 'Status', 'four tones, six roles each'],
  ['action', 'Actions', 'what a control does'],
  ['focus', 'Focus', 'the ring and its glow'],
  ['selection', 'Selection', 'checked, selected, current'],
  ['chart', 'Chart ink', 'roles, not series numbers'],
  ['gradient', 'Gradients', 'composed values, swapped stop by stop'],
] as const

const ALL_COLOURS = GROUP_ORDER.map(([prefix, title, note]) => {
  const rows = Object.entries(DARK_VARS)
    .filter(([, value]) => /^var\(--at-/.test(String(value)))
    .filter(([name]) => name.startsWith(`--andromeda-${prefix}-`))
    .map(([name, value]) => {
      const dark = stripVar(value)
      const atName = name.replace('--andromeda-', '--at-')
      const light = LIGHT_VARS[atName] ?? dark
      return {
        token: name.replace('--andromeda-', ''),
        dark,
        light,
        same: dark === light,
      }
    })
  return { prefix, title, note, rows }
}).filter((g) => g.rows.length > 0)


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


// ── page ─────────────────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 mt-14 text-xl font-bold text-sand-900 dark:text-sand-50">{children}</h2>
  )
}

export function FoundationView() {
  const mainRef = useRef<HTMLElement>(null)
  return (
    <main ref={mainRef} className="mx-auto w-full max-w-4xl px-4 pt-8 pb-20 sm:px-6 sm:pt-14">
      <SwatchTooltip root={mainRef} />
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-olive-600 dark:text-olive-400">
        Andromeda Pro · Foundation
      </p>
      <h1 className="text-3xl font-extrabold text-sand-900 dark:text-sand-50 sm:text-4xl">
        The primitives
      </h1>
      <p className="mt-3 max-w-2xl text-sand-600 dark:text-sand-400">
        Every Andromeda Pro component is built from the values on this page, read through
        three layers of tokens. This page is the what. The Brain teaches when and how to use
        each value.
      </p>

      {/* ── The three layers ── */}
      <SectionHeading>Three layers</SectionHeading>
      {/* The same cards as the overview, one colour followed through all three.
          Code spans because Manrope ligates the double hyphen of a custom
          property into one dash. */}
      <LayerCards
        onPage
        captions={[
          'The neutral ladder and four hue families. A theme retunes these; a component never reads them.',
          <>
            Named roles such as <Code>status.danger.text</Code>. Every component reads this layer and only
            this one.
          </>,
          <>
            A <Code>--component-role</Code> variable in the one file that owns it, pointing at exactly one
            role. The wiring never leaves that file.
          </>,
        ]}
      />

      {/* ── Neutrals ── */}
      <SectionHeading>The neutral ladder</SectionHeading>
      <p className="mb-4 max-w-2xl text-sm text-sand-600 dark:text-sand-400">
        Thirteen grays, numbered by depth: 100 is the page ground, 1300 the strongest ink.
        Surfaces, borders and text are all roles pointing into this one ladder.
      </p>
      <div className="space-y-5">
        {THEME_ORDER.map((theme) => (
          <ThemeBlock key={theme} theme={theme}>
            <div className="overflow-hidden rounded-xl border border-sand-300 dark:border-sand-800">
              <div className="flex">
                {NEUTRALS.map((n) => (
                  <div
                    key={n.stop}
                    className="group relative h-20 flex-1"
                    data-swatch={`neutral-${n.stop}`}
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
          </ThemeBlock>
        ))}
      </div>

      {/* ── Families ── */}
      <SectionHeading>Four hue families</SectionHeading>
      <p className="mb-4 max-w-2xl text-sm text-sand-600 dark:text-sand-400">
        Five stops each, 100 through 500, plus two alphas and a guaranteed-contrast{' '}
        <Code>on</Code> ink. The ramp itself is the same in both themes; what flips is which
        stop a role points at, shown further down. Color is never the only channel: a tone
        always rides with a glyph, a position or a label.
      </p>
      <div className="space-y-6">
        {FAMILIES.map((f) => (
          <div key={f.name} className="flex items-start gap-4">
            <div className="w-24 shrink-0 pt-1">
              <p className="text-sm font-bold text-sand-900 dark:text-sand-50">{f.name}</p>
              <p className="text-[11px] leading-tight text-sand-500">{f.note}</p>
            </div>
            <div className="flex-1 space-y-3">
              {THEME_ORDER.map((theme) => (
                <ThemeBlock key={theme} theme={theme}>
                  <div className="flex h-12 overflow-hidden rounded-lg border border-sand-300 dark:border-sand-800">
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
                        data-swatch={`${f.key}-${stop}`}
                      />
                    ))}
                  </div>
                </ThemeBlock>
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

      {/* ── The family pivot ── */}
      <SectionHeading>How a family crosses the themes</SectionHeading>
      <p className="mb-4 max-w-2xl text-sm text-sand-600 dark:text-sand-400">
        When the theme flips, a role&rsquo;s stop mirrors around the middle of its family: 100
        and 500 swap, 200 and 400 swap, and 300 is the pivot. Fills stop at 200 rather than 100,
        because 100 barely stands off the light page. The one thing that overrules the
        mirror is <strong className="font-semibold text-sand-900 dark:text-sand-50">WCAG</strong>.
        Where the mirrored value misses its contrast minimum on the light page ground it steps
        toward the deep end until it clears. That is the whole reason the text row below reads
        300 &rarr; 500 rather than 300 &rarr; 400: on the light ground the 400 stop measures 3.97
        for brand, 4.21 for success and 3.12 for warning, all under the 4.5 that normal text
        requires, so they step again. Danger reaches 4.86 at 400 and stops there. The row under
        it lands on 400 everywhere because a mark is a non-text object and needs 3.0, not 4.5.
        Both columns are resolved from the same functions the site paints with, so they cannot
        drift from what you see.
      </p>
      <div className="overflow-x-auto rounded-xl border border-sand-300 dark:border-sand-800">
        <div className="min-w-[44rem]">
          <div className="grid grid-cols-[13rem_repeat(4,1fr)] gap-x-4 border-b border-sand-300 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-sand-500 dark:border-sand-800">
            <span>Role</span>
            {TONES.map((t) => (
              <span key={t.tone}>{t.name}</span>
            ))}
          </div>
          {PIVOT_TABLE.map(({ suffix, title, what, cells }, i) => (
            <div
              key={suffix}
              className={`grid grid-cols-[13rem_repeat(4,1fr)] gap-x-4 px-4 py-3 ${
                i > 0 ? 'border-t border-sand-300 dark:border-sand-800' : ''
              }`}
            >
              <div>
                <p className="text-[13px] font-semibold text-sand-900 dark:text-sand-50">{title}</p>
                <p className="text-[11px] leading-tight text-sand-500">{what}</p>
              </div>
              {cells.map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  {/* dark ground on the left, light ground on the right, same swatch size */}
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded"
                    style={{ backgroundColor: DARK_GROUND }}
                    data-swatch={`${c.name} ${suffix} · dark ${c.darkStop}`}
                    data-swatch-value={c.dark}
                  >
                    <span className="h-3.5 w-3.5 rounded-sm" style={{ backgroundColor: c.dark }} />
                  </span>
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded"
                    style={{ backgroundColor: LIGHT_GROUND }}
                    data-swatch={`${c.name} ${suffix} · light ${c.lightStop}`}
                    data-swatch-value={c.light}
                  >
                    <span className="h-3.5 w-3.5 rounded-sm" style={{ backgroundColor: c.light }} />
                  </span>
                  <span className="text-[12px] tabular-nums text-sand-500">
                    {c.darkStop} &rarr; {c.lightStop}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Every colour, both themes ── */}
      <SectionHeading>Every color, both themes</SectionHeading>
      <p className="mb-4 max-w-2xl text-sm text-sand-600 dark:text-sand-400">
        The whole set, dark on the left of each pair and light on the right. Enumerated from
        the live token set rather than listed by hand, so a color added to the system shows
        up here on its own. A pair marked <em>same</em> is deliberately theme invariant: a
        scrim darkens what is behind it whatever the theme, and a solid fill that carries pale
        text has to stay deep in both.
      </p>
      <div className="space-y-6">
        {ALL_COLOURS.map((group) => (
          <div key={group.prefix}>
            <p className="mb-1 text-[13px] font-bold text-sand-900 dark:text-sand-50">{group.title}</p>
            <p className="mb-2 text-[12px] leading-relaxed text-sand-500">{group.note}</p>
            {/* Two per row from sm up: these lists run to fourteen entries and a
                single column left most of the width empty. The first row of each
                column keeps its top border off, and the right column carries a
                divider so the pair still reads as one table. */}
            <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-sand-300 sm:grid-cols-2 dark:border-sand-800">
              {group.rows.map((r, i) => (
                <div
                  key={r.token}
                  className={`flex items-center gap-3 border-sand-300 px-4 py-2 dark:border-sand-800 ${
                    i > 0 ? 'border-t sm:[&:nth-child(2)]:border-t-0' : ''
                  } sm:[&:nth-child(even)]:border-l`}
                >
                  <code className="min-w-0 flex-1 truncate text-[12px] text-sand-700 dark:text-sand-300">
                    {r.token}
                  </code>
                  {r.same ? (
                    <span className="text-[11px] uppercase tracking-wider text-sand-500">same</span>
                  ) : null}
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
                    style={{ background: DARK_GROUND }}
                    data-swatch={`${r.token} · dark`}
                    data-swatch-value={r.dark}
                  >
                    <span className="h-3 w-3 rounded-sm" style={{ background: r.dark }} />
                  </span>
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded"
                    style={{ background: LIGHT_GROUND }}
                    data-swatch={`${r.token} · light`}
                    data-swatch-value={r.light}
                  >
                    <span className="h-3 w-3 rounded-sm" style={{ background: r.light }} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Accessibility ── */}
      <SectionHeading>Accessibility</SectionHeading>
      <p className="mb-4 max-w-2xl text-sm text-sand-600 dark:text-sand-400">
        Every color pair in this system meets WCAG 2.2 level AA, in both themes. The ratios are
        measured by a contrast script, not judged by eye, and contrast is the one thing here that
        overrules a design decision, including the family pivot above.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ['4.5 : 1', 'Normal text', 'Anything under 24px, or under 18.66px bold. Almost all of our text. WCAG 1.4.3.'],
          ['3.0 : 1', 'Large text and non-text', 'Display sizes, and every icon, border, chart line, dot and focus ring. WCAG 1.4.3 and 1.4.11.'],
          ['7.0 : 1', 'AAA, where it lands', 'Not a target for the whole system, but the primary, secondary and muted text inks clear it in both themes.'],
        ].map(([ratio, who, what]) => (
          <div key={ratio} className="rounded-xl border border-sand-300 bg-sand-100 p-4 dark:border-sand-800 dark:bg-sand-900">
            <p className="text-base font-bold tabular-nums text-sand-900 dark:text-sand-50">{ratio}</p>
            <p className="text-[13px] font-semibold text-sand-700 dark:text-sand-300">{who}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-sand-500">{what}</p>
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
        else. It carries no color either, so ink stays a separate decision.
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
                className="h-3 rounded-sm bg-sand-400 dark:bg-sand-600"
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
