// @ts-nocheck — renders JSX design-system components whose forwardRef wrappers
// carry no TypeScript prop types. The coverage test is the enforcement.
//
// ONE renderer, every surface. A declaration (MatrixSpec) goes in, DOM comes
// out; no consuming page carries component content of its own, which is what
// makes a repeat of today's showcase-vs-component-page drift structurally
// impossible rather than merely discouraged.
'use client'

import { tokens } from '../../../lib/andromeda-pro.generated'
import { matrixId, REST, type MatrixCase, type MatrixSpec } from './types'

// The card chrome is styled from tokens in JS, so nothing above it writes the
// --andromeda-* custom properties: a bare var() here resolves to nothing and the
// rule silently does nothing. The literal is the value; the var stays in front
// of it so a runtime-themed page (the Studio overrides these vars) still wins.
//
// Neutral, not accent: accent is a MEASUREMENT in this system, and a jumped-to
// card is a place, not a reading. Lightest neutral, 2px, matching the sibling
// system's ink ring — a 1px border step was too quiet to find on a long page.
const TARGET_INK = `var(--andromeda-text-primary, var(--at-text-primary, ${tokens.color.text.primary}))`

// Documentation chrome, NOT an Andromeda surface: the system's own radius scale
// stops at 3px because square corners are its identity, and every card here is
// a page box around a component rather than a component. Rounding these is a
// maintainer call, taken 2026-08-09; the components inside them are untouched
// and still square.
const CARD_RADIUS = '12px'

// Documentation chrome runs on the SITE face (Manrope), not the system's mono,
// on the same reasoning that already rounded these cards: a caption over a case
// is the page telling you what you are looking at, not an Andromeda surface.
// Mono made the captions read as part of the component. The components inside
// are untouched and still spend the system's own type. Maintainer call,
// 2026-08-28; applies to all three chrome sites (caption, card label, section
// heading).
const head = {
  fontFamily: tokens.typography.fontSans,
  fontSize: tokens.typography.size.sm,
  color: `var(--at-text-faint, ${tokens.color.text.faint})`,
  textTransform: 'uppercase' as const,
  letterSpacing: tokens.typography.tracking.widest,
}

