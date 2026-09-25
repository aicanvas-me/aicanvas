// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Paperclip } from '@phosphor-icons/react'
// v2 component: imported through the build-time shim.
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '../../../lib/andromeda-pro.generated'
import { IconButton } from '../../../lib/andromeda-pro.generated'
import { Tag } from '../../../lib/andromeda-pro.generated'
import { tokens } from '../../../lib/andromeda-pro.generated'
import { CONTROL_STATES, type MatrixSpec } from './types'

/**
 * A wired composer. Attach opens the file picker and each picked file sits in
 * the toolbar as a removable Tag. Send takes the draft and starts a run: the
 * field empties, Send turns to Stop, and the run settles by itself after a
 * moment or at once on Stop. `draft` and `status` are where a case starts; a
 * case that starts streaming keeps running until Stop is pressed.
 * `tools` is extra left-hand toolbar content (a model picker in the demo).
 */
export function LiveComposer({
  draft: startDraft = '',
  status: startStatus = 'ready',
  tools,
  placeholder = 'Ask about your pipeline',
}: {
  draft?: string
  status?: 'ready' | 'streaming'
  tools?: ReactNode
  placeholder?: string
}) {
  const [draft, setDraft] = useState(startDraft)
  const [status, setStatus] = useState<'ready' | 'streaming'>(startStatus)
  const [files, setFiles] = useState<string[]>([])
  const picker = useRef<HTMLInputElement>(null)
  const run = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(run.current), [])

  const stop = () => {
    clearTimeout(run.current)
    setStatus('ready')
  }
  const send = () => {
    setDraft('')
    setFiles([])
    setStatus('streaming')
    clearTimeout(run.current)
    run.current = setTimeout(() => setStatus('ready'), 2400)
  }

  return (
    <PromptInput status={status} onStop={stop} onSubmit={send} style={{ width: '100%' }}>
      <PromptInputTextarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
      />
      <PromptInputToolbar>
        <PromptInputTools>
          <input
            ref={picker}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              const picked = [...(e.target.files ?? [])].map((f) => f.name)
              setFiles((prev) => [...prev, ...picked.filter((n) => !prev.includes(n))])
              e.target.value = ''
            }}
          />
          <IconButton size="sm" variant="ghost" icon={Paperclip} aria-label="Attach files" onClick={() => picker.current?.click()} />
          {tools}
          {files.map((name) => (
            <Tag key={name} onClose={() => setFiles((prev) => prev.filter((n) => n !== name))}>
              {name}
            </Tag>
          ))}
        </PromptInputTools>
        <PromptInputSubmit />
      </PromptInputToolbar>
    </PromptInput>
  )
}

export const promptInput: MatrixSpec = {
  slug: 'prompt-input',
  sizes: null,
  // The box is w-full by design and a composer wants the whole row.
  fill: true,
  wide: true,
  statePairColumns: true,
  render: (_size, props) => (
    <div style={{ width: '100%', maxWidth: 640 }}>
      <LiveComposer {...props} />
    </div>
  ),
  // The frame draws the FIELD's focus through a Tailwind `:has(textarea:...)`
  // arbitrary variant, which the gated focus variants in globals.css cannot
  // reach, so this is the at-rest twin of those two declarations.
  forcedStateCss: `
    :where([data-andromeda-matrix]) [data-force~="focus"] [data-slot="prompt-input"] {
      border-color: var(--andromeda-focus-ring, ${tokens.color.focus.ring});
      box-shadow: 0 0 0 var(--andromeda-border-width, ${tokens.border.width[1]}) var(--andromeda-focus-ring, ${tokens.color.focus.ring});
    }
  `,
  // The status axis, plus the one thing that arms Send: words in the field.
  variants: [
    { label: 'Ready', props: {} },
    { label: 'With draft', props: { draft: 'Summarize the three riskiest Q3 deals' } },
    { label: 'Streaming', props: { status: 'streaming' } },
  ],
  states: [CONTROL_STATES.find((s) => s.label === 'Focus visible')!],
  gaps: {
    Hover: 'the box has no hover of its own; the toolbar buttons carry theirs, forced on the Icon Button page',
    'Send armed':
      'Send arms from the field holding words, which is the With draft case, not a state an attribute can fire',
  },
}
