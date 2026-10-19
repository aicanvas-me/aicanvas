// "Why AI Canvas": seven cards in three rows (wide + narrow, three equal,
// narrow + wide), each a short claim with a small picture of it. Every picture
// is CSS and inline SVG, no extra 3D on a page that already has the Brain.
// Server component; hover lifts a card a little, nothing loops.

import type { ReactNode } from 'react'
import { Briefcase, Check } from '@phosphor-icons/react/dist/ssr'
import { Reveal } from './Reveal'
import { ClaudeMark, CodexMark, CursorMark } from '../mcp/InstallCards'

type Shot = { slug: string; name: string; image: string }

const CARD =
  'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-sand-200 bg-gradient-to-b from-sand-100 to-sand-50 p-6 transition-[transform,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-sand-300 sm:p-8 dark:border-sand-800 dark:from-sand-900 dark:to-sand-950 dark:hover:border-sand-700'
const TITLE = 'text-base font-semibold text-sand-900 dark:text-sand-50'
const BODY = 'mt-2 text-[15px] leading-relaxed text-sand-600 dark:text-sand-400'
const MONO = 'font-mono text-[10px] uppercase tracking-[0.18em]'

function Copy({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className={TITLE}>{title}</h3>
      <p className={BODY}>{children}</p>
    </div>
  )
}

// A round well, pressed into the card, holding one picture.
function Well({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex size-32 items-center justify-center rounded-full border border-sand-200 bg-sand-100 shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)] dark:border-sand-800 dark:bg-sand-900 dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
      <div className="flex size-20 items-center justify-center rounded-full border border-sand-200 bg-sand-50 shadow-[0_2px_4px_rgba(0,0,0,0.06),0_10px_20px_-8px_rgba(0,0,0,0.18)] dark:border-sand-800 dark:bg-sand-950 dark:shadow-[0_2px_4px_rgba(0,0,0,0.4),0_12px_24px_-8px_rgba(0,0,0,0.7)]">
        {children}
      </div>
    </div>
  )
}

// The Premium card: a dark member card, tilted, that straightens on hover. It
// stays dark in both themes: it is an object on the page, not page chrome.
function MemberCard() {
  return (
    <div className="w-full max-w-[320px]">
      <div className="relative aspect-[1.6/1] w-full rotate-[-5deg] rounded-2xl border border-white/10 bg-[linear-gradient(135deg,#232326,#121214)] p-5 text-left shadow-[0_2px_6px_rgba(0,0,0,0.25),0_24px_40px_-12px_rgba(0,0,0,0.55)] transition-[rotate,translate] duration-500 ease-out group-hover:-translate-y-1 group-hover:rotate-[-1deg]">
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl opacity-40"
          style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgb(255 255 255 / 0.035) 0 2px, transparent 2px 7px)' }}
        />
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <img src="/ai-canvas-icon.svg" alt="" aria-hidden className="h-6 w-auto" />
            <span className={`${MONO} text-sand-300`}>Premium</span>
          </div>
          <span aria-hidden className="h-7 w-10 rounded-md bg-[linear-gradient(135deg,#DAE4A0,#A8B94D)] opacity-90 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)]" />
          <div className="flex items-end justify-between">
            <div>
              <span className={`${MONO} block text-sand-500`}>Member since</span>
              <span className="mt-1 block font-mono text-sm text-sand-100">2026</span>
            </div>
            <div className="text-right">
              <span className={`${MONO} block text-sand-500`}>Access</span>
              <span className="mt-1 block font-mono text-sm text-sand-100">Full catalog</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CodePeek() {
  return (
    <div className="rounded-2xl border border-sand-200 bg-sand-50 font-mono text-[12px] leading-6 dark:border-sand-800 dark:bg-sand-950">
      <div className="flex items-center gap-2 border-b border-sand-200 px-4 py-2 text-sand-600 dark:border-sand-800 dark:text-sand-400">
        <span aria-hidden className="size-1.5 rounded-full bg-olive-600 dark:bg-olive-400" />
        components/aicanvas/slice-type.tsx
      </div>
      <div className="overflow-hidden px-4 py-3 text-sand-700 dark:text-sand-300">
        <p className="truncate text-sand-600 max-xl:whitespace-normal dark:text-sand-500">$ npx shadcn@latest add @aicanvas/slice-type</p>
        <p className="truncate max-xl:whitespace-normal">
          <span className="text-olive-600 dark:text-olive-400">export default function</span> SliceType() {'{'}
        </p>
        <p className="truncate pl-4 text-sand-600 max-xl:whitespace-normal dark:text-sand-500">{'// yours now: read it, change it'}</p>
        <p>{'}'}</p>
      </div>
    </div>
  )
}

function AgentMarks() {
  const marks = [
    { mark: <ClaudeMark />, cls: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-[#D97757]' },
    { mark: <CursorMark />, cls: 'bottom-[6%] left-[2%] text-sand-900 dark:text-sand-100' },
    { mark: <CodexMark />, cls: 'bottom-[6%] right-[2%] text-sand-900 dark:text-sand-100' },
  ]
  return (
    <div className="relative mx-auto size-32">
      <Well>
        <img src="/ai-canvas-icon.svg" alt="" aria-hidden className="h-7 w-auto" />
      </Well>
      {marks.map(({ mark, cls }, i) => (
        <span
          key={i}
          className={`absolute flex size-9 items-center justify-center rounded-full border border-sand-200 bg-sand-50 shadow-sm dark:border-sand-800 dark:bg-sand-900 [&>svg]:size-4 ${cls}`}
        >
          {mark}
        </span>
      ))}
    </div>
  )
}

function CheckDial() {
  const ticks = Array.from({ length: 36 }, (_, i) => i)
  return (
    <div className="relative mx-auto size-36">
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
        {ticks.map((i) => {
          const a = (i / ticks.length) * Math.PI * 2 - Math.PI / 2
          const lit = i < 26
          const r1 = 44
          const r2 = i % 3 === 0 ? 39 : 41
          return (
            <line
              key={i}
              x1={50 + Math.cos(a) * r1}
              y1={50 + Math.sin(a) * r1}
              x2={50 + Math.cos(a) * r2}
              y2={50 + Math.sin(a) * r2}
              strokeWidth={1.2}
              strokeLinecap="round"
              className={lit ? 'stroke-olive-600 dark:stroke-olive-400' : 'stroke-sand-300 dark:stroke-sand-700'}
            />
          )
        })}
      </svg>
      <div className="absolute inset-[18%]">
        <div className="flex size-full items-center justify-center rounded-full border border-sand-200 bg-sand-50 shadow-[0_2px_4px_rgba(0,0,0,0.06),0_10px_20px_-8px_rgba(0,0,0,0.18)] dark:border-sand-800 dark:bg-sand-950 dark:shadow-[0_2px_4px_rgba(0,0,0,0.4),0_12px_24px_-8px_rgba(0,0,0,0.7)]">
          <Check weight="regular" size={28} className="text-olive-600 dark:text-olive-400" />
        </div>
      </div>
    </div>
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
          <span className="flex size-14 items-center justify-center rounded-2xl border border-sand-200 bg-sand-50 shadow-[0_2px_4px_rgba(0,0,0,0.05),0_8px_16px_-8px_rgba(0,0,0,0.15)] dark:border-sand-800 dark:bg-sand-950 dark:shadow-[0_2px_4px_rgba(0,0,0,0.4),0_10px_20px_-8px_rgba(0,0,0,0.6)]">
            {art}
          </span>
          <span className="text-[11px] font-medium text-sand-600 dark:text-sand-400">{name}</span>
        </div>
      ))}
    </div>
  )
}