// The RESERVE rules, shared by every surface that mounts a live component:
// the matrix grid and the solo hero frame. They live here as one constant
// because a second copy would drift, and the drift would be invisible until
// a panel hung outside a frame on one surface and fit on the other.
//
// Every rule below keys off what the PANEL stamps on itself (its role, its
// resolved placement), never off a component name, which is why no component
// needs a rule of its own and why the set generalises to all 49.
const BODY_RESERVE_CSS = `
        /* A HOVER/FOCUS overlay reserves its room PERMANENTLY, which is the
           whole difference from the three rules below, and why it comes FIRST:
           all four are (0,2,0) with !important, so source ORDER is what settles
           a body matching two of them, and the LARGER reserve has to win. A
           card holding a tooltip and a menu keeps the menu's 155. (The upward
           rule's unconditional bottom reset still takes a bottom tooltip's 33
           with it, the same one-sidedness its own comment flags.)

           Tooltip's bubble mounts on mouseenter OR focus, so a reserve keyed
           off the mounted [role="tooltip"] would appear under the pointer and
           the card would grow out from under it: a pointer in the top 9px of a
           30px trigger gets mouseleave, unmount, shrink, mouseenter, and the
           card oscillates. PERMANENCE is what stops that, not symmetry, so the
           room stays one-sided like every other reserve here. The direction
           comes from the WRAPPER, which Tooltip stamps at rest (its bubble
           cannot be asked, it does not exist yet) — so anything that wraps a
           child in Tooltip is served without touching this selector,
           DataTable's mobile info bubble included.

           TOOLTIP 33 = 25 + 8, the same shape as the sums below — bubble plus
           its spacing[2] 8px offset from the trigger:
             bubble = 2 x 1px border + 2 x spacing[1] 4 padding
                      + size.xs 10 x 1.5 line box                     = 25
           It REPLACES the body's spacing[6] 24px floor rather than dwarfing
           it, so a top or bottom card grows by exactly 9px.

           LEFT and RIGHT get nothing, on either axis. Vertically the bubble is
           centred on the trigger and 25 is inside the 30px control.md square,
           so it never reaches the body's padding. Horizontally it hangs off the
           trigger's own edge and reaches
             86 = 78 + 8, where
             bubble = 2 x 1px border + 2 x spacing[3] 12 padding
                      + "REFRESH", 7 glyphs x (10 x 0.6 advance +
                        tracking.wider 0.14em = 7.4), 51.8 rounded up = 78
           so 101 from the trigger's centre once its 15px half width is added.
           The body CENTRES its content, so padding would move the trigger and
           the card edge together and buy nothing; what has to hold is body
           width >= 202. The narrowest two-column body the pages produce is 183
           (768px viewport, 240px rail) with an overlay scrollbar, ~175 where
           the platform paints a classic 15px one, so the bubble DOES overhang,
           by 9.5 to 13px. That is harmless because of the case ORDER, not
           because it fits: Left lands in column 1 and Right in column 2, so
           each opens toward the preview panel's 48px padding and never across
           the 12px grid gap. Reorder the four cases and that stops being true.
           The remedy then is wide: true, which hands the spec a full-row card;
           a min-width here would only spill the body past its own card border,
           since the grid tracks are minmax(0, 1fr).

           That 0.6 is JetBrains Mono's advance width, a FONT metric like the
           1.5 line box below and just as much not an Andromeda token. The
           label is spec copy, so re-add 78 if it changes; 33 holds for any
           label that stays on one line. */
        .andromeda-matrix-body:has([data-tooltip-placement="top"]) {
          padding-top: 33px !important;
        }
        .andromeda-matrix-body:has([data-tooltip-placement="bottom"]) {
          padding-bottom: 33px !important;
        }
        /* An open dropdown is position:absolute, so nothing above it can grow
           to fit it — the card stayed short and the panel hung outside. Same
           mechanism the sibling system uses: :has() reserves the room only
           while a panel is actually mounted, so a closed case keeps its
           compact card and the card GROWS the moment the dropdown appears.

           The room is PADDING on the side the panel opens, never a min-height
           on the body. min-height goes inert the moment natural flow height
           passes it, and this body is flexWrap:'wrap': a size ladder of three
           220px user-cards wraps to two or three lines in a component-page
           column and already flows taller than any single-line reserve, so the
           TOP line's upward panel escaped anyway. Padding is ADDED to the flow
           height whatever the content does, so one number holds at one line or
           four, at any body width — and the sums below no longer depend on
           trigger height, caption height or wrap count at all.

           !important is required for the same reason as :target above, and now
           for exactly ONE property: the body writes PADDING inline, and inline
           beats any rule. These rules touch nothing else. They used to
           set align-items as well, on the theory that pinning the trigger to
           the reserved edge made the fit exact; it did the opposite (flex-start
           pins content AWAY from a bottom reserve, and flex-end threw away room
           on the shorter card of a mixed-height line). Containment never needed
           it: the panel hangs off its wrapper, and a wrapper's top can never
           sit above the body's content top nor its bottom below the content
           bottom, so the reserve holds under ANY alignment. The body keeps its
           own inline centering.

           The two numbers are ARITHMETIC — summed from tokens.ts and the
           explicit px each component states, never measured off a screen — so
           re-add them if a token or an item list moves. The dialog reserve is
           its PANEL plus the spacing[2] 8px trigger offset; the menu reserve's
           historical constraint is called out below. Both dwarf the body's own
           spacing[6] 24px padding, which is the floor they replace.
           Too tall is dead space; too short puts the panel outside the card.

           MENU 171 = 163 + 8, re-summed 2026-08-13 for the rows-follow-rung
           law: menu rows now ride tokens.control[size].height, and every
           pinned-open case pins md (the open cases are node cases — a
           laddered staticOpen case mounted one open panel per rung and they
           slid over one another). The tallest mounted [role="menu"] is
           UserMenuPanel at the longest list any case declares, 4 items + 1
           separator, in BOTH user-menu and user-card (PanelMenu portals, so
           its panel never adds to a mounted card):
             row   = control.md.height                                    = 34
             panel = 4 x 34 + sep (1 + 2 x spacing[1] 4)
                     + 2 x spacing[2] padding + 2 x 1px border            = 163
             offset= the panel's spacing[2] 8px gap from its trigger       =  8
           A case that ever pins lg re-sums to 195 (4 x 40 + 9 + 16 + 2 + 8).

           DIALOG 414 = 406 + 8. The only [role="dialog"] a case can mount is
           DateRangePicker's calendar (Drawer portals to <body>, where :has()
           cannot see it):
             panel = 2 x 1px border + 2 x spacing[3] 12 padding
                     + header 24 (the nav button box)
                     + weekday row (size.xs 10 x 1.5 + 2 x spacing[1] 4) 23
                     + day grid (6 rows x 32 + 5 x spacing[1] 4) 212
                     + 2 x spacing[3] 12 column gap                       = 309
                     + preset footer                                        97
                                                                          = 406
             footer= the panel's own spacing[3] 12 flex gap (the footer is
                     a FOURTH child of a column that gaps between children,
                     which is the term this sum first missed)
                     + 1px border-top + spacing[3] 12 padding-top
                     + 2 chip rows (2 x spacing[8] 32 + spacing[2] 8 gap) =  97
           The footer exists only when a case passes presets, and its height
           is a WRAP rather than a constant: the four presets the spec declares
           fold onto two rows at the card's width. A fifth preset, or a longer
           label, buys a third row and this number goes short again, which is
           why the sum is written out instead of measured.
           That 1.5 is the line-box factor, and its source is Tailwind
           preflight's html { line-height: 1.5 } — NOT an Andromeda token.
           Nothing in this chain sets one. */
        .andromeda-matrix-body:has([role="dialog"], [role="menu"]) {
          padding-bottom: 171px !important;
        }
        /* A month grid is taller than a menu. */
        .andromeda-matrix-body:has([role="dialog"]) { padding-bottom: 414px !important; }
        /* WHICH WAY the room goes. Padding-bottom is right only for a panel
           that opens down; one that opens up would paint over the card header
           with its room sitting unused underneath. So an upward panel MOVES
           the same 155 to the top and hands the bottom back to the body's own
           spacing[6] floor. The offset is inline, so CSS cannot read it — the
           panel states its direction and the room follows. Keyed off the
           mounted panel, so a menu opened by CLICKING flips the room too, not
           just a pinned case. Direction is the ONLY thing that picks the side,
           so no component needs a rule of its own: a case that passes no
           placement still gets the one its component defaults to, because the
           panel stamps the resolved value (UserCard opens up, UserMenu opens
           down). Only UserMenuPanel stamps it, so the menu number is the only
           one needed here. Must stay after the rules above: equal specificity,
           both !important, so source order decides.

           The bottom reset is UNCONDITIONAL, so a card holding an upward AND a
           downward panel at once would lose its downward room. No case declares
           both, and the coverage test fails the day one does — a tripwire is
           cheaper than machinery for a case that does not exist. */
        .andromeda-matrix-body:has([data-placement="top"]) {
          padding-top: 171px !important;
          padding-bottom: ${tokens.spacing[6]} !important;
        }
`

