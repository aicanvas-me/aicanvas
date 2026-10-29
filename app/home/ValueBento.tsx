// "Why AI Canvas": seven cells in one frame split by hairlines (wide +
// narrow, three equal, narrow + wide). Each cell shows a quiet piece of real
// UI that fades into the page (the install in a terminal, a prompt to an
// agent, where the work may ship, the AI Brain's checks, the stack, the MIT
// licence, the Premium panel), with its claim at the bottom left. CSS only,
// server component; the one moving part is a text caret, still under reduced
// motion.

import type { ReactNode } from 'react'
import {
  ArrowUp,
  Brain,
  BracketsCurly,
  Browser,
  CaretDown,
  Check,
  Cube,
  LockOpen,
  Sparkle,
  SquaresFour,
  TerminalWindow,
} from '@phosphor-icons/react/dist/ssr'
import { Reveal } from './Reveal'
import { ClaudeMark, CodexMark, CursorMark } from '../mcp/InstallCards'

const TITLE = 'text-base font-semibold text-sand-900 dark:text-sand-50'
const BODY = 'mt-2 text-[15px] leading-relaxed text-sand-600 dark:text-sand-400'

// The surfaces every picture draws with: a panel and a row inside it, both a
// step off the page, so the pictures stay quieter than the words.
const PANEL = 'rounded-card border border-sand-200 bg-sand-100/70 dark:border-sand-800 dark:bg-sand-900/60'
const ROW =
  'flex items-center gap-2.5 whitespace-nowrap rounded-control border border-sand-200 bg-sand-100/80 px-3 py-2 dark:border-sand-800 dark:bg-sand-900/70'
const MUTED = 'text-sand-600 dark:text-sand-400'
const STRONG = 'text-sand-900 dark:text-sand-100'
const LABEL = `font-mono text-[11px] ${MUTED}`

// How each picture leaves the cell: off the right and bottom edges, off the
// bottom only, or out from the middle.
const FADE_RIGHT_BOTTOM =
  '[mask-image:linear-gradient(to_right,#000_50%,transparent_96%),linear-gradient(to_bottom,#000_45%,transparent_96%)] [mask-composite:intersect]'
const FADE_BOTTOM = '[mask-image:linear-gradient(to_bottom,#000_40%,transparent_96%)]'
const FADE_MIDDLE = '[mask-image:radial-gradient(ellipse_62%_68%_at_50%_50%,#000_35%,transparent_100%)]'

const CARET = `
.vb-caret { animation: vb-blink 1.1s steps(1) infinite }
@keyframes vb-blink { 50% { opacity: 0 } }
@media (prefers-reduced-motion: reduce) { .vb-caret { animation: none } }
`

function Caret() {
  return <span className="vb-caret ml-0.5 inline-block h-[1.1em] w-px translate-y-[0.2em] bg-sand-900 dark:bg-sand-100" />
}

function Cell({
  title,
  children,
  art,
  fade,
  span = '',
  delay = 0,
}: {
  title: string
  children: ReactNode
  art: ReactNode
  fade: string
  span?: string
  delay?: number
}) {
  // The cell carries the page colour so the frame's hairlines show only in
  // the gaps; the reveal moves what sits inside it.
  return (
    <div className={`bg-sand-50 dark:bg-sand-950 ${span}`}>
      <Reveal y={12} delay={delay} className="flex h-full flex-col">
        <div aria-hidden className={`relative h-60 overflow-hidden sm:h-72 ${fade}`}>
          {art}
        </div>
        <div className="mt-auto max-w-md px-6 pb-7 pt-2 sm:px-8 sm:pb-8">
          <h3 className={TITLE}>{title}</h3>
          <p className={BODY}>{children}</p>
        </div>
      </Reveal>
    </div>
  )
}

