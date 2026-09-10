// @ts-nocheck — renders JSX design-system components whose forwardRef wrappers
// carry no TypeScript prop types.
'use client'

// Nine treatments of Button's DEFAULT variant, each shown across every state it
// has, so the comparison is like-for-like rather than a row of rest states.
//
// Each candidate is the real <Button variant="default"> plus a className. Button
// merges className last through tailwind-merge, so an override replaces the
// variant's own class in the same group and loses nothing else — the size
// ladder, the focus ring shape, the touch target and the framer gestures all
// still come from the component. Nothing here edits Button.tsx.
//
// States are painted at rest by the same data-force marker the matrix uses, so
// hover / focus / pressed are real rules firing, never a restyled copy. The
// framer half of hover and press (the -1px lift, the 0.98 scale) is JS and
// cannot be forced, so it is absent from every candidate equally — which is
// fine, because this is a colour decision.
import { Button } from '../../../../../lib/andromeda-pro.generated'
import { andromedaVars } from '../../../../../lib/andromeda-pro-helpers.generated'
import { tokens } from '../../../../../lib/andromeda-pro.generated'

// Class strings are written out in FULL, never built from tokens by
// interpolation. Tailwind scans source text: a class assembled at runtime is
// invisible to it and simply never compiles, which is exactly how the first
// draft of this page produced nine identical buttons. The hexes are the accent
// and neutral ramps from tokens.ts, copied here on purpose — a study page is
// allowed to name colours the system has not adopted yet.
//
// accent 100 #BAF8EC · 200 #56F0D6 · 300 #0FCFB2 · 400 #109380 · 500 #126059

type Candidate = {
  id: string
  name: string
  note: string
  className: string
}

const CANDIDATES: Candidate[] = [
  {
    id: 'current',
    name: '01 · Current',
    note: 'What ships today: accent-400 fill, accent-200 border, accent-on label. Hover only adds a glow, so rest and hover are the same colour.',
    className: '',
  },
  {
    id: 'borderless',
    name: '02 · Borderless',
    note: 'Same fill, border removed. Reads as a solid block with no outline.',
    className: 'border-transparent hover:border-transparent active:border-transparent',
  },
  {
    id: 'borderless-lift',
    name: '03 · Borderless, hover lifts a shade',
    note: 'Borderless, and hover moves the fill 400 to 300 instead of only glowing — hover gets something to say without the framer lift.',
    className:
      'border-transparent hover:border-transparent active:border-transparent bg-[#109380] hover:bg-[#0FCFB2] active:bg-[#126059]',
  },
  {
    id: 'bright',
    name: '04 · Brighter fill, dark label',
    note: 'accent-300 fill, near-black label. The most saturated option and the highest contrast in the family.',
    className:
      'border-transparent hover:border-transparent active:border-transparent bg-[#0FCFB2] hover:bg-[#56F0D6] active:bg-[#109380] text-[#08201D] hover:text-[#08201D]',
  },
  {
    id: 'deep',
    name: '05 · Deeper fill, light label',
    note: 'accent-500 fill, light label. The quietest accent fill; sits close to the surface.',
    className:
      'border-transparent hover:border-transparent active:border-transparent bg-[#126059] hover:bg-[#109380] active:bg-[#126059] text-[#F5F5F5] hover:text-[#F5F5F5]',
  },
  {
    id: 'pale',
    name: '06 · Pale fill, dark label',
    note: 'accent-200 fill, near-black label. A light button on a dark page, the way a primary usually reads elsewhere.',
    className:
      'border-transparent hover:border-transparent active:border-transparent bg-[#56F0D6] hover:bg-[#BAF8EC] active:bg-[#0FCFB2] text-[#08201D] hover:text-[#08201D]',
  },
  {
    id: 'neutral',
    name: '07 · Neutral light, dark label',
    note: 'No accent at all: near-white fill, near-black label, so accent stays a measurement everywhere else in the system.',
    className:
      'border-transparent hover:border-transparent active:border-transparent bg-[#F5F5F5] hover:bg-[#FFFFFF] active:bg-[#DCDCDC] text-[#0B0B0C] hover:text-[#0B0B0C]',
  },
  {
    id: 'hairline',
    name: '08 · Fill with a hairline ring',
    note: 'Solid fill with a one-step-brighter ring instead of a contrasting border, so the edge is defined without a second colour.',
    className: 'border-[#0FCFB2] hover:border-[#56F0D6] active:border-[#0FCFB2] bg-[#109380] hover:bg-[#0FCFB2]',
  },
  {
    id: 'flat-dark',
    name: '09 · Filled surface, no accent',
    note: 'surface.active fill, bright border, primary label. The quietest primary: weight comes from the frame, not the colour.',
    className:
      'bg-[#232325] hover:bg-[#1C1C1D] active:bg-[#232325] border-[#5B5B5C] hover:border-[#939393] text-[#F5F5F5] hover:text-[#F5F5F5]',
  },
]

