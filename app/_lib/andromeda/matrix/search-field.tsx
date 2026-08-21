import { SearchField } from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

export const searchField: MatrixSpec = {
  slug: 'search-field',
  Component: SearchField,
  sizes: ['sm', 'md', 'lg'],
  // A field is w-full by design; without this it renders at its intrinsic
  // width in the middle of a case that already owns the room.
  fill: true,
  // One card per row instead of two across — same reasoning as Input/Textarea:
  // a w-full field halves its room the moment it shares a row with a second
  // card, fighting `fill` immediately after granting it.
  wide: true,
  // Without this, wide's Instance flex ('1 1 100%') stacks the Rest/forced
  // pair in a state card instead of sitting them side by side.
  statePairColumns: true,
  // The 320px pin landed on the outer wrapper div (SearchField spreads `style`
  // last onto that div, SearchField.tsx:176, the same div that owns
  // `width: '100%'`), so it capped the whole field regardless of how much
  // room `fill`/`wide` granted it — same trap Textarea's had.
  baseProps: { placeholder: 'Search anything' },
  variants: [
    { label: 'Default', props: {} },
    { label: 'Custom shortcut', props: { shortcut: '⌘ F' } },
    { label: 'No shortcut', props: { shortcut: null } },
    { label: 'With value', props: { defaultValue: 'invoice 2043' } },
  ],
  states: [{ label: 'Disabled', props: { disabled: true } }],
  gaps: {
    Hover:
      'the border and background come from React state (isHover / isFocus drive inline styles), not CSS pseudo-classes, so no attribute can force them',
    // Every route in is reachable and each one costs more than the gap.
    // autoFocus rides the prop spread onto the inner input and does fire its
    // onFocus, but it carries real document focus with it, and the browser
    // scrolls the page to whatever holds that. The style in baseProps lands
    // last on the wrapper, so a case could hand-paint the border and shadow,
    // at the price of a second copy of values only the component should own.
    // The data-force companion DateRangePicker uses has nothing to mirror
    // here: SearchField paints from inline styles and ships no stylesheet, so
    // it declares no focus rule of its own.
    Focus:
      'the focus border and glow are inline styles the input sets from its own onFocus, so painting them means giving this field real document focus: autoFocus reaches the state, but focus is one element per document, so the page would scroll to this cell on load and the first click elsewhere would blur it back to rest. A case can hand-paint the same border and shadow through style, but that copy drifts from the real values the moment they change',
  },
}