function defaultRender(spec: MatrixSpec) {
  // Named, because a bare arrow here reads to the linter as an anonymous
  // component. It is a render callback, not a component.
  return function renderCase(size: string | undefined, props: Record<string, unknown>, c?: MatrixCase) {
    const children = c?.children ?? spec.children
    const C = spec.Component
    return (
      <C
        {...spec.baseProps}
        {...props}
        {...(size ? { size } : {})}
        {...(children !== undefined ? { children } : {})}
      />
    )
  }
}

// The case CANVAS: the box holding the component and nothing else. Every
// machine-readable attribute lives here, never on the card chrome around it —
// data-force is a descendant selector root, so a stamp one box too high lights
// rules that belong to the chrome. (data-force paints nothing itself; it only
// unlocks rules the component already declared.)
function MatrixCell({
  spec,
  kind,
  c,
  size,
  render,
}: {
  spec: MatrixSpec
  kind: 'variant' | 'state'
  c: MatrixCase
  size?: string
  render: ReturnType<typeof defaultRender>
}) {
  return (
    <span
      data-case-slug={spec.slug}
      data-case-kind={kind}
      data-case-label={c.label}
      data-force={c.force && !c.forceSelf ? c.force : undefined}
      // A definite canvas is what lets a block-scale component honour the
      // room its card already owns. Left content-sized, this flex item made a
      // child's 100% resolve through its own intrinsic width, so `wide` grew
      // the card around a chart or player without growing the thing inside it.
      // Non-wide controls keep their old centred position inside the canvas.
      style={{
        display: spec.wide || spec.fill ? 'block' : 'inline-flex',
        justifyContent: 'center',
        width: '100%',
        minWidth: 0,
      }}
    >
      {c.node ?? render(size, c.props ?? {}, c)}
    </span>
  )
}

