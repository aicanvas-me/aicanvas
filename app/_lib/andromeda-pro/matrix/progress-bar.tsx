import { ProgressBar } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

export const progressBar: MatrixSpec = {
  slug: 'progress-bar',
  Component: ProgressBar,
  sizes: null,
  wide: true,
  // Configurations, not variants: the reading picks the colour. Empty and Full
  // carry no thresholds — they demonstrate the 0 and 100 ends of the fill, not
  // a tone.
  variants: [
    { label: 'Within limits', props: { label: 'Storage used', value: 72, thresholds: { warning: 85, fault: 95 } } },
    { label: 'Nearing limit', props: { label: 'Bandwidth', value: 88, thresholds: { warning: 85, fault: 95 } } },
    { label: 'Critical', props: { label: 'Memory', value: 91, thresholds: { warning: 75, fault: 90 } } },
    { label: 'Empty', props: { label: 'Queue', value: 0 } },
    { label: 'Full', props: { label: 'Sync', value: 100 } },
  ],
  states: [],
}
