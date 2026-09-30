import type { CSSProperties, ReactNode, Ref } from 'react'

// The one page frame for every design-system page: Overview, Foundation,
// Components, Image Pack, Brain, System and each per-component page, on both
// Andromeda Pro and Andromeda Legacy. Ten pages used to carry five different
// hand-rolled containers, widths from 896px to an inline 1180px, three eyebrow
// trackings and four title weights. This is the Overview's shape, adopted
// everywhere, so a visitor walking the sidebar never sees the page jump.
//
// A page uses the frame per section, not once around everything, so a
// full-bleed band between sections stays possible: the frame sets the width,
// the page decides where it applies.

// Width, side padding and the space above the first heading. `ref` and
// `style` are here because two pages need them on the frame itself: Foundation
// anchors its swatch tooltip to the column, and the Legacy System page lays the
// column out as a flex stack with a token gap.
export function PageFrame({
  children,
  className = '',
  as: Tag = 'div',
  ref,
  style,
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'main' | 'section' | 'header'
  ref?: Ref<HTMLElement>
  style?: CSSProperties
}) {
  return (
    <Tag ref={ref as never} style={style} className={`mx-auto w-full max-w-5xl px-4 sm:px-6 ${className}`}>
      {children}
    </Tag>
  )
}

// Top padding for the first frame on a page. Sections after the hero set
// their own rhythm.
export const PAGE_TOP = 'pt-10 sm:pt-16'
export const PAGE_BOTTOM = 'pb-16 sm:pb-20'

// The small olive label above the page title.
export function PageOverline({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-wider text-olive-600 dark:text-olive-400 ${className}`}>
      {children}
    </p>
  )
}

// The page title. `gap` is its distance from the overline above it; a page whose
// title starts the block passes gap="none". It is a prop and not a className
// override for the same reason PageLead's tone is: mt-0 and mt-3 carry equal
// specificity, so appending one would leave the winner to stylesheet order.
const TITLE_GAP = { overline: 'mt-3', none: 'mt-0' } as const

// `rank` is the same kind of prop for the same reason: the two sizes collide at
// equal specificity. A hero heading opens a whole area (a system, the index, a
// gallery) and takes the 800 weight; a section heading names one thing inside
// it, which is what a single component page is, and stays at 700. The ladder
// is supervisor/skills/site-design-tokens.md.
const TITLE_RANK = {
  hero: 'text-4xl font-extrabold sm:text-5xl',
  section: 'text-3xl font-bold sm:text-4xl',
} as const

export function PageTitle({
  children,
  id,
  gap = 'overline',
  rank = 'hero',
  className = '',
}: {
  children: ReactNode
  id?: string
  gap?: keyof typeof TITLE_GAP
  rank?: keyof typeof TITLE_RANK
  className?: string
}) {
  return (
    <h1
      id={id}
      className={`${TITLE_GAP[gap]} ${TITLE_RANK[rank]} tracking-tight text-sand-900 dark:text-sand-50 ${className}`}
    >
      {children}
    </h1>
  )
}

// The lead paragraph under the title. `tone` picks the dark value, because dark
// is the default theme and unifying these leads must not lighten any of them:
// most pages carried sand-400, the four hero leads (the two system overviews and
// the two brain pages) carried sand-300, and a hero lead is body copy rather than
// a secondary line. It is a prop and not a className override on purpose: both
// classes have the same specificity, so appending one would leave the winner to
// stylesheet order rather than to the caller.
const LEAD_TONE = {
  secondary: 'text-sand-700 dark:text-sand-400',
  body: 'text-sand-700 dark:text-sand-300',
} as const

export function PageLead({
  children,
  tone = 'secondary',
  className = '',
}: {
  children: ReactNode
  tone?: keyof typeof LEAD_TONE
  className?: string
}) {
  return (
    <p className={`mt-4 max-w-xl text-base leading-relaxed ${LEAD_TONE[tone]} ${className}`}>
      {children}
    </p>
  )
}