// One CARD per case, two across. The old dense grid put every case on one row
// of a size × case table, which reads as a spreadsheet; a labelled card per case
// is what the component pages needed and what the sibling system uses.
//
// The size ladder stays INSIDE a variant card, side by side with its own
// captions, so "how big can it be" is still one glance and does not become
// three more cards.
//
// A STATE card carries its own Rest baseline beside the forced instance. That
// adjacency is the whole reason a forced state is legible: an 8-point border
// shift is invisible without the default sitting next to it, and two cards apart
// in a grid is not next to it.
function CaseCard({
  spec,
  kind,
  c,
  render,
  solo = false,
}: {
  spec: MatrixSpec
  kind: 'variant' | 'state'
  c: MatrixCase
  render: ReturnType<typeof defaultRender>
  /** The only case in its section: no card chrome, no label, no nested frame. */
  solo?: boolean
}) {
  const sizes = kind === 'variant' && spec.sizes && !c.node ? spec.sizes : null
  // A disabled case shows ALONE. The baseline exists so a subtle shift reads
  // against the default, but beside a dimmed control it does the opposite: the
  // live instance under a "Disabled" heading invites the click that the case is
  // there to say is impossible.
  const disabledCase = (c.props as { disabled?: unknown } | undefined)?.disabled === true
  const withBaseline = kind === 'state' && c.label !== REST.label && !c.node && !disabledCase

  // The card stays: it is what separates one case from the next on a long page.
  // Only a SOLO case drops it, since a lone box inside the page panel is a frame
  // inside a frame.
  return (
    <div
      id={matrixId(spec.slug, kind, c.label)}
      className="andromeda-matrix-case scroll-mt-14"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: solo ? 'transparent' : `var(--at-surface-raised, ${tokens.color.surface.raised})`,
        border: solo ? 'none' : `1px solid var(--at-border-subtle, ${tokens.color.border.subtle})`,
        borderRadius: solo ? 0 : CARD_RADIUS,
        minWidth: 0,
      }}
    >
      {solo ? null : (
      <div
        style={{
          padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
          borderBottom: `1px solid var(--at-border-subtle, ${tokens.color.border.subtle})`,
          borderTopLeftRadius: CARD_RADIUS,
          borderTopRightRadius: CARD_RADIUS,
          fontFamily: tokens.typography.fontSans,
          fontSize: tokens.typography.size.sm,
          color: `var(--at-text-primary, ${tokens.color.text.primary})`,
          fontWeight: tokens.typography.weight.medium,
          letterSpacing: tokens.typography.tracking.wide,
        }}
      >
        {c.label}
      </div>
      )}
      <div
        className="andromeda-matrix-body"
        style={{
          flex: 1,
          // A component that fills its container makes every instance claim a
          // whole line, so the flex row wraps the rest/forced pair into a stack
          // and the comparison stops reading as one. Those specs ask for two
          // equal columns instead of leaving it to intrinsic width.
          ...(withBaseline && spec.statePairColumns
            ? {
                // start, not center: Rest and the forced instance rarely match
                // height (an error message, an open panel), and centering
                // pulled the shorter one's label down to split the difference —
                // Rest's "NOTES" no longer lined up with Error focus's "NOTES".
                // Both anchor to the same top edge instead.
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                alignItems: 'start',
              }
            : sizes
            ? // The size ladder is "how big can it be" — one glance across
              // sm/md/lg — and CaseCard says so above. Wrapping it breaks that:
              // a narrow card orphans lg onto its own centred second row, which
              // reads as a fourth case, not the last rung. NOWRAP + horizontal
              // scroll keeps the row intact and is the system's own answer for
              // fixed-geometry content that cannot shrink (responsive.md,
              // "fixed-geometry primitives ... scroll horizontally"), the same
              // pattern SegmentedControl and Table already use.
              {
                display: 'flex',
                flexWrap: 'nowrap',
                alignItems: 'center',
                justifyContent: 'center',
              }
            : {
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
              }),
          // spacing[3] between rungs, not spacing[6]: three rungs of a wide
          // control (a four-segment SegmentedControl at lg) spent the extra room
          // on a scrollbar instead of on the components. The rungs still read as
          // separate — each carries its own caption underneath.
          // A `fill` rung runs edge to edge in its column, so the gap is the ONLY
          // thing between two of them — spacing[6] keeps them from touching.
          // Content-width rungs carry their own whitespace, and there spacing[2]
          // is what stops three of them overflowing the row.
          gap: spec.fill ? tokens.spacing[6] : tokens.spacing[2],
          padding: `${tokens.spacing[6]} ${tokens.spacing[4]}`,
          // A popover paints OUT of flow, and `auto` on one axis computes the
          // other to `auto` as well — so this box became a scroll container and
          // an open panel was clipped behind a scrollbar. Cases that open one
          // let it through; everything else keeps the horizontal scroll for
          // content wider than its column.
          overflowX: spec.overflow ? 'visible' : 'auto',
        }}
      >
        {withBaseline ? (
          <>
            <Instance caption="Rest" spec={spec} kind={kind} c={REST} render={render} />
            <Instance caption={c.label} spec={spec} kind={kind} c={c} render={render} />
          </>
        ) : sizes ? (
          sizes.map((s) => (
            <Instance key={s} caption={s} spec={spec} kind={kind} c={c} size={s} render={render} />
          ))
        ) : (
          <MatrixCell spec={spec} kind={kind} c={c} render={render} />
        )}
      </div>
    </div>
  )
}

