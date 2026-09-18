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

// The page title. `mt-3` is its distance from the overline; a page with no
// overline passes className="mt-0".
export function PageTitle({
  children,
  id,
  className = '',
}: {
  children: ReactNode
  id?: string
  className?: string
}) {
  return (
    <h1
      id={id}
      className={`mt-3 text-4xl font-extrabold tracking-tight text-sand-900 dark:text-sand-50 sm:text-5xl ${className}`}
    >
      {children}
    </h1>
  )
}

// The lead paragraph under the title.
export function PageLead({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`mt-4 max-w-xl text-base leading-relaxed text-sand-700 dark:text-sand-300 ${className}`}>
      {children}
    </p>
  )
}
