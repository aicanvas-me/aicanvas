// The Andromeda MATRIX: every component's variants and states declared as
// data, once, so the review page and the per-component pages can never show
// different things again. One declaration file per component (see index.ts),
// one renderer (Matrix.tsx), one coverage test (coverage.test.tsx).
//
// Nothing here is shared with Lumen's showcase system — not a type, not a
// name. `Matrix` is Andromeda's own word for this (it named the size × state
// helper on the old showcase page).
//
// PRESENTATION GRAMMAR:
// - Section headings are MECHANICAL: 'States' for state rows; 'Variants' when
//   at least one case sets the `variant` prop; otherwise 'Configurations'.
//   A single-case component renders under 'Default'. The Coverage chips reuse
//   the same helper - the two surfaces can never disagree.
// - The label 'Live' is RESERVED: a case may carry it only when the rendered
//   case is genuinely interactive on the page (a `node`/`render` demo).
//   Interactive cases MAY instead be named by their configuration; a 'Live'
//   label that lies is a defect to fix on sight.
import type { ComponentType, ReactNode } from 'react'

export type MatrixCase = {
  label: string
  props?: Record<string, unknown>
  /** Overrides spec.children for this case. Omit both for void elements (Input etc.). */
  children?: ReactNode
  /** Renders exactly this instead of the component, for the few cells that are
      a LIVE demo rather than a configuration — the behaviours no arrangement of
      still cells can show (a gauge that crossfades, a picker that commits a
      range). Bypasses props, sizes and the spec's render. */
  node?: ReactNode
  /** Fire the component's own :hover / :focus-visible / :focus / :active at rest
      via the data-force attribute the gated @custom-variant blocks in
      globals.css key off. */
  force?: 'hover' | 'focus' | 'active'
  /** The spec's render places data-force itself, on exactly one row/item.
      Needed on composites: `[data-force] &` is a DESCENDANT selector, so a
      stamp on the canvas would light every nested hover rule at once and a
      fully-lit table reads as broken, not hovered. */
  forceSelf?: boolean
  /** Reason this case SSRs empty or stubbed (portal mount gate, WebGL effect).
      Coverage assertion 2 skips it; the page still renders it live in the browser. */
  clientOnly?: string
  note?: string
}

export type MatrixSpec = {
  /** Must match a slug in ANDROMEDA_COMPONENT_META. */
  slug: string
  /** Required unless render is given. Pro components import from andromeda-pro.generated. */
  // A spec renders whatever props its variants declare, so the component is not
  // narrowed here: forwardRef components with required props (StatTile,
  // ProgressBar) are specs too.
  Component?: ComponentType<any>
  /** null = no size axis for variants. States always render once, at md, Rest first. */
  sizes: readonly ('sm' | 'md' | 'lg')[] | null
  baseProps?: Record<string, unknown>
  children?: ReactNode
  variants: readonly MatrixCase[]
  states: readonly MatrixCase[]
  /** Same signature as the old showcase Matrix helper: (size, props). Colocated
      with its labels, so a custom render and its cases live in one file. */
  render?: (
    size: string | undefined,
    props: Record<string, unknown>,
    c?: MatrixCase,
  ) => ReactNode
  /** The page hero's render, when `render` frames the component in a demo
      composition the installed item does not ship (a stage, a surface, a
      sibling component). The hero shows the component as it installs; the
      framed composition stays in the cases below it. */
  soloRender?: (
    size: string | undefined,
    props: Record<string, unknown>,
    c?: MatrixCase,
  ) => ReactNode
  /** state label -> the MECHANISM that prevents painting at rest (framer whileTap,
      portal, ResizeObserver flip, perpetual motion). A gap must name a mechanism,
      never a missing implementation: "component lacks X the brain requires" is a
      defect to log and fix, not a gap. */
  gaps?: Record<string, string>
  /** Cells stretch instead of hugging their content (charts, tables). */
  wide?: boolean
  /** The component fills the case canvas edge to edge, without `wide`'s
      one-case-per-row grid. For fields that are `w-full` by design: the
      centred inline-flex canvas resolves their 100% against their own
      intrinsic width, so a textarea rendered at the size of an empty
      textarea instead of the room its case actually owns. */
  fill?: boolean
  /** The page hero centres this `wide` spec's case instead of laying it from
      the left edge. For a component that keeps its own intrinsic width (a
      segmented control) but needs `wide` for its full-row cards. */
  soloCentered?: boolean
  /** Required true when any case passes staticOpen (inline open popover), because
      content-visibility implies contain:paint and would clip it. Enforced by the test. */
  overflow?: boolean
  /** Lay a state case's rest/forced pair as two equal columns instead of letting
      the flex row decide. For components that FILL their container (a choice
      card, a row), where each instance claims a whole line and the pair wraps
      into a stack, which reads as two examples rather than one comparison. */
  statePairColumns?: boolean
  /** The preview's own companion rules for a component whose states live in
      its scoped stylesheet rather than in Tailwind variants: the
      `[data-force~=...]` twins of its :hover / :focus-visible rules. They
      belong to this page, not to the installed component, so a component
      whose twins live here ships without them. ChoiceCard's moved here; other
      components may still carry their own data-force selectors in source.
      Emitted once per matrix surface; gate every selector with :where([data-andromeda-matrix]) and copy the
      real rule's declarations exactly, or the forced cell shows a state the
      component does not have. */
  forcedStateCss?: string
}

export const matrixId = (slug: string, kind: 'variant' | 'state', label: string) =>
  `andromeda-${slug}-${kind}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

/** The baseline cell every states row opens with. Without its own default
    sitting beside it, an 8-point RGB border shift is invisible. */
export const REST: MatrixCase = { label: 'Rest' }

/** The brain's canonical interaction states (foundations/interaction-states.md)
    minus the ones that are props wherever they exist (selected, open) — those
    are declared per spec as ordinary cases. */
export const CONTROL_STATES: readonly MatrixCase[] = [
  { label: 'Hover', force: 'hover' },
  { label: 'Focus visible', force: 'focus' },
  { label: 'Disabled', props: { disabled: true } },
]