// One rendered component plus the caption that says which one it is. The caption
// is what turns two look-alike boxes into a comparison.
function Instance({
  caption,
  spec,
  kind,
  c,
  size,
  render,
}: {
  caption: string
  spec: MatrixSpec
  kind: 'variant' | 'state'
  c: MatrixCase
  size?: string
  render: ReturnType<typeof defaultRender>
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: tokens.spacing[3],
        minWidth: 0,
        // Equal columns are for `fill` specs, whose component IS the column (a
        // w-full field). A merely `wide` spec holds fixed-geometry rungs that
        // grow with the size axis: thirds of the row clipped lg while sm sat in
        // dead space. Content width lets each rung take what it needs.
        flex: spec.fill ? '1 1 100%' : '0 1 auto',
      }}
    >
      <MatrixCell spec={spec} kind={kind} c={c} size={size} render={render} />
      <span style={head}>{caption}</span>
    </div>
  )
}

function CaseSection({
  spec,
  kind,
  cases,
  render,
}: {
  spec: MatrixSpec
  kind: 'variant' | 'state'
  cases: readonly MatrixCase[]
  render: ReturnType<typeof defaultRender>
}) {
  // One case is not a matrix, so its card remains bare; the section heading
  // still renders through the shared presentation-grammar helper.
  const solo = cases.length === 1

  const heading = matrixSectionHeading(kind, cases)

  return (
    <section>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: tokens.spacing[4],
          marginBottom: tokens.spacing[4],
        }}
      >
        {/* Section heading + count sit on the PAGE ground (this row is above
            the card grid below, not inside a CaseCard), so both read off the
            site's sand scale — same rule as the h2 headings the sibling
            coverage panels use in AndromedaComponentView. The per-card
            caption below (see `head`, used by Instance) stays on the
            Andromeda channel: that text sits inside the still-dark
            CaseCard, a separate surface this fix does not touch. */}
        <h3
          className="text-sand-900 dark:text-sand-50"
          style={{
            margin: 0,
            fontFamily: tokens.typography.fontSans,
            fontSize: tokens.typography.size.md,
            fontWeight: tokens.typography.weight.medium,
            letterSpacing: tokens.typography.tracking.wide,
          }}
        >
          {heading}
        </h3>
        <span
          className="text-sand-600 dark:text-sand-400"
          style={{
            fontFamily: tokens.typography.fontSans,
            fontSize: tokens.typography.size.sm,
            textTransform: 'uppercase',
            letterSpacing: tokens.typography.tracking.widest,
          }}
        >
          {cases.length} {cases.length === 1 ? 'example' : 'examples'}
        </span>
      </div>
      <div
        className={`andromeda-matrix-grid${spec.wide ? ' is-wide' : ''}`}
        style={{ display: 'grid', gap: tokens.spacing[3] }}
      >
        {cases.map((c) => (
          <CaseCard key={c.label} spec={spec} kind={kind} c={c} render={render} solo={solo} />
        ))}
      </div>
    </section>
  )
}

