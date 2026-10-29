// "Why AI Canvas": seven cards in three rows (wide + narrow, three equal,
// narrow + wide), each a short claim with a small picture of it. Every picture
// is drawn UI on the hero map's wells (the repo, the licence, the system, the
// stack, the free library, the Premium panel), CSS and inline SVG only.
// Server component; hover moves a picture a little, nothing loops.

import type { ReactNode } from 'react'
import { Brain, Browser, Check, Cube, LockOpen, Plus, Sparkle, SquaresFour } from '@phosphor-icons/react/dist/ssr'
import { Reveal } from './Reveal'
import { ClaudeMark, CodexMark, CursorMark } from '../mcp/InstallCards'

const CARD =
  'group relative flex h-full flex-col overflow-hidden rounded-section border border-sand-200 bg-gradient-to-b from-sand-100 to-sand-50 p-6 transition-[transform,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-sand-300 sm:p-8 dark:border-sand-800 dark:from-sand-900 dark:to-sand-950 dark:hover:border-sand-700'
const TITLE = 'text-base font-semibold text-sand-900 dark:text-sand-50'
const BODY = 'mt-2 text-[15px] leading-relaxed text-sand-600 dark:text-sand-400'

function Copy({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className={TITLE}>{title}</h3>
      <p className={BODY}>{children}</p>
    </div>
  )
}

// The inset surface every picture draws on: the hero map's well.
const WELL = 'rounded-card border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950'
const LIFT =
  'shadow-[0_2px_4px_rgba(0,0,0,0.06),0_10px_20px_-8px_rgba(0,0,0,0.18)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.4),0_12px_24px_-8px_rgba(0,0,0,0.7)]'
const OK = 'text-success'

