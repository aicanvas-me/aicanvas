// @ts-nocheck — this spec AUTHORS JSX against an untyped design-system
// component. Data-only specs in this directory need no such line.
'use client'

import { useState } from 'react'
import { Envelope, Eye, EyeSlash, Lock } from '@phosphor-icons/react'
import { Input } from '../../../lib/andromeda-v2.generated'
import { CONTROL_STATES, type MatrixSpec } from './types'

const BASE_PROPS = { label: 'Node ID', placeholder: 'ND-4471' }

function LivePasswordInput({ size, ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <Input
      {...BASE_PROPS}
      {...props}
      size={size}
      type={visible ? 'text' : 'password'}
      trailingIcon={visible ? EyeSlash : Eye}
      trailingIconLabel={visible ? 'Hide password' : 'Show password'}
      onTrailingIconClick={() => setVisible((value) => !value)}
    />
  )
}

export const input: MatrixSpec = {
  slug: 'input',
  Component: Input,
  sizes: ['sm', 'md', 'lg'],
  // A field is w-full by design; without this it renders at its intrinsic
  // width in the middle of a case that already owns the room.
  fill: true,
  // One card per row instead of two across. A w-full field halves its room
  // the moment it shares a row with a second card, which fights `fill`
  // immediately after granting it.
  wide: true,
  // Without this, wide's Instance flex ('1 1 100%') stacks the Rest/forced
  // pair in a state card instead of sitting them side by side — each demands
  // the whole row and wraps onto its own line. Two grid columns instead, so a
  // state card reads the same as a variant card: one row, full width used.
  statePairColumns: true,
  baseProps: BASE_PROPS,
  // A custom renderer keeps the password toggle live in every rung. A `node`
  // would bypass the size ramp, while the ordinary cases still need the same
  // base-prop merge the matrix's default renderer supplies.
  render: (size, props, c) =>
    c?.label === 'Password' ? (
      <LivePasswordInput {...props} size={size} />
    ) : (
      <Input {...BASE_PROPS} {...props} size={size} />
    ),
  variants: [
    { label: 'Default', props: {} },
    // Label + placeholder override here, not just the icon: BASE_PROPS is
    // "Node ID" / "ND-4471", and an envelope glyph next to a node ID reads as
    // a mismatch — the field's own copy has to agree with what the icon says
    // it's for, same reasoning as the Password case below.
    { label: 'With icon', props: { icon: Envelope, label: 'Email', placeholder: 'you@node.dev' } },
    {
      label: 'Password',
      props: {
        label: 'Password',
        type: 'password',
        defaultValue: 'ORBITAL-7742',
        icon: Lock,
      },
    },
    // error is a STRING prop; the cva `state` axis is DERIVED from it
    // (Input.tsx:130), never passed, so this case is what covers that axis.
    { label: 'Error', props: { error: 'Value out of range' } },
  ],
  states: [
    ...CONTROL_STATES,
    // The plain focus rule matters as much as focus-visible here: the accent
    // border comes from focus:, only the ring comes from focus-visible:, so
    // forcing one without the other would show a state users never see.
    { label: 'Error focus', props: { error: 'Value out of range' }, force: 'focus' },
    { label: 'Filled', props: { defaultValue: 'ORBITAL-7742' } },
  ],
}