// "Variants" only when the component actually HAS a variant prop. Everything
// else on this axis is a set of prop combinations — an open menu, a missing
// role — and calling those variants taught readers the wrong word for the
// one word the system uses precisely.
export function matrixSectionHeading(kind: 'variant' | 'state', cases: readonly MatrixCase[]) {
  if (cases.length === 1) return 'Default'
  const isVariantAxis = kind === 'variant' && cases.some((c) => c.props && 'variant' in c.props)
  return kind === 'state' ? 'States' : isVariantAxis ? 'Variants' : 'Configurations'
}

// The preview surface for a single component, gated so its forced states can
// paint. Every consumer goes through this rather than placing the attribute
// itself — a gate on the wrong box is the one mistake this system can make.
export function MatrixPreview({ spec }: { spec: MatrixSpec }) {
  return (
    <div data-andromeda-matrix style={{ width: '100%' }}>
      <MatrixBlock spec={spec} />
    </div>
  )
}

export function MatrixBlock({ spec }: { spec: MatrixSpec }) {
  const render = spec.render ?? defaultRender(spec)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[8], width: '100%' }}>
      {/* Two across on anything but a phone. A `wide` component (tables, charts,
          banners) takes the full row instead — two charts side by side in a
          preview panel are two unreadable charts. */}
      <style>{`
        /* A card sizes to its OWN content. Grid items STRETCH to the tallest
           card in the row by default, so the moment one card reserved room for
           an open panel its row-mate grew with it, and the row-mate's body
           centred its content inside that new height: a trigger nobody clicked
           slid to the middle of its card. Nothing moved relative to its card,
           the card moved under it, which is why the answer is start on the
           grid and not a change to the body's own centering. Same rule the
           sibling system's .ds-showcase-grid carries.

           What it COSTS is the shared bottom edge: every card now ends where
           its own content ends, and the pinned-open rows LOSE that edge
           permanently and lose it by a lot, because one card carries a 155 or
           317 reserve its row-mate does not. Roughly 293px of it on
           date-range-picker's variants row 2, roughly 131px on the user-card,
           user-menu and panel-menu variant rows that hold one open panel, and
           the same 293 arriving on date-range-picker's row 1 the moment the
           Live calendar is opened. (user-menu's row 2 stays even by accident:
           Open up's top 155 and Align start's bottom 155 sum alike.)
           Everywhere else the gap is small: a caption line where a live demo
           sits beside a size ladder (slider, segmented-control), a panel
           beside a bare canvas (planet), a taller grid (heat-grid), an error
           message (input, textarea). A ragged row is this rule working, not a
           page half painted. */
        .andromeda-matrix-grid { grid-template-columns: minmax(0, 1fr); align-items: start; }
        /* The card a coverage chip just jumped to. :target is the whole
           mechanism — no state, no script, and the browser clears it when you
           navigate away or click another chip. Accent is the system's own
           "selected", so this reads as selection rather than as an error.

           !important is REQUIRED, not defensive: the card paints its border
           through an inline style, which beats any plain class rule. That is
           the same precedence trap the interaction-states rules describe for
           hover on inline-styled controls, and it is why this rule appeared to
           do nothing at first.

           */
        .andromeda-matrix-case:target {
          border-color: ${TARGET_INK} !important;
          box-shadow: 0 0 0 1px ${TARGET_INK} !important;
        }
        ${BODY_RESERVE_CSS}
        @media (min-width: 768px) {
          .andromeda-matrix-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .andromeda-matrix-grid.is-wide { grid-template-columns: minmax(0, 1fr); }
        }
      `}</style>
      {spec.variants.length > 0 ? (
        <CaseSection spec={spec} kind="variant" cases={spec.variants} render={render} />
      ) : null}
      {spec.states.length > 0 ? (
        <CaseSection spec={spec} kind="state" cases={spec.states} render={render} />
      ) : null}
    </div>
  )
}

