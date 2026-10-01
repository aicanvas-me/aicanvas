// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
'use client'

import { useState } from 'react'
import { Buildings, ChatCircle } from '@phosphor-icons/react'
// v2 component: imported through the build-time shim.
import { Combobox } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

// A mixed set, so the glyph is how the eye sorts the list (Combobox.rules.md):
// recent chats and the accounts they are about.
export const COMBOBOX_OPTIONS = [
  { id: 'chat-q3', label: 'Q3 pipeline risk', icon: ChatCircle, meta: 'Today', keywords: ['forecast'] },
  { id: 'chat-churn', label: 'Churn drivers by segment', icon: ChatCircle, meta: 'Yesterday' },
  { id: 'chat-renewal', label: 'Draft a renewal email', icon: ChatCircle, meta: 'Mon' },
  { id: 'acme', label: 'Acme Corp', icon: Buildings, meta: '$540K' },
  { id: 'northwind', label: 'Northwind', icon: Buildings, meta: '$212K' },
  { id: 'globex', label: 'Globex', icon: Buildings, meta: '$98K' },
]

/**
 * A wired picker: type to find, arrow keys walk the list, Enter or a click
 * picks, and the pick lands in the field as its label. `defaultValue` is only
 * where the query starts.
 *
 * No keycap: the component shows one but leaves binding the key to its host
 * (Combobox.rules.md), and on this site ⌘K already opens the site search, so
 * a keycap here would promise a key that does something else.
 */
export function PickerCombobox({ defaultValue = '', ...props }) {
  const [query, setQuery] = useState(defaultValue)
  return (
    <Combobox
      options={COMBOBOX_OPTIONS}
      placeholder="Search chats and accounts"
      ariaLabel="Search chats and accounts"
      shortcut={null}
      {...props}
      value={query}
      onValueChange={setQuery}
      clearOnSelect={false}
      onSelect={(option) => setQuery(option.label)}
    />
  )
}

export const combobox: MatrixSpec = {
  slug: 'combobox',
  Component: PickerCombobox,
  sizes: ['sm', 'md'],
  // A field is w-full by design, and one card per row for the same reason as
  // SearchField: a w-full field halves its room beside a second card.
  fill: true,
  wide: true,
  // The results list is an inline absolute panel, not a portal: the body
  // must not turn into a scroll container that clips it.
  overflow: true,
  variants: [
    // The page hero: a typed query with its list already open, so the field
    // never reads as a plain SearchField. defaultOpen shows the list without
    // taking focus; a click outside or Escape closes it as usual.
    { label: 'Live', props: { defaultValue: 'a', defaultOpen: true } },
    { label: 'Empty', props: {} },
    // Holding a query, the list opens as soon as the field takes focus.
    { label: 'With query', props: { defaultValue: 'acme' } },
  ],
  states: [],
  gaps: {
    Open:
      'the list opens from React state when the field holds a query and has focus; there is no open prop, so type in any case to open it',
    'Cursor row':
      'the highlighted result follows the arrow keys and the pointer from React state, and exists only while the list is open',
    Hover:
      'the field is a SearchField, whose border and background come from React state, not CSS pseudo-classes; the Search Field page documents the same gap',
    Focus: 'the focus border and glow are inline styles SearchField sets from its own onFocus, so painting them means giving this field real document focus',
  },
}
