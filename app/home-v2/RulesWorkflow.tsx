'use client'

// "How it works" for homepage v2: the three steps on the left, and on the
// right what each one looks like from the agent's side. Install is the
// terminal, Build is the rules file itself (a real excerpt of Andromeda
// Legacy's MIT rules.md, line numbers included), Check is the review the agent
// runs on its own screen. Steps advance on their own and stop for hover,
// focus or a click.

import { useState, useSyncExternalStore } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Code, MagnifyingGlass, Terminal } from '@phosphor-icons/react'

const STEPS = [
  {
    num: '01',
    title: 'Install',
    desc: 'One command adds the components, tokens and design rules to your project.',
    file: 'terminal',
    Icon: Terminal,
  },
  {
    num: '02',
    title: 'Build',
    desc: 'Your agent follows the rules: where colour goes, how cards sit in a grid, which button leads a row.',
    file: 'andromeda/rules.md',
    Icon: Code,
  },
  {
    num: '03',
    title: 'Check',
    desc: 'Ask it to review its own screen against the same rules before you look.',
    file: 'review',
    Icon: MagnifyingGlass,
  },
] as const

const STEP_MS = 7000

const noSubscribe = () => () => {}

// design-systems/andromeda/rules.md, lines 39 to 52, verbatim.
const RULES_EXCERPT: { n: number; text: string; kind?: 'h2' | 'h3' | 'must' }[] = [
  { n: 39, text: '## Color philosophy', kind: 'h2' },
  { n: 40, text: '' },
  { n: 41, text: 'Andromeda is a near-monochrome system. Color is reserved for meaning, never decoration.' },
  { n: 42, text: '' },
  { n: 43, text: '### When color IS used', kind: 'h3' },
  { n: 44, text: '' },
  { n: 45, text: '- Live measurements: clocks, telemetry values, deltas, volume readings' },
  { n: 46, text: '- Active state markers: nav-item indicator dot, badge dot, breadcrumb' },
  { n: 47, text: '- Status of importance where the meaning IS the color: `Live`, `Online`, `Fault`, `Warning`' },
  { n: 48, text: '- Threshold crossings on charts (red for negative move, accent for positive)' },
  { n: 49, text: '' },
  { n: 50, text: '### When color is NEVER used (`must`)', kind: 'must' },
  { n: 51, text: '', kind: 'must' },
  { n: 52, text: '- Page titles, section titles, card titles', kind: 'must' },
]

const REVIEW: { ok: boolean; rule: string; area: string; note?: string }[] = [
  { ok: true, rule: 'Titles stay neutral', area: 'color' },
  { ok: true, rule: 'Same size across every row', area: 'layout' },
  { ok: true, rule: 'Frames never nest', area: 'cards' },
  { ok: true, rule: 'No glow on outline buttons', area: 'buttons' },
  { ok: false, rule: 'Chart line used the accent', area: 'charts', note: 'Fixed: stroke set to text.primary' },
]