// Three free components, fanned like prints on a desk.
function FreeFan({ shots }: { shots: Shot[] }) {
  const pose = [
    'translate-x-[-88%] translate-y-3 rotate-[-10deg] group-hover:translate-x-[-96%] group-hover:rotate-[-13deg]',
    'translate-x-[-50%] -translate-y-1 z-10 group-hover:-translate-y-3',
    'translate-x-[-12%] translate-y-3 rotate-[10deg] group-hover:translate-x-[-4%] group-hover:rotate-[13deg]',
  ]
  return (
    <div className="relative h-44">
      {shots.slice(0, 3).map((s, i) => (
        <div
          key={s.slug}
          className={`absolute left-1/2 top-4 w-[52%] max-w-[220px] rounded-xl border border-sand-200 bg-sand-100 p-1.5 shadow-[0_2px_6px_rgba(0,0,0,0.08),0_20px_32px_-12px_rgba(0,0,0,0.3)] transition-transform duration-500 ease-out dark:border-sand-800 dark:bg-sand-900 dark:shadow-[0_2px_6px_rgba(0,0,0,0.4),0_24px_40px_-12px_rgba(0,0,0,0.75)] ${pose[i]}`}
        >
          <img src={s.image} alt="" aria-hidden loading="lazy" decoding="async" className="aspect-[4/3] w-full rounded-lg object-cover" />
        </div>
      ))}
    </div>
  )
}

export function ValueBento({ freeTotal, freeShots }: { freeTotal: number; freeShots: Shot[] }) {
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
            <CodePeek />
          </div>
        </div>
      </Reveal>
      <Reveal y={12} delay={0.06} className="h-full">
        <div className={CARD}>
          <div className="flex flex-1 items-center justify-center py-6">
            <AgentMarks />
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
            <Well>
              <Briefcase weight="regular" size={28} className="text-olive-600 dark:text-olive-400" />
            </Well>
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
            <CheckDial />
          </div>
          <Copy title="Rules your agent can follow.">
            The AI Brain hands your agent the design rules and skills, then scripts check the screen before it calls it
            done.
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
          <div className="flex-1">
            <FreeFan shots={freeShots} />
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
            <MemberCard />
          </div>
        </div>
      </Reveal>
    </div>
  )
}
