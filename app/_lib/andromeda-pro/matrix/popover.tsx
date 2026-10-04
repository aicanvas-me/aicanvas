// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
'use client'

import { useState } from 'react'
import { CaretDown, Check, Cpu, Lightning, Sparkle } from '@phosphor-icons/react'
// v2 component: imported through the build-time shim.
import { Popover, PopoverContent, PopoverLabel, PopoverTrigger } from '../../../lib/andromeda-pro.generated'
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '../../../lib/andromeda-pro.generated'
import { Button } from '../../../lib/andromeda-pro.generated'
import { tokens } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

export const MODELS = [
  { id: 'fast', label: 'Fast', icon: Lightning },
  { id: 'balanced', label: 'Balanced', icon: Sparkle },
  { id: 'thorough', label: 'Thorough', icon: Cpu },
]

// A menu supplies its own arrow-key contract (Popover.rules.md): Up and Down
// walk the rows and wrap at both ends.
function walkRows(e: React.KeyboardEvent<HTMLDivElement>) {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
  e.preventDefault()
  const rows = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitemradio"]')]
  const at = rows.indexOf(document.activeElement as HTMLElement)
  const next = at === -1 ? 0 : (at + (e.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length
  rows[next]?.focus()
}

/**
 * A wired model picker: the trigger names the current model, a pick checks
 * its row, names it on the trigger and closes the panel. Outside press,
 * Escape and Tab away close it too (Popover's own dismissers). `defaultOpen`
 * is only where it starts.
 */
export function ModelPicker({
  defaultOpen = false,
  side = 'bottom',
  align = 'start',
  size = 'sm',
}: {
  defaultOpen?: boolean
  side?: 'auto' | 'top' | 'bottom'
  align?: 'start' | 'end'
  size?: 'sm' | 'md'
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [model, setModel] = useState('balanced')
  const current = MODELS.find((m) => m.id === model)!
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild aria-haspopup="menu">
        <Button variant="outline" size={size} icon={current.icon}>
          {current.label}
          <CaretDown size={tokens.iconSize.sm} weight="regular" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent side={side} align={align} role="menu" width={220} onKeyDown={walkRows}>
        <PopoverLabel>Model</PopoverLabel>
        {MODELS.map((m) => {
          const Icon = m.icon
          const checked = m.id === model
          return (
            <Item key={m.id} asChild size={size}>
              <button
                type="button"
                role="menuitemradio"
                aria-checked={checked}
                onClick={() => {
                  setModel(m.id)
                  setOpen(false)
                }}
              >
                <ItemMedia>
                  <Icon weight="regular" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{m.label}</ItemTitle>
                </ItemContent>
                {checked ? (
                  <ItemActions>
                    <Check size={size === 'sm' ? tokens.iconSize.sm : tokens.iconSize.md} weight="regular" aria-hidden />
                  </ItemActions>
                ) : null}
              </button>
            </Item>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}

export const popover: MatrixSpec = {
  slug: 'popover',
  sizes: null,
  // The panel is inline and absolutely positioned, never portaled: the body
  // must not become a scroll container or a paint-contained box that clips it.
  overflow: true,
  // role="menu" is what the renderer's reserve keys off, so the open cases
  // get their room under the trigger. The side is pinned to bottom: `auto`
  // prefers above, and the reserve only follows panels that stamp
  // data-placement, which this one does not.
  render: (_size, props) => <ModelPicker {...props} />,
  variants: [
    { label: 'Closed', props: {} },
    { label: 'Open', props: { defaultOpen: true } },
    { label: 'Align end', props: { defaultOpen: true, align: 'end' } },
  ],
  states: [],
  gaps: {
    'Trigger open':
      'the held look on the trigger comes from data-state, which Popover sets from its own open state; the Open cases show it',
    'Row hover': 'rows are Item rows, whose hover, pressed and checked states are forced on the Item page',
    'Auto side':
      'side="auto" measures the room above and below against the nearest scrolling ancestor at layout time, so the side is computed, not a prop a still cell can pin',
  },
}
