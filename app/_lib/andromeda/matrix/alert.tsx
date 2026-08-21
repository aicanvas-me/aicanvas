// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
import { Info, Pulse, Warning } from '@phosphor-icons/react'
import {
  Alert,
  AlertIcon,
  AlertContent,
  AlertTitle,
  AlertDescription,
} from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

// Each variant carries its own icon and copy, because the severity is the
// point: a fault banner illustrated with an info glyph teaches the wrong thing.
const body = (Icon: unknown, title: string, description: string) => (
  <>
    <AlertIcon>
      <Icon weight="light" />
    </AlertIcon>
    <AlertContent>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </AlertContent>
  </>
)

export const alert: MatrixSpec = {
  slug: 'alert',
  Component: Alert,
  // No size axis in the source: an alert is a full-width banner.
  sizes: null,
  // NOT wide. An alert stretches to its container, but its content is one line
  // of title plus one of description, so two per row stay readable and the four
  // variants read as one 2x2 comparison instead of a scroll.
  wide: false,
  variants: [
    {
      label: 'Default',
      props: { variant: 'default' },
      children: body(Info, 'All good', 'Every service is running normally.'),
    },
    {
      label: 'Accent',
      props: { variant: 'accent' },
      children: body(Pulse, 'New activity', '3 new events in the last hour.'),
    },
    {
      label: 'Warning',
      props: { variant: 'warning' },
      children: body(Warning, 'Caution', 'Storage is at 88% of your limit.'),
    },
    {
      label: 'Fault',
      props: { variant: 'fault' },
      children: body(Warning, 'Connection lost', 'Reconnecting. ETA 8 seconds.'),
    },
  ],
  // A banner is not interactive; the source declares no hover, focus or
  // pressed treatment, so it gets no states grid rather than four copies of
  // its own baseline.
  states: [],
}