// Real source: the install as it runs, then the file opened in an editor.
function InstallTerminal() {
  const done = <span className="text-success">✔</span>
  return (
    <div className={`${PANEL} absolute -right-12 left-6 top-10 p-5 font-mono text-[12px] leading-6 sm:left-12 sm:top-12 sm:p-6 sm:text-[13px] sm:leading-7`}>
      <p className={STRONG}>
        <span className="select-none text-sand-500">$ </span>npx shadcn@latest add @aicanvas/noise-bg
      </p>
      <div className={`mt-3 ${MUTED}`}>
        <p>{done} Checking registry.</p>
        <p>{done} Installing dependencies.</p>
        <p>{done} Created 1 file:</p>
        <p className="pl-4">
          - <span className={STRONG}>components/aicanvas/noise-bg.tsx</span>
        </p>
      </div>
      <p className={`mt-3 ${STRONG}`}>
        <span className="select-none text-sand-500">$ </span>code components/aicanvas/noise-bg.tsx
        <Caret />
      </p>
    </div>
  )
}

// By hand or by agent: the prompt, with the MCP tool it reaches for above it.
function AgentComposer() {
  return (
    <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 sm:inset-x-8">
      <p className={`mb-2 flex items-center gap-1.5 px-1 ${LABEL}`}>
        <span className="size-1.5 rounded-full bg-accent" />
        aicanvas · search_components
      </p>
      <div className={`${PANEL} p-3`}>
        <p className={`min-h-[3.25rem] text-[13px] leading-relaxed ${STRONG}`}>
          Add a pricing section from AI Canvas with three plans
          <Caret />
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className={`flex items-center gap-1.5 text-[11px] font-medium ${MUTED}`}>
            <span className="flex -space-x-1">
              {[
                { mark: <ClaudeMark />, cls: 'text-[#D97757]' },
                { mark: <CursorMark />, cls: STRONG },
                { mark: <CodexMark />, cls: STRONG },
              ].map(({ mark, cls }, i) => (
                <span
                  key={i}
                  className={`flex size-5 items-center justify-center rounded-full border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950 [&>svg]:size-3 ${cls}`}
                >
                  {mark}
                </span>
              ))}
            </span>
            Any agent
            <CaretDown weight="regular" size={10} />
          </span>
          <span className="ml-auto flex size-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <ArrowUp weight="regular" size={14} />
          </span>
        </div>
      </div>
    </div>
  )
}

// Commercial use: the kinds of project the work can ship in.
function ProjectList() {
  const projects = [
    { letter: 'C', name: 'Client site', tag: 'Client work', note: 'delivered and billed' },
    { letter: 'P', name: 'Your product', tag: 'Commercial', note: 'sold to your customers' },
    { letter: 'S', name: 'Side project', tag: 'Personal', note: 'yours to keep' },
  ]
  return (
    <div className="absolute -right-8 left-6 top-10 flex flex-col gap-2 sm:left-8">
      <p className={`mb-1 ${LABEL}`}>Projects</p>
      {projects.map(({ letter, name, tag, note }) => (
        <div key={name} className={ROW}>
          <span className="flex size-5 shrink-0 items-center justify-center rounded-tag bg-sand-200 text-[10px] font-bold text-sand-700 dark:bg-sand-800 dark:text-sand-300">
            {letter}
          </span>
          <span className={`text-[13px] font-medium ${STRONG}`}>{name}</span>
          <span className="rounded-full border border-success/30 bg-success/10 px-1.5 py-px text-[10px] font-semibold text-success">
            {tag}
          </span>
          <span className={`text-[12px] ${MUTED}`}>{note}</span>
        </div>
      ))}
    </div>
  )
}

