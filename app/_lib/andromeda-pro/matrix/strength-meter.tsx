import { StrengthMeter } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

export const strengthMeter: MatrixSpec = {
  slug: 'strength-meter',
  Component: StrengthMeter,
  // No size axis: the meter is as wide as the field above it and as tall as
  // three slats and one word. There is nothing for a rung to change.
  sizes: null,
  // The slats are flex-1, so without this the meter collapses to the width of
  // the word under it and the three steps stop reading as a bar.
  fill: true,
  // Every case is the same component judging a different password, so the
  // thresholds are the component's defaults and only `value` moves. Passwords
  // are the demo data on purpose: a score prop would let a cell claim a
  // strength the component itself would not give that string.
  variants: [
    { label: 'Weak', props: { value: 'sunflower' } },
    // Thirteen characters and one character family: past the length floor,
    // short of the length that carries it alone, and nowhere near three
    // families. Anything with an upper, a digit and a symbol in it would be
    // judged Strong and this cell would repeat the one below it.
    { label: 'Medium', props: { value: 'sunflowerpath' } },
    { label: 'Strong', props: { value: 'correct horse battery' } },
  ],
  states: [],
  gaps: {
    Empty:
      'with no value the meter renders its live region and nothing else, so the cell would be blank; the state is real and is what a field shows before anyone types',
  },
}