const STATES = [
  { label: 'Rest', force: undefined, props: {} },
  { label: 'Hover', force: 'hover', props: {} },
  { label: 'Focus', force: 'focus', props: {} },
  { label: 'Pressed', force: 'active', props: {} },
  { label: 'Disabled', force: undefined, props: { disabled: true } },
]

const label = {
  fontFamily: tokens.typography.fontMono,
  fontSize: tokens.typography.size.xs,
  color: `var(--at-text-faint, ${tokens.color.text.faint})`,
  textTransform: 'uppercase' as const,
  letterSpacing: tokens.typography.tracking.wider,
}

export function ButtonStudy() {
  return (
    <div
      data-andromeda-matrix
      style={{
        ...andromedaVars(),
        minHeight: '100vh',
        boxSizing: 'border-box',
        background: `var(--at-surface-base, ${tokens.color.surface.base})`,
        padding: `${tokens.spacing[10]} ${tokens.spacing[8]}`,
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1
          style={{
            margin: 0,
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size['3xl'],
            color: `var(--at-text-primary, ${tokens.color.text.primary})`,
            letterSpacing: tokens.typography.tracking.wide,
          }}
        >
          Button · default variant
        </h1>
        <p
          style={{
            marginTop: tokens.spacing[3],
            marginBottom: tokens.spacing[8],
            maxWidth: '70ch',
            fontFamily: tokens.typography.fontMono,
            fontSize: tokens.typography.size.md,
            color: `var(--at-text-secondary, ${tokens.color.text.secondary})`,
            lineHeight: tokens.typography.lineHeight.relaxed,
          }}
        >
          Nine treatments, each across every state. Hover, focus and pressed are the component&rsquo;s
          own rules fired at rest, so a cell that looks identical to Rest means that candidate has
          nothing to say in that state. The framer lift and press scale are JS and are absent from
          all nine equally.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5] }}>
          {CANDIDATES.map((c) => (
            <section
              key={c.id}
              style={{
                background: `var(--at-surface-raised, ${tokens.color.surface.raised})`,
                border: `1px solid var(--at-border-subtle, ${tokens.color.border.subtle})`,
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  padding: `${tokens.spacing[3]} ${tokens.spacing[5]}`,
                  borderBottom: `1px solid var(--at-border-subtle, ${tokens.color.border.subtle})`,
                }}
              >
                <div
                  style={{
                    fontFamily: tokens.typography.fontMono,
                    fontSize: tokens.typography.size.md,
                    color: `var(--at-text-primary, ${tokens.color.text.primary})`,
                    letterSpacing: tokens.typography.tracking.wide,
                  }}
                >
                  {c.name}
                </div>
                <div
                  style={{
                    marginTop: tokens.spacing[1],
                    fontFamily: tokens.typography.fontMono,
                    fontSize: tokens.typography.size.sm,
                    color: `var(--at-text-secondary, ${tokens.color.text.secondary})`,
                    lineHeight: tokens.typography.lineHeight.relaxed,
                  }}
                >
                  {c.note}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${STATES.length}, max-content)`,
                  gap: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
                  padding: `${tokens.spacing[6]} ${tokens.spacing[5]}`,
                  overflowX: 'auto',
                  justifyContent: 'start',
                }}
              >
                {STATES.map((s) => (
                  <span key={s.label} data-force={s.force}>
                    <Button variant="default" className={c.className} {...s.props}>
                      Deploy
                    </Button>
                  </span>
                ))}
                {STATES.map((s) => (
                  <span key={`${s.label}-caption`} style={label}>
                    {s.label}
                  </span>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
