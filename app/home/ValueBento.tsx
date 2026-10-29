// "Why AI Canvas": seven cards in three rows (wide + narrow, three equal,
// narrow + wide), each a short claim with a small picture of it. Every picture
// is drawn UI or a small drawn object (the repo, two ways in, a stamped
// licence, a system filling in, the stack, an open lock, the Premium panel),
// CSS and inline SVG only. Server component; three pictures loop quietly,
// still under reduced motion.

import type { ReactNode } from 'react'
import { Brain, Browser, Cube, LockOpen, Sparkle, SquaresFour } from '@phosphor-icons/react/dist/ssr'
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

// Three small pictures with one quiet loop each (keyframes below). The
// resting style of every moving part is its finished frame, so under reduced
// motion each picture stands still in its final state.
const ANIM = `
.vb-art .vb-move { transform-box: fill-box; transform-origin: center }
.vb-shackle { transform: translateY(-12px); animation: vb-unlock 4.8s cubic-bezier(.22,1,.36,1) infinite }
.vb-glow { animation: vb-glow 4.8s cubic-bezier(.22,1,.36,1) infinite }
.vb-seal { animation: vb-stamp 4.8s cubic-bezier(.22,1,.36,1) infinite }
.vb-ripple { opacity: 0; animation: vb-ripple 4.8s ease-out infinite }
.vb-fill { animation: vb-fill 5.2s cubic-bezier(.22,1,.36,1) infinite }
.vb-scan { opacity: 0; animation: vb-scan 5.2s ease-in-out infinite }
.vb-check { animation: vb-check 5.2s cubic-bezier(.22,1,.36,1) infinite }
@keyframes vb-unlock { 0%, 18% { transform: translateY(0) } 34%, 82% { transform: translateY(-12px) } 100% { transform: translateY(0) } }
@keyframes vb-glow { 0%, 22% { opacity: 0; transform: scale(.85) } 40%, 80% { opacity: 1; transform: scale(1) } 100% { opacity: 0; transform: scale(.85) } }
@keyframes vb-stamp { 0%, 10% { opacity: 0; transform: translate(10px, -16px) scale(1.35) } 26% { opacity: 1; transform: translate(0, 0) scale(.94) } 32%, 84% { opacity: 1; transform: none } 100% { opacity: 0; transform: none } }
@keyframes vb-ripple { 0%, 26% { opacity: 0; transform: scale(1) } 30% { opacity: .5 } 60%, 100% { opacity: 0; transform: scale(1.8) } }
@keyframes vb-fill { 0%, 14% { opacity: 0; transform: scale(.5) } 30%, 88% { opacity: 1; transform: scale(1) } 100% { opacity: 0; transform: scale(.5) } }
@keyframes vb-scan { 0%, 32% { opacity: 0; transform: translateY(0) } 36% { opacity: .5 } 58% { opacity: .5; transform: translateY(92px) } 62%, 100% { opacity: 0; transform: translateY(92px) } }
@keyframes vb-check { 0%, 60% { opacity: 0; transform: scale(.4) } 68%, 88% { opacity: 1; transform: scale(1) } 100% { opacity: 0; transform: scale(1) } }
@media (prefers-reduced-motion: reduce) { .vb-art * { animation: none !important } }
`

const PAPER = 'fill-sand-50 stroke-sand-300 dark:fill-sand-950 dark:stroke-sand-700'
const LINE = 'fill-sand-200 dark:fill-sand-800'
const PAPER_SHADOW = { filter: 'drop-shadow(0 8px 12px rgb(0 0 0 / 0.16))' }

// Commercial use: a licence sheet, stamped.
function LicenceStamp() {
  return (
    <svg viewBox="0 0 120 120" className="vb-art mx-auto size-36 overflow-visible" aria-hidden>
      <rect x="30" y="14" width="60" height="80" rx="10" strokeWidth="1.5" className={PAPER} style={PAPER_SHADOW} />
      <rect x="40" y="27" width="24" height="4" rx="2" className="fill-sand-300 dark:fill-sand-700" />
      <rect x="40" y="39" width="40" height="3" rx="1.5" className={LINE} />
      <rect x="40" y="47" width="34" height="3" rx="1.5" className={LINE} />
      <rect x="40" y="55" width="38" height="3" rx="1.5" className={LINE} />
      <rect x="40" y="63" width="22" height="3" rx="1.5" className={LINE} />
      <circle cx="80" cy="86" r="17" fill="none" strokeWidth="1.5" className="vb-move vb-ripple stroke-accent" />
      <g className="vb-move vb-seal">
        <circle cx="80" cy="86" r="17" className="fill-accent" />
        <path d="M72.5 86.5l5 5 10-11" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="stroke-accent-foreground" />
      </g>
    </svg>
  )
}