// The HERO surface: ONE case, bare. No card, no caption, no grid — the page
// frame around it is the chrome, so the first thing a reader sees is the
// component itself rather than a contact sheet of it. The full set still
// renders below through MatrixPreview; this is a lead, not a replacement.
//
// It renders through the SAME `.andromeda-matrix-body` the cards use and emits
// the SAME reserve rules, because an out-of-flow panel is out of flow here too:
// a bare centred cell gave the calendar nothing to open into and the frame
// clipped it. Reusing the body is also what makes this correct for all 49
// without a per-component branch — the reserves key off the panel, not the
// component.
//
// Falls back to the first case when the named label is absent: a renamed case
// degrades to a live component, never to an empty frame.
export function MatrixSolo({ spec, label }: { spec: MatrixSpec; label?: string }) {
  const render = spec.render ?? defaultRender(spec)
  const usesVariants = spec.variants.length > 0
  const cases = usesVariants ? spec.variants : spec.states
  const c = cases.find((x) => x.label === label) ?? cases[0]
  if (!c) return null
  return (
    <div data-andromeda-matrix style={{ width: '100%' }}>
      <style>{BODY_RESERVE_CSS}</style>
      <div
        className="andromeda-matrix-body"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: tokens.spacing[2],
          // The frame around this already pays the outer padding. What the
          // body needs is a FLOOR the reserve rules can replace, the same one
          // the cards state, or a `:has` rule would be handing back room the
          // body never had.
          padding: tokens.spacing[6],
          // Same reasoning as the card body: `auto` on one axis computes the
          // other to `auto`, which turns this into a scroll container and
          // clips the panel it just reserved room for.
          overflowX: spec.overflow ? 'visible' : 'auto',
        }}
      >
        <MatrixCell
          spec={spec}
          kind={usesVariants ? 'variant' : 'state'}
          c={c}
          render={render}
        />
      </div>
    </div>
  )
}
