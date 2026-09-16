// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
import { EnvelopeOpen } from '@phosphor-icons/react'
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateMedia,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
} from '../../../lib/andromeda-pro.generated'
import { Avatar } from '../../../lib/andromeda-pro.generated'
import { Button } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

// Reused from Avatar's image configuration so the two component pages exercise
// the same known portrait and the same built-in image failure fallback.
const PORTRAIT =
  'https://images.unsplash.com/photo-1669287731461-bd8ce3126710?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

export const emptyState: MatrixSpec = {
  slug: 'empty-state',
  Component: EmptyState,
  sizes: null,
  // One case per row, with the empty state itself centred inside it rather
  // than stretched across it: an EmptyState fills whatever region resolved to
  // nothing, and at full row width its corner markers end up a screen away
  // from the content they are meant to frame. The ch cap keeps the frame
  // close to the copy, the same unit the description already measures in.
  wide: true,
  baseProps: { className: 'mx-auto max-w-[52ch]' },
  // The configurations keep the original action and message-only choices,
  // then show the outline frame and the media substitution pattern.
  variants: [
    {
      label: 'With actions',
      props: {},
      children: (
        <>
          <EmptyStateIcon>
            <EnvelopeOpen weight="light" />
          </EmptyStateIcon>
          <EmptyStateTitle>No activity</EmptyStateTitle>
          <EmptyStateDescription>
            Events from the last 30 days will appear here.
          </EmptyStateDescription>
          <EmptyStateAction>
            <Button size="sm">Open log</Button>
            <Button variant="outline" size="sm">
              Refresh
            </Button>
          </EmptyStateAction>
        </>
      ),
    },
    {
      label: 'Message only',
      props: {},
      children: (
        <>
          <EmptyStateIcon>
            <EnvelopeOpen weight="light" />
          </EmptyStateIcon>
          <EmptyStateTitle>No activity</EmptyStateTitle>
          <EmptyStateDescription>Nothing has happened in the last 30 days.</EmptyStateDescription>
        </>
      ),
    },
    {
      label: 'Outline',
      props: { variant: 'outline' },
      children: (
        <>
          <EmptyStateIcon>
            <EnvelopeOpen weight="light" />
          </EmptyStateIcon>
          <EmptyStateTitle>No files yet</EmptyStateTitle>
          <EmptyStateDescription>
            Drop a file here to get started.
          </EmptyStateDescription>
        </>
      ),
    },
    {
      label: 'Avatar',
      props: {},
      children: (
        <>
          <EmptyStateMedia>
            <Avatar name="Reza Quinn" src={PORTRAIT} size="lg" />
          </EmptyStateMedia>
          <EmptyStateTitle>No tasks assigned</EmptyStateTitle>
          <EmptyStateDescription>
            Reza Quinn has nothing scheduled this week.
          </EmptyStateDescription>
        </>
      ),
    },
  ],
  states: [],
}