export function RulesWorkflow() {
  // Read after mount only: the server renders the animated version, and the
  // first client render has to match it.
  const reduceSetting = useReducedMotion()
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false)
  const reduce = mounted && !!reduceSetting
  const [active, setActive] = useState(0)
  const [cycle, setCycle] = useState(0)
  const [held, setHeld] = useState(false)

  // The progress bar under the active step IS the timer: its CSS animation
  // runs for STEP_MS, pauses while the section is hovered or focused, and its
  // animationend moves to the next step. A click restarts it (new key).
  const next = () => {
    setActive((a) => (a + 1) % STEPS.length)
    setCycle((c) => c + 1)
  }

  const pick = (i: number) => {
    setActive(i)
    setCycle((c) => c + 1)
  }

  const step = STEPS[active]

  return (
    <div
      className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-sand-600">How it works</p>
        <h2 className="mt-1 text-xl font-bold text-sand-900 dark:text-sand-50">
          Your agent reads the rules before it writes a line.
        </h2>

        <div role="tablist" aria-label="How it works" className="mt-6 flex flex-col gap-2">
          {STEPS.map((s, i) => {
            const on = i === active
            return (
              <button
                key={s.num}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="rules-workflow-panel"
                onClick={() => pick(i)}
                className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 ${
                  on
                    ? 'border-sand-300 bg-sand-100 dark:border-sand-700 dark:bg-sand-900'
                    : 'border-transparent hover:bg-sand-100/60 dark:hover:bg-sand-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      on
                        ? 'border-olive-500/50 bg-olive-500/10 text-olive-700 dark:text-olive-400'
                        : 'border-sand-300 text-sand-600 dark:border-sand-700 dark:text-sand-400'
                    }`}
                  >
                    <s.Icon weight="regular" size={15} />
                  </span>
                  <span className="text-sm font-bold tabular-nums text-olive-600 dark:text-olive-500">{s.num}</span>
                  <span className="text-base font-bold text-sand-900 dark:text-sand-50">{s.title}</span>
                </div>
                <p
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                    on ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <span className="overflow-hidden pl-11 text-sm leading-relaxed text-sand-600 dark:text-sand-400">{s.desc}</span>
                </p>
                {on && !reduce && (
                  <span
                    key={cycle}
                    aria-hidden
                    onAnimationEnd={next}
                    className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-olive-500 [animation:rulesStep_linear_forwards]"
                    style={{ animationDuration: `${STEP_MS}ms`, animationPlayState: held ? 'paused' : 'running' }}
                  />
                )}
              </button>
            )
          })}
        </div>
        <p className="mt-5 text-sm text-sand-600 dark:text-sand-400">
          Works with Claude Code, Codex, Cursor and any agent that reads files.
        </p>
        <style>{`@keyframes rulesStep { from { transform: scaleX(0) } to { transform: scaleX(1) } } @keyframes rulesLine { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }`}</style>
      </div>

      {/* The agent's side */}
      <div
        id="rules-workflow-panel"
        role="tabpanel"
        className="overflow-hidden rounded-2xl border border-sand-200 bg-sand-100 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_18px_40px_-16px_rgba(0,0,0,0.18)] dark:border-sand-800 dark:bg-sand-900 dark:shadow-[0_2px_4px_rgba(0,0,0,0.3),0_24px_60px_-20px_rgba(0,0,0,0.6)]"
      >
        <div className="flex h-10 items-center gap-3 border-b border-sand-200 px-4 dark:border-sand-800">
          <div aria-hidden className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sand-300 dark:bg-sand-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-sand-300 dark:bg-sand-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-sand-300 dark:bg-sand-700" />
          </div>
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <span
                key={s.file}
                className={`rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors ${
                  i === active
                    ? 'bg-sand-50 text-sand-900 dark:bg-sand-950 dark:text-sand-50'
                    : 'text-sand-600 dark:text-sand-400'
                }`}
              >
                {s.file}
              </span>
            ))}
          </div>
        </div>

        <div key={`${active}-${cycle}`} className="min-h-[340px] bg-sand-50 p-5 font-mono text-[12.5px] leading-6 dark:bg-sand-950">
          {step.title === 'Install' && <InstallPanel reduce={!!reduce} />}
          {step.title === 'Build' && <RulesPanel reduce={!!reduce} />}
          {step.title === 'Check' && <ReviewPanel reduce={!!reduce} />}
        </div>
      </div>
    </div>
  )
}

// Lines enter one after another. CSS only: the panel remounts per step, so
// the animation replays every time the step changes.
function Line({ i, reduce, children, className = '' }: { i: number; reduce: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`${className} ${reduce ? '' : 'opacity-0 [animation:rulesLine_0.35s_ease-out_forwards]'}`}
      style={reduce ? undefined : { animationDelay: `${0.15 + i * 0.28}s` }}
    >
      {children}
    </div>
  )
}

const OK = 'text-olive-600 dark:text-olive-400'

function InstallPanel({ reduce }: { reduce: boolean }) {
  return (
    <div className="text-sand-700 dark:text-sand-300">
      <Line i={0} reduce={reduce} className="text-sand-900 dark:text-sand-50">
        <span className="text-sand-500">$ </span>npx shadcn@latest add @aicanvas/andromeda
      </Line>
      <Line i={1} reduce={reduce}><span className={OK}>✓</span> Checking registry.</Line>
      <Line i={2} reduce={reduce}><span className={OK}>✓</span> Installing dependencies.</Line>
      <Line i={3} reduce={reduce}><span className={OK}>✓</span> Created files.</Line>
      <Line i={4} reduce={reduce} className="pl-4 text-sand-600 dark:text-sand-400">components/…</Line>
      <Line i={6} reduce={reduce} className="mt-6 text-sand-900 dark:text-sand-50">
        <span className="text-olive-600 dark:text-olive-400">› </span>Build the settings page with Andromeda.
      </Line>
      <Line i={7.5} reduce={reduce} className="pl-4 text-sand-600 dark:text-sand-400">
        Reading andromeda/rules.md before the first line.
      </Line>
    </div>
  )
}

function RulesPanel({ reduce }: { reduce: boolean }) {
  return (
    <div className="relative">
      {RULES_EXCERPT.map((l, i) => (
        <Line
          key={l.n}
          i={i * 0.45}
          reduce={reduce}
          className={`-mx-5 flex gap-4 px-5 ${l.kind === 'must' ? 'bg-olive-500/10' : ''}`}
        >
          <span className="w-6 shrink-0 select-none text-right text-sand-600 dark:text-sand-500">{l.n}</span>
          <span
            className={
              l.kind === 'h2' || l.kind === 'h3'
                ? 'font-semibold text-sand-900 dark:text-sand-50'
                : l.kind === 'must'
                  ? 'text-sand-900 dark:text-sand-50'
                  : 'text-sand-700 dark:text-sand-300'
            }
          >
            {l.text || ' '}
          </span>
        </Line>
      ))}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-5 h-10 bg-gradient-to-t from-sand-50 dark:from-sand-950" />
    </div>
  )
}

function ReviewPanel({ reduce }: { reduce: boolean }) {
  return (
    <div className="text-sand-700 dark:text-sand-300">
      <Line i={0} reduce={reduce} className="text-sand-900 dark:text-sand-50">
        <span className="text-olive-600 dark:text-olive-400">› </span>Review this screen against the Andromeda rules.
      </Line>
      <div className="mt-3">
        {REVIEW.map((r, i) => (
          <Line key={r.rule} i={i + 1} reduce={reduce}>
            <div className="flex justify-between gap-4">
              <span>
                <span className={r.ok ? OK : 'text-red-500 dark:text-red-400'}>{r.ok ? '✓' : '✗'}</span> {r.rule}
              </span>
              <span className="text-sand-600 dark:text-sand-400">{r.area}</span>
            </div>
            {r.note && <div className="pl-4 text-sand-600 dark:text-sand-400">↳ {r.note}</div>}
          </Line>
        ))}
      </div>
      <Line i={REVIEW.length + 1.5} reduce={reduce} className="mt-3 text-sand-900 dark:text-sand-50">
        <span className={OK}>✓</span> 5 of 5 rules pass after one fix.
      </Line>
    </div>
  )
}