// The agent extends the system: a new screen and the checks it passed.
function BrainChecks() {
  const checks = [
    { name: 'Tokens', note: 'no raw colours' },
    { name: 'Components', note: 'from the system' },
    { name: 'Spacing', note: 'on the scale' },
    { name: 'Contrast', note: 'passes AA' },
  ]
  return (
    <div className="absolute -right-8 left-6 top-10 sm:left-8">
      <p className={LABEL}>AI Brain · pricing-page.tsx</p>
      <p className={`mt-1 text-[15px] font-semibold ${STRONG}`}>New screen, checked</p>
      <div className="mt-3 flex flex-col gap-2">
        {checks.map(({ name, note }) => (
          <div key={name} className={ROW}>
            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-success text-sand-50 dark:text-sand-950">
              <Check weight="regular" size={10} />
            </span>
            <span className={`text-[13px] font-medium ${STRONG}`}>{name}</span>
            <span className={`text-[12px] ${MUTED}`}>{note}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// The stack, as a wall of tiles: shadcn in the middle, lit; the rest of the
// stack around it in one quiet tone.
type Tile = { name: string; art?: ReactNode; focus?: boolean }

const STACK_ROWS: Tile[][] = [
  [
    { name: 'blank-a' },
    {
      name: 'TypeScript',
      art: (
        <span className="flex size-6 items-end justify-end rounded-[4px] bg-current px-0.5 pb-px">
          <span className="text-[10px] font-bold leading-none text-sand-50 dark:text-sand-950">TS</span>
        </span>
      ),
    },
    {
      name: 'Next.js',
      art: (
        <svg viewBox="0 0 180 180" className="size-6">
          <circle cx="90" cy="90" r="90" fill="currentColor" />
          <path d="M149.5 157.5 69.1 54H54v72h12.1V69.4l73.9 95.4a90.4 90.4 0 0 0 9.5-7.3Z" className="fill-sand-50 dark:fill-sand-950" />
          <rect x="115" y="54" width="12" height="72" className="fill-sand-50 dark:fill-sand-950" />
        </svg>
      ),
    },
    { name: 'blank-b' },
  ],
  [
    { name: 'blank-c' },
    {
      name: 'Tailwind CSS',
      art: (
        <svg viewBox="0 0 24 24" className="size-6" fill="currentColor">
          <path d="M12 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.91.23 1.57.89 2.29 1.62C13.67 10.62 15.03 12 18 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.91-.23-1.57-.89-2.29-1.62C16.34 6.18 14.98 4.8 12 4.8ZM6 12c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.91.23 1.57.89 2.29 1.62 1.18 1.2 2.54 2.58 5.51 2.58 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.91-.23-1.57-.89-2.29-1.62C10.34 13.38 8.98 12 6 12Z" />
        </svg>
      ),
    },
    {
      name: 'shadcn',
      focus: true,
      art: (
        <svg viewBox="0 0 256 256" className="size-7" fill="none" stroke="currentColor" strokeWidth="24" strokeLinecap="round">
          <line x1="208" y1="128" x2="128" y2="208" />
          <line x1="192" y1="40" x2="40" y2="192" />
        </svg>
      ),
    },
    {
      name: 'React',
      art: (
        <svg viewBox="-11.5 -10.23 23 20.46" className="size-6">
          <circle r="2.05" fill="currentColor" />
          <g fill="none" stroke="currentColor" strokeWidth="1.1">
            <ellipse rx="11" ry="4.2" />
            <ellipse rx="11" ry="4.2" transform="rotate(60)" />
            <ellipse rx="11" ry="4.2" transform="rotate(120)" />
          </g>
        </svg>
      ),
    },
    { name: 'blank-d' },
  ],
  [
    { name: 'blank-e' },
    { name: 'CLI', art: <TerminalWindow weight="regular" size={22} /> },
    { name: 'Code', art: <BracketsCurly weight="regular" size={22} /> },
    { name: 'blank-f' },
  ],
]

function StackWall() {
  return (
    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
      {STACK_ROWS.map((row, i) => (
        <div key={i} className="flex gap-2">
          {row.map(({ name, art, focus }) => (
            <span
              key={name}
              className={`flex size-14 shrink-0 items-center justify-center rounded-card border ${
                focus
                  ? 'border-sand-300 bg-sand-100 text-sand-900 shadow-[0_2px_4px_rgba(0,0,0,0.06),0_12px_24px_-8px_rgba(0,0,0,0.2)] dark:border-sand-700 dark:bg-sand-800 dark:text-sand-50 dark:shadow-[0_2px_4px_rgba(0,0,0,0.4),0_12px_24px_-8px_rgba(0,0,0,0.7)]'
                  : 'border-sand-200 bg-sand-100/70 text-sand-500 dark:border-sand-800 dark:bg-sand-900/60'
              }`}
            >
              {art}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

// Free means MIT: the licence file itself.
function LicenceFile() {
  return (
    <div className={`${PANEL} absolute -right-8 left-6 top-10 overflow-hidden sm:left-8`}>
      <div className={`flex items-center justify-between border-b border-sand-200 px-4 py-2 dark:border-sand-800 ${LABEL}`}>
        <span>LICENSE</span>
        <span className="text-success">MIT</span>
      </div>
      <div className={`p-4 font-mono text-[11px] leading-5 ${MUTED}`}>
        <p className={STRONG}>MIT License</p>
        <p className="mt-3">Copyright (c) 2026 AI Canvas</p>
        <p className="mt-3">
          Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
          documentation files, to deal in the Software without restriction, including without limitation the rights to
          use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.
        </p>
      </div>
    </div>
  )
}

// What Premium opens, as the panel a member sees.
function Included() {
  const rows: { icon: ReactNode; name: string; note: string }[] = [
    { icon: <SquaresFour weight="regular" size={15} />, name: 'Andromeda Pro', note: 'the full design system' },
    { icon: <Browser weight="regular" size={15} />, name: 'Pro templates', note: 'whole apps, ready to edit' },
    { icon: <Brain weight="regular" size={15} />, name: 'The AI Brain', note: 'the system, for your agent' },
    { icon: <Cube weight="regular" size={15} />, name: 'Premium standalones', note: 'every premium piece' },
    { icon: <Sparkle weight="regular" size={15} />, name: 'New releases', note: 'included as they ship' },
  ]
  return (
    <div className={`${PANEL} absolute -right-12 left-6 top-10 p-2 sm:left-12 sm:top-12 lg:right-auto lg:w-[560px]`}>
      <div className="flex items-center justify-between px-3 py-2">
        <span className={`text-[13px] font-semibold ${STRONG}`}>Premium</span>
        <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
          <span className="size-1.5 rounded-full bg-success" />
          Active
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {rows.map(({ icon, name, note }) => (
          <div key={name} className={ROW}>
            <span className={MUTED}>{icon}</span>
            <span className={`text-[13px] font-medium ${STRONG}`}>{name}</span>
            <span className={`text-[12px] ${MUTED}`}>{note}</span>
            <LockOpen weight="regular" size={14} className="ml-auto shrink-0 text-sand-500" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ValueBento({ freeTotal }: { freeTotal: number }) {
  // Reading order: what you get (source), how you work (by hand or agent),
  // what you may do with it, then free and Premium last, right above the plans.
  return (
    // Two columns on a tablet (the install cell spans both, the rest pair up),
    // three from lg with a wide cell opening and closing the frame.
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-section border border-sand-200 bg-sand-200 md:grid-cols-2 lg:grid-cols-3 dark:border-sand-800 dark:bg-sand-800">
      <style>{CARET}</style>
      <Cell span="md:col-span-2" title="Real source, in your repo." art={<InstallTerminal />} fade={FADE_RIGHT_BOTTOM}>
        The shadcn CLI copies the component files into your project, ready to read and edit. Nothing is locked in a
        package.
      </Cell>
      <Cell title="Build by hand or with an agent." art={<AgentComposer />} fade={FADE_MIDDLE} delay={0.06}>
        Use the catalog yourself, or let Claude Code, Cursor, Codex or any MCP client browse and install it for you.
      </Cell>

      <Cell title="Commercial work is allowed." art={<ProjectList />} fade={FADE_RIGHT_BOTTOM}>
        Client projects and your own products alike. The MIT library and the Premium License both allow personal and
        commercial use.
      </Cell>
      <Cell title="A system your agent can extend." art={<BrainChecks />} fade={FADE_RIGHT_BOTTOM} delay={0.06}>
        The AI Brain hands your agent the whole system, so new screens and new components fit, and scripts check the
        work before it calls it done.
      </Cell>
      <Cell title="The stack you already use." art={<StackWall />} fade={FADE_MIDDLE} delay={0.12}>
        React, TypeScript and Tailwind CSS, with Framer Motion for movement, installed by the shadcn CLI into the
        project you already have.
      </Cell>

      <Cell title="Free means MIT." art={<LicenceFile />} fade={FADE_BOTTOM}>
        {freeTotal} free standalones and Andromeda Legacy are open source under MIT. Install them, change them, ship
        them.
      </Cell>
      <Cell span="lg:col-span-2" title="Premium opens the whole catalog." art={<Included />} fade={FADE_RIGHT_BOTTOM} delay={0.06}>
        One subscription unlocks Andromeda Pro and its templates, the AI Brain and every premium standalone, with new
        pieces included as they ship. Monthly or yearly, cancel anytime.
      </Cell>
    </div>
  )
}
