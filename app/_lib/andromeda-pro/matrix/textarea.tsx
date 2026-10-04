// @ts-nocheck — this spec AUTHORS JSX against an untyped design-system
// component. Data-only specs in this directory need no such line.
'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { Textarea } from '../../../lib/andromeda-pro.generated'
import { tokens } from '../../../lib/andromeda-pro.generated'
import { CONTROL_STATES, type MatrixSpec } from './types'

// The 260px pin landed on the wrapper div (Textarea forwards `style` there,
// not to the <textarea>), so it capped the whole field regardless of how
// much room `fill`/`wide` granted it — same trap the Slider spec had.
const BASE_PROPS = { label: 'Notes', placeholder: 'Add a note', rows: 3 }

/**
 * The frame a `bare` field lives in. A bare field draws no border, fill or
 * focus of its own, so without a host it is invisible on the page, and the
 * host is what must show focus (the rules' :focus-within contract): the
 * border climbs to focus.ring, plus the 1px ring when focus came from the
 * keyboard.
 */
function BareHost({ children }: { children: ReactNode }) {
  const [focus, setFocus] = useState<'none' | 'pointer' | 'keyboard'>('none')
  const ring = `var(--at-focus-ring, ${tokens.color.focus?.ring})`
  return (
    <div
      onFocus={(e) => setFocus(e.target.matches(':focus-visible') ? 'keyboard' : 'pointer')}
      onBlur={() => setFocus('none')}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: tokens.spacing[3],
        border: `${tokens.border.thin} ${focus === 'none' ? `var(--at-border-base, ${tokens.color.border.base})` : ring}`,
        borderRadius: tokens.radius.frame,
        boxShadow: focus === 'keyboard' ? `0 0 0 var(--andromeda-border-width, 1px) ${ring}` : 'none',
      }}
    >
      {children}
    </div>
  )
}

export const textarea: MatrixSpec = {
  slug: 'textarea',
  Component: Textarea,
  sizes: ['sm', 'md', 'lg'],
  // A field is w-full by design; without this it renders at its intrinsic
  // width in the middle of a case that already owns the room.
  fill: true,
  // One card per row instead of two across — same reasoning as Input: a
  // w-full field halves its room the moment it shares a row with a second
  // card, fighting `fill` immediately after granting it.
  wide: true,
  // Without this, wide's Instance flex ('1 1 100%') stacks the Rest/forced
  // pair in a state card instead of sitting them side by side.
  statePairColumns: true,
  baseProps: BASE_PROPS,
  // A custom renderer only so the Bare case can sit in the frame it is made
  // for. Every other case is the same merge the default renderer does: base
  // props, then case props, then size.
  render: (size, props) => {
    const field = <Textarea {...BASE_PROPS} {...props} size={size} />
    return props.bare ? <BareHost>{field}</BareHost> : field
  },
  variants: [
    { label: 'Default', props: {} },
    // Same shape as Input: error is a string prop that derives the cva state
    // axis, so this case is what covers that axis.
    { label: 'Error', props: { error: 'Brief must be at least 80 characters' } },
    // Starts at one line and takes its content's height up to five lines,
    // then scrolls. Three lines of text, so the grown height shows at rest
    // and there is room to type two more before the cap.
    {
      label: 'Auto-grow',
      props: {
        autoGrow: true,
        rows: 1,
        maxRows: 5,
        defaultValue: 'Re-entry corridor confirmed.\nCrew finished the deorbit checklist.\nAwaiting go for the burn.',
      },
    },
    // No border, fill, padding or ring: the field inside a prompt box. The
    // label stays as its accessible name, visually hidden.
    { label: 'Bare', props: { bare: true, rows: 2, placeholder: 'Ask about your pipeline' } },
  ],
  states: [
    ...CONTROL_STATES,
    { label: 'Error focus', props: { error: 'Brief must be at least 80 characters' }, force: 'focus' },
    { label: 'Filled', props: { defaultValue: 'Re-entry corridor confirmed. Awaiting go for deorbit burn.' } },
  ],
}
