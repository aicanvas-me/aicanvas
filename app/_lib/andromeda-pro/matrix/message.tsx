// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowClockwise, Check, Copy, Sparkle, ThumbsDown, ThumbsUp } from '@phosphor-icons/react'
// v2 component: imported through the build-time shim.
import { Message, MessageActions, MessageAvatar, MessageContent } from '../../../lib/andromeda-pro.generated'
import { Avatar } from '../../../lib/andromeda-pro.generated'
import { IconButton } from '../../../lib/andromeda-pro.generated'
import { Skeleton } from '../../../lib/andromeda-pro.generated'
import { tokens } from '../../../lib/andromeda-pro.generated'
import { SAMPLE_AVATARS } from '../sample-pictures'
import type { MatrixSpec } from './types'

const prose = { margin: 0 }

const USER_TEXT = 'Which Q3 deals are most at risk, and why?'
const ASSISTANT_TEXT =
  'Acme Corp carries the most risk: the deal is in negotiation at $540K and its champion left in August. Northwind is next, stalled at proposal for 41 days.'

// Copy with the moment of feedback Message.rules.md allows: the glyph turns to
// a check and the label to "Copied" for about 1.6s.
function useCopy(text: string) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = () => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }
  return [copied, copy] as const
}

function CopyAction({ text }: { text: string }) {
  const [copied, copy] = useCopy(text)
  return (
    <IconButton
      size="sm"
      variant="ghost"
      icon={copied ? Check : Copy}
      aria-label={copied ? 'Copied' : 'Copy'}
      onClick={copy}
    />
  )
}

export function UserTurn({ text = USER_TEXT, meta = '09:41' }) {
  return (
    <Message from="user">
      <MessageAvatar>
        <Avatar
          size="md"
          name="Mara Quinn"
          src={SAMPLE_AVATARS.butterflyVisor.dark}
          lightSrc={SAMPLE_AVATARS.butterflyVisor.light}
        />
      </MessageAvatar>
      <MessageContent>{text}</MessageContent>
      <MessageActions meta={meta}>
        <CopyAction text={text} />
      </MessageActions>
    </Message>
  )
}

/**
 * A wired assistant turn. Copy copies the answer, the two thumbs hold one
 * rating at a time on IconButton `pressed`, and Regenerate runs the turn
 * again: busy for a moment (the action row withdraws, a Skeleton stands in),
 * then the answer settles. `busy` and `stopped` are where the case starts.
 */
export function AssistantTurn({
  text = ASSISTANT_TEXT,
  busy: startBusy = false,
  stopped = false,
  children,
}: {
  text?: string
  busy?: boolean
  stopped?: boolean
  children?: React.ReactNode
}) {
  const [busy, setBusy] = useState(Boolean(startBusy))
  const [rating, setRating] = useState<'up' | 'down' | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(timer.current), [])
  const rate = (next: 'up' | 'down') => setRating((r) => (r === next ? null : next))
  const regenerate = () => {
    setBusy(true)
    setRating(null)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setBusy(false), 1800)
  }

  return (
    <Message from="assistant" busy={busy}>
      <MessageAvatar>
        <Sparkle size={tokens.iconSize.md} weight="regular" />
      </MessageAvatar>
      <MessageContent>
        {busy ? (
          <div style={{ width: '100%' }}>
            <Skeleton size="md" />
          </div>
        ) : stopped ? (
          // A turn with no answer is the one place the panel drops to
          // text.secondary (Message.rules.md).
          <p style={{ ...prose, color: `var(--andromeda-text-secondary, ${tokens.color.text.secondary})` }}>
            Stopped before it answered.
          </p>
        ) : (
          <>
            <p style={prose}>{text}</p>
            {children}
          </>
        )}
      </MessageContent>
      <MessageActions meta={stopped ? '09:41 · Stopped' : '09:41 · 4 s'}>
        {stopped ? (
          <IconButton size="sm" variant="ghost" icon={ArrowClockwise} aria-label="Regenerate" onClick={regenerate} />
        ) : (
          <>
            <CopyAction text={text} />
            <IconButton
              size="sm"
              variant="ghost"
              icon={ThumbsUp}
              aria-label="Good answer"
              pressed={rating === 'up'}
              onClick={() => rate('up')}
            />
            <IconButton
              size="sm"
              variant="ghost"
              icon={ThumbsDown}
              aria-label="Poor answer"
              pressed={rating === 'down'}
              onClick={() => rate('down')}
            />
            <IconButton size="sm" variant="ghost" icon={ArrowClockwise} aria-label="Regenerate" onClick={regenerate} />
          </>
        )}
      </MessageActions>
    </Message>
  )
}

export const message: MatrixSpec = {
  slug: 'message',
  sizes: null,
  // A turn fills its thread: the user bubble is capped at 80% of it and the
  // assistant panel takes the full width, so each case gets a full row.
  wide: true,
  statePairColumns: true,
  render: (_size, props) => (
    <div style={{ width: '100%', maxWidth: 640 }}>
      {props.from === 'user' ? <UserTurn /> : <AssistantTurn busy={props.busy} stopped={props.stopped} />}
    </div>
  ),
  variants: [
    { label: 'User', props: { from: 'user' } },
    { label: 'Assistant', props: { from: 'assistant' } },
    { label: 'Stopped', props: { from: 'assistant', stopped: true } },
  ],
  // Busy is a prop, so it is an ordinary case; it sits here so the settled
  // turn stands beside it as the Rest baseline.
  states: [{ label: 'Busy', props: { from: 'assistant', busy: true } }],
}