// The installed file in its folder beside the one line already changed: the
// source is in the repo and it is yours to edit.
function RepoDiff() {
  const tree: { name: string; depth: number; on?: boolean; added?: boolean }[] = [
    { name: 'app', depth: 0 },
    { name: 'components', depth: 0 },
    { name: 'aicanvas', depth: 1 },
    { name: 'slice-type.tsx', depth: 2, on: true, added: true },
    { name: 'pricing.tsx', depth: 2, added: true },
    { name: 'ui', depth: 1 },
    { name: 'lib', depth: 0 },
  ]
  return (
    <div className={`${WELL} overflow-hidden font-mono text-[11px] leading-6`}>
      <div className="flex items-center justify-between border-b border-sand-200 px-3 py-1.5 text-sand-600 dark:border-sand-800 dark:text-sand-400">
        <span className="truncate">your-app / components / aicanvas</span>
        <span className={`shrink-0 ${OK}`}>+2 files</span>
      </div>
      <div className="grid md:grid-cols-[132px_1fr]">
        <ul className="hidden border-r border-sand-200 py-2 md:block dark:border-sand-800">
          {tree.map(({ name, depth, on, added }) => (
            <li
              key={name}
              className={`flex items-center justify-between pr-2 ${on ? 'bg-sand-200/70 text-sand-900 dark:bg-sand-800/70 dark:text-sand-50' : 'text-sand-600 dark:text-sand-400'}`}
              style={{ paddingLeft: 12 + depth * 10 }}
            >
              <span className="truncate">{name.includes('.') ? name : `${name}/`}</span>
              {added && <span className={OK}>A</span>}
            </li>
          ))}
        </ul>
        <div className="min-w-0 py-2 text-sand-700 dark:text-sand-300">
          {[
            { n: 12, t: 'export default function SliceType() {' },
            { n: 13, t: '  return <div className="rounded-card">', mark: '-' },
            { n: 13, t: '  return <div className="rounded-section">', mark: '+' },
            { n: 14, t: '    <Slice label={label} />' },
            { n: 15, t: '}' },
          ].map(({ n, t, mark }, i) => (
            <p
              key={i}
              className={`flex whitespace-pre ${
                mark === '+'
                  ? 'bg-success/10 text-sand-900 dark:text-sand-50'
                  : mark === '-'
                    ? 'text-sand-500 line-through decoration-sand-400/60 dark:decoration-sand-600'
                    : ''
              }`}
            >
              <span className="w-7 shrink-0 select-none pr-2 text-right text-sand-400 dark:text-sand-600">{n}</span>
              <span className={`w-3 shrink-0 select-none ${mark === '+' ? OK : 'text-sand-400 dark:text-sand-600'}`}>{mark ?? ''}</span>
              <span className="min-w-0 truncate">{t}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

// Two ways in, one result: a prompt from any agent and a click in the catalog
// both land the same component.
function TwoWaysIn() {
  const marks = [
    { mark: <ClaudeMark />, cls: 'text-[#D97757]' },
    { mark: <CursorMark />, cls: 'text-sand-900 dark:text-sand-100' },
    { mark: <CodexMark />, cls: 'text-sand-900 dark:text-sand-100' },
  ]
  return (
    <div className="relative mx-auto h-44 w-full max-w-[260px]">
      {/* The component both paths produce. */}
      <div className={`${WELL} ${LIFT} absolute inset-x-5 bottom-5 top-11 flex flex-col gap-2 p-3 transition-transform duration-500 ease-out group-hover:-translate-y-0.5`}>
        <span className="block h-2 w-12 rounded-tag bg-sand-300 dark:bg-sand-700" />
        <span className="block text-lg font-bold leading-none text-sand-900 dark:text-sand-50">
          $29<span className="text-[10px] font-medium text-sand-600 dark:text-sand-400"> /mo</span>
        </span>
        <span className="block h-1.5 w-3/4 rounded-tag bg-sand-200 dark:bg-sand-800" />
        <span className="mt-auto block h-5 rounded-control bg-accent" />
      </div>
      {/* By agent: the prompt. */}
      <div className={`${LIFT} absolute left-0 top-0 flex items-center gap-2 rounded-full border border-sand-200 bg-sand-50 py-1 pl-1 pr-3 text-[11px] font-medium text-sand-700 transition-transform duration-500 ease-out group-hover:-translate-x-1 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300`}>
        <span className="flex -space-x-1.5">
          {marks.map(({ mark, cls }, i) => (
            <span
              key={i}
              className={`flex size-5 items-center justify-center rounded-full border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-950 [&>svg]:size-3 ${cls}`}
            >
              {mark}
            </span>
          ))}
        </span>
        Add a pricing card
      </div>
      {/* By hand: the click. */}
      <div className="absolute bottom-0 right-0 transition-transform duration-500 ease-out group-hover:translate-x-1">
        <span className={`${LIFT} flex h-7 items-center rounded-full border border-sand-200 bg-sand-50 px-3 text-[11px] font-semibold text-sand-900 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-50`}>
          Install
        </span>
        <svg viewBox="0 0 16 16" className="absolute -bottom-2.5 left-9 size-4 drop-shadow-sm" aria-hidden>
          <path d="M2 1.5 13 7.2 8 8.6 5.8 13.6Z" className="fill-sand-900 stroke-sand-50 dark:fill-sand-50 dark:stroke-sand-950" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

// A licence read the way a buyer reads one: what am I allowed to do.
function LicenceSheet() {
  const rows = ['Personal projects', 'Client projects', 'Your own products']
  return (
    <div className={`${WELL} ${LIFT} mx-auto w-full max-w-[240px] p-4 transition-transform duration-500 ease-out group-hover:-translate-y-0.5`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-sand-600 dark:text-sand-400">Licence</span>
        <span className="flex gap-1">
          {['MIT', 'Premium'].map((l) => (
            <span key={l} className="rounded-full border border-sand-300 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-sand-700 dark:border-sand-700 dark:text-sand-300">
              {l}
            </span>
          ))}
        </span>
      </div>
      <ul className="mt-3 divide-y divide-sand-200 dark:divide-sand-800">
        {rows.map((r) => (
          <li key={r} className="flex items-center justify-between py-2 text-[12px] font-medium text-sand-800 dark:text-sand-200">
            {r}
            <span className="flex size-4 items-center justify-center rounded-full bg-success/15">
              <Check weight="regular" size={10} className={OK} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// The system the agent already holds, a new piece joining it, and the checks
// it passes before the work is called done.
function SystemGrows() {
  const glyphs: ReactNode[] = [
    <span key="b" className="block h-2.5 w-8 rounded-control bg-accent" />,
    <span key="t" className="relative block h-2.5 w-5 rounded-full bg-sand-300 dark:bg-sand-700"><span className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-sand-50" /></span>,
    <span key="a" className="block size-4 rounded-full bg-sand-300 dark:bg-sand-700" />,
    <span key="i" className="block h-2.5 w-9 rounded-control border border-sand-300 dark:border-sand-700" />,
    <span key="c" className="block h-2.5 w-6 rounded-full border border-sand-300 dark:border-sand-700" />,
  ]
  return (
    <div className="mx-auto w-full max-w-[236px]">
      <div className="grid grid-cols-3 gap-1.5">
        {glyphs.map((g, i) => (
          <span key={i} className={`${WELL} flex h-11 items-center justify-center`}>
            {g}
          </span>
        ))}
        <span className="flex h-11 items-center justify-center rounded-card border border-dashed border-sand-400 text-sand-600 transition-colors duration-300 group-hover:border-solid group-hover:bg-sand-50 dark:border-sand-600 dark:text-sand-400 dark:group-hover:bg-sand-950">
          <Plus weight="regular" size={14} />
        </span>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {['Tokens', 'Radius', 'States'].map((c) => (
          <span key={c} className="flex items-center gap-1 rounded-full border border-sand-200 bg-sand-50 px-2 py-0.5 text-[10px] font-semibold text-sand-700 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-300">
            <Check weight="regular" size={10} className={OK} />
            {c}
          </span>
        ))}
      </div>
    </div>
  )
}

const STACK: { name: string; art: ReactNode }[] = [
  {
    name: 'React',
    art: (
      <svg viewBox="-11.5 -10.23 23 20.46" className="size-4" aria-hidden>
        <circle r="2.05" fill="#58C4DC" />
        <g fill="none" stroke="#58C4DC" strokeWidth="1.2">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    ),
  },
  {
    name: 'TypeScript',
    art: (
      <span aria-hidden className="flex size-4 items-end justify-end rounded-[3px] bg-[#3178C6] px-px pb-px text-[7px] font-bold leading-none text-white">
        TS
      </span>
    ),
  },
  {
    name: 'Tailwind CSS',
    art: (
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
        <path
          fill="#38BDF8"
          d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"
        />
      </svg>
    ),
  },
  {
    name: 'shadcn CLI',
    art: (
      <svg viewBox="0 0 256 256" className="size-4 text-sand-900 dark:text-sand-50" aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth="26" strokeLinecap="round">
          <line x1="208" y1="128" x2="128" y2="208" />
          <line x1="192" y1="40" x2="40" y2="192" />
        </g>
      </svg>
    ),
  },
]

// The stack as layers resting on the project you already have; on hover they
// fan out a little, like plates lifted off a pile.
function LayerStack() {
  return (
    <div className="mx-auto flex w-full max-w-[220px] flex-col gap-1.5">
      {STACK.map(({ name, art }, i) => (
        <span
          key={name}
          className={`${WELL} flex h-8 items-center gap-2.5 px-3 text-[12px] font-medium text-sand-800 transition-transform duration-500 ease-out dark:text-sand-200`}
          style={{ transform: `translateX(${(STACK.length - 1 - i) * 3}px)` }}
        >
          {art}
          {name}
        </span>
      ))}
      <span className="flex h-8 items-center justify-center rounded-card border border-dashed border-sand-400 font-mono text-[11px] text-sand-600 dark:border-sand-600 dark:text-sand-400">
        your project
      </span>
    </div>
  )
}

// One square per free piece, a few lit at random, so the size of the free
// library reads at a glance.
function FreeMosaic({ count }: { count: number }) {
  return (
    <div className="mx-auto w-full max-w-[260px]">
      <div className="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-1">
        {Array.from({ length: count }, (_, i) => {
          const lit = (i * 7) % 11 === 0
          return (
            <span
              key={i}
              className={`block aspect-square rounded-[3px] transition-colors duration-500 ${
                lit
                  ? 'bg-accent'
                  : i % 2
                    ? 'bg-sand-200 group-hover:bg-sand-300 dark:bg-sand-800 dark:group-hover:bg-sand-700'
                    : 'bg-sand-200 dark:bg-sand-800'
              }`}
            />
          )
        })}
      </div>
      <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-sand-600 dark:text-sand-400">
        <span>{count} free</span>
        <span>MIT</span>
      </div>
    </div>
  )
}

// What Premium opens, as the panel a member sees: everything included.
function Included() {
  const rows: { icon: ReactNode; name: string }[] = [
    { icon: <SquaresFour weight="regular" size={14} />, name: 'Andromeda Pro' },
    { icon: <Browser weight="regular" size={14} />, name: 'Pro templates' },
    { icon: <Brain weight="regular" size={14} />, name: 'The AI Brain' },
    { icon: <Cube weight="regular" size={14} />, name: 'Premium standalones' },
    { icon: <Sparkle weight="regular" size={14} />, name: 'New releases' },
  ]
  return (
    <div className={`${WELL} ${LIFT} w-full max-w-[340px] p-2 transition-transform duration-500 ease-out group-hover:-translate-y-0.5`}>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[13px] font-semibold text-sand-900 dark:text-sand-50">Premium</span>
        <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
          <span className="size-1.5 rounded-full bg-success" />
          Active
        </span>
      </div>
      <ul className="flex flex-col gap-1">
        {rows.map(({ icon, name }) => (
          <li
            key={name}
            className="flex items-center gap-3 rounded-control border border-sand-200 bg-sand-100 px-3 py-2 text-[12px] font-medium text-sand-800 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-200"
          >
            <span className="text-sand-600 dark:text-sand-400">{icon}</span>
            {name}
            <LockOpen weight="regular" size={14} className="ml-auto text-sand-500" />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ValueBento({ freeTotal }: { freeTotal: number }) {
  // Reading order: what you get (source), how you work (by hand or agent),
  // what you may do with it, then free and Premium last, right above the plans.
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Row 1 */}
      <Reveal y={12} className="h-full lg:col-span-2">
        <div className={`${CARD} sm:flex-row sm:items-center sm:gap-10`}>
          <div className="order-2 mt-8 sm:order-1 sm:mt-0 sm:max-w-xs">
            <Copy title="Real source, in your repo.">
              The shadcn CLI copies the component files into your project, ready to read and edit. Nothing is locked in a
              package.
            </Copy>
          </div>
          <div className="order-1 min-w-0 flex-1 sm:order-2">
            <RepoDiff />
          </div>
        </div>
      </Reveal>
      <Reveal y={12} delay={0.06} className="h-full">
        <div className={CARD}>
          <div className="flex flex-1 items-center justify-center py-6">
            <TwoWaysIn />
          </div>
          <Copy title="Build by hand or with an agent.">
            Use the catalog yourself, or let Claude Code, Cursor, Codex or any MCP client browse and install it for you.
          </Copy>
        </div>
      </Reveal>

      {/* Row 2 */}
      <Reveal y={12} className="h-full">
        <div className={CARD}>
          <div className="flex flex-1 items-center justify-center py-6">
            <LicenceSheet />
          </div>
          <Copy title="Commercial work is allowed.">
            Client projects and your own products alike. The MIT library and the Premium License both allow personal and
            commercial use.
          </Copy>
        </div>
      </Reveal>
      <Reveal y={12} delay={0.06} className="h-full">
        <div className={CARD}>
          <div className="flex flex-1 items-center justify-center py-6">
            <SystemGrows />
          </div>
          <Copy title="A system your agent can extend.">
            The AI Brain hands your agent the whole system, so new screens and new components fit, and scripts check
            the work before it calls it done.
          </Copy>
        </div>
      </Reveal>
      <Reveal y={12} delay={0.12} className="h-full">
        <div className={CARD}>
          <div className="flex flex-1 items-center justify-center py-6">
            <LayerStack />
          </div>
          <Copy title="The stack you already use.">
            React, TypeScript and Tailwind CSS, with Framer Motion for movement, installed by the shadcn CLI into the
            project you already have.
          </Copy>
        </div>
      </Reveal>

      {/* Row 3 */}
      <Reveal y={12} className="h-full">
        <div className={CARD}>
          <div className="flex flex-1 items-center py-6">
            <FreeMosaic count={freeTotal} />
          </div>
          <div className="mt-6">
            <Copy title="Free means MIT.">
              {freeTotal} free standalones and Andromeda Legacy are open source under MIT. Install them, change them, ship
              them.
            </Copy>
          </div>
        </div>
      </Reveal>
      <Reveal y={12} delay={0.06} className="h-full lg:col-span-2">
        <div className={`${CARD} sm:flex-row sm:items-center sm:gap-8`}>
          <div className="order-2 mt-8 sm:order-1 sm:mt-0 sm:max-w-xs">
            <Copy title="Premium opens the whole catalog.">
              One subscription unlocks Andromeda Pro and its templates, the AI Brain and every premium standalone, with
              new pieces included as they ship. Monthly or yearly, cancel anytime.
            </Copy>
          </div>
          <div className="order-1 flex flex-1 justify-center py-4 sm:order-2">
            <Included />
          </div>
        </div>
      </Reveal>
    </div>
  )
}