// The agent extends the system: the empty slot fills, a check runs over the
// grid, and it passes.
function SystemFill() {
  const cells = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ x: 16 + (i % 3) * 32, y: 16 + Math.floor(i / 3) * 32 }))
  return (
    <svg viewBox="0 0 120 120" className="vb-art mx-auto size-36 overflow-visible" aria-hidden>
      {cells.map(({ x, y }, i) => (
        <rect key={i} x={x} y={y} width="24" height="24" rx="7" className={LINE} />
      ))}
      <rect x="80.75" y="80.75" width="22.5" height="22.5" rx="6.5" fill="none" strokeWidth="1.5" strokeDasharray="3 3" className="stroke-sand-400 dark:stroke-sand-600" />
      <rect x="80" y="80" width="24" height="24" rx="7" className="vb-move vb-fill fill-accent" />
      <rect x="10" y="12" width="100" height="1.5" rx="0.75" className="vb-scan fill-accent" />
      <g className="vb-move vb-check">
        <circle cx="104" cy="80" r="8" className="fill-success" />
        <path d="M100.5 80.2l2.4 2.4 4.6-5" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="stroke-sand-50 dark:stroke-sand-950" />
      </g>
    </svg>
  )
}

const STACK: { name: string; art: ReactNode }[] = [
  {
    name: 'React',
    art: (
      <svg viewBox="-11.5 -10.23 23 20.46" className="size-6" aria-hidden>
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
      <span aria-hidden className="flex size-6 items-end justify-end rounded-[4px] bg-[#3178C6] px-0.5 pb-px text-[10px] font-bold leading-none text-white">
        TS
      </span>
    ),
  },
  {
    name: 'Tailwind',
    art: (
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <path
          fill="#38BDF8"
          d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"
        />
      </svg>
    ),
  },
  {
    name: 'shadcn',
    art: (
      <svg viewBox="0 0 256 256" className="size-6 text-sand-900 dark:text-sand-50" aria-hidden>
        <g fill="none" stroke="currentColor" strokeWidth="26" strokeLinecap="round">
          <line x1="208" y1="128" x2="128" y2="208" />
          <line x1="192" y1="40" x2="40" y2="192" />
        </g>
      </svg>
    ),
  },
]

function StackTiles() {
  return (
    <div className="flex flex-wrap gap-3">
      {STACK.map(({ name, art }) => (
        <div key={name} className="flex flex-col items-center gap-2">
          <span className="flex size-14 items-center justify-center rounded-card border border-sand-200 bg-sand-50 shadow-[0_2px_4px_rgba(0,0,0,0.05),0_8px_16px_-8px_rgba(0,0,0,0.15)] dark:border-sand-800 dark:bg-sand-950 dark:shadow-[0_2px_4px_rgba(0,0,0,0.4),0_10px_20px_-8px_rgba(0,0,0,0.6)]">
            {art}
          </span>
          <span className="text-[11px] font-medium text-sand-600 dark:text-sand-400">{name}</span>
        </div>
      ))}
    </div>
  )
}

// Free means MIT: the lock is open.
function OpenLock() {
  return (
    <svg viewBox="0 0 120 120" className="vb-art mx-auto size-36 overflow-visible" aria-hidden>
      <circle cx="60" cy="72" r="46" className="vb-move vb-glow fill-sand-200/70 dark:fill-sand-800/40" />
      <path d="M44 64V42a16 16 0 0 1 32 0v22" fill="none" strokeWidth="7" strokeLinecap="round" className="vb-shackle stroke-sand-400 dark:stroke-sand-600" />
      <rect x="28" y="56" width="64" height="46" rx="14" strokeWidth="1.5" className={PAPER} style={PAPER_SHADOW} />
      <text x="60" y="84" textAnchor="middle" className="fill-sand-900 font-mono text-[12px] font-semibold tracking-[0.2em] dark:fill-sand-50">
        MIT
      </text>
    </svg>
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
      <style>{ANIM}</style>
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
            <LicenceStamp />
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
            <SystemFill />
          </div>
          <Copy title="A system your agent can extend.">
            The AI Brain hands your agent the whole system, so new screens and new components fit, and scripts check
            the work before it calls it done.
          </Copy>
        </div>
      </Reveal>
      <Reveal y={12} delay={0.12} className="h-full">
        <div className={CARD}>
          <div className="flex flex-1 items-center py-6">
            <StackTiles />
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
            <OpenLock />
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
