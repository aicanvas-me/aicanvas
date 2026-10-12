'use client'

// Homepage v2 hero stage: an agent run replayed beside its result. The left
// pane is the transcript (prompt, read the rules, install, compose, check,
// both themes); the right pane is a localhost preview where a real Andromeda
// Pro template poster assembles region by region, gets checked against the
// brain's rules, and sweeps into the other theme.
//
// One clock drives everything: `t`, milliseconds into the current run, from a
// rAF loop that stops while paused, hovered, off screen or in a hidden tab.
// Every visual is derived from `t` against the run's timeline, so a tab click
// or a pause can never leave two animations out of step. React state moves in
// 50ms steps; the transitions themselves are CSS, so motion stays smooth.

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { Check, CircleNotch, Pause, Play } from '@phosphor-icons/react'
import type { StageScreen } from './stage-screens'
import { POSTER_BG, POSTER_BG_FLIP, posterVars } from './poster'

export type StageRun = StageScreen & { dark: string | null; light: string | null }

// ─── Timeline ─────────────────────────────────────────────────────────────────

const CHAR_MS = 24

const noSubscribe = () => () => {}

function timeline(s: StageScreen) {
  const typeStart = 250
  const typeEnd = typeStart + s.prompt.length * CHAR_MS
  const read = typeEnd + 300
  const readDone = read + 750
  const install = readDone + 150
  const installDone = install + 300 + s.components.length * 90
  const compose = installDone + 200
  const outlineAt = s.regions.map((_, i) => compose + i * 200)
  const fillStart = compose + s.regions.length * 200 + 150
  const fillAt = s.regions.map((_, i) => fillStart + i * 240)
  const fullAt = fillStart + s.regions.length * 240 + 150
  const composeDone = fullAt + 350
  const check = composeDone + 150
  const pinAt = s.pins.map((_, i) => check + 300 + i * 650)
  const checkDone = check + 300 + s.pins.length * 650
  // The checked screen holds before the sweep so every pin can be read.
  const sweepIn = checkDone + 2000
  const sweepHold = sweepIn + 950
  const sweepOut = sweepHold + 800
  const themesDone = sweepOut + 750
  const end = themesDone + 2600
  return {
    typeStart, typeEnd, read, readDone, install, installDone, compose, outlineAt, fillAt,
    fullAt, composeDone, check, pinAt, checkDone, sweepIn, sweepHold, sweepOut, themesDone, end,
  }
}

type Step = 'wait' | 'run' | 'done'
const stepOf = (t: number, start: number, done: number): Step =>
  t < start ? 'wait' : t < done ? 'run' : 'done'

// ─── Stage ────────────────────────────────────────────────────────────────────

export function AgentStage({ runs }: { runs: StageRun[] }) {
  // The server cannot know the visitor's motion setting, so the first client
  // render assumes motion too and the real setting applies after mount;
  // reading it during the first render would break hydration.
  const reduceSetting = useReducedMotion()
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false)
  const reduce = mounted && !!reduceSetting
  const [index, setIndex] = useState(0)
  const [t, setT] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [preload, setPreload] = useState(false)

  const run = runs[index]
  const tl = useMemo(() => timeline(run), [run])

  const rootRef = useRef<HTMLDivElement>(null)
  const barRefs = useRef<(HTMLSpanElement | null)[]>([])
  const clock = useRef(0)
  const hovered = useRef(false)
  const visible = useRef(true)
  const pausedRef = useRef(false)
  useEffect(() => {
    pausedRef.current = userPaused
  }, [userPaused])

  // Reduced motion: no replay. Each run shows its finished, checked screen and
  // the tabs switch between them.
  const shownT = reduce ? tl.themesDone : t

  // The clock.
  useEffect(() => {
    if (reduce) return
    let raf = 0
    let last = performance.now()
    let lastStep = -1
    const loop = (now: number) => {
      const dt = Math.min(now - last, 64)
      last = now
      const running = !pausedRef.current && !hovered.current && visible.current && !document.hidden
      if (running) clock.current += dt
      if (clock.current >= tl.end) {
        clock.current = 0
        lastStep = -1
        setT(0)
        setIndex((i) => (i + 1) % runs.length)
        return
      }
      const bar = barRefs.current[index]
      if (bar) bar.style.transform = `scaleX(${clock.current / tl.end})`
      const step = Math.floor(clock.current / 50)
      if (step !== lastStep) {
        lastStep = step
        setT(clock.current)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [index, tl, reduce, runs.length])

  // Off screen: hold the clock so the visitor never scrolls back to a run
  // that finished without them.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Fetch every poster in both themes once the page has painted, so a tab
  // click or the theme sweep never waits on the network.
  useEffect(() => {
    const id = window.setTimeout(() => setPreload(true), 1200)
    return () => window.clearTimeout(id)
  }, [])

  // Tilt: the stage leans back under the hero and stands up as it scrolls in.
  // The homepage scrolls inside [data-owns-scroll], not the window.
  const lean = useMotionValue(1)
  const leanSpring = useSpring(lean, { stiffness: 120, damping: 24, mass: 0.6 })
  const rotateX = useTransform(leanSpring, [0, 1], [0, 14])
  const scale = useTransform(leanSpring, [0, 1], [1, 0.94])
  useEffect(() => {
    if (reduce) {
      lean.set(0)
      return
    }
    const el = rootRef.current
    const scroller = el?.closest('[data-owns-scroll]') ?? null
    if (!el) return
    const update = () => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(1, Math.max(0, (vh * 0.95 - r.top) / (vh * 0.75)))
      lean.set(1 - p)
    }
    update()
    const target: HTMLElement | Window = (scroller as HTMLElement | null) ?? window
    target.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      target.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [lean, reduce])

  const select = (i: number) => {
    barRefs.current.forEach((b) => b && (b.style.transform = 'scaleX(0)'))
    clock.current = 0
    setT(0)
    setIndex(i)
  }

  const typed = reduce
    ? run.prompt.length
    : Math.max(0, Math.min(run.prompt.length, Math.floor((shownT - tl.typeStart) / CHAR_MS)))
  const read = stepOf(shownT, tl.read, tl.readDone)
  const install = stepOf(shownT, tl.install, tl.installDone)
  const compose = stepOf(shownT, tl.compose, tl.composeDone)
  const check = stepOf(shownT, tl.check, tl.checkDone)
  const themes = stepOf(shownT, tl.sweepIn, tl.themesDone)
  const finished = shownT >= tl.themesDone
  const chipsShown = run.components.filter((_, i) => shownT >= tl.install + 300 + i * 90).length
  const pinsShown = tl.pinAt.filter((at) => shownT >= at).length
  const sweep: 'idle' | 'in' | 'out' =
    shownT >= tl.sweepIn && shownT < tl.sweepOut ? 'in' : shownT >= tl.sweepOut && shownT < tl.themesDone ? 'out' : 'idle'
  const sweepLine = shownT >= tl.sweepIn && shownT < tl.sweepHold ? 'in' : shownT >= tl.sweepOut && shownT < tl.themesDone ? 'out' : 'off'

  return (
    <div
      ref={rootRef}
      className="relative mt-12 sm:mt-14 [perspective:1800px]"
      onMouseEnter={() => (hovered.current = true)}
      onMouseLeave={() => (hovered.current = false)}
      onFocusCapture={() => (hovered.current = true)}
      onBlurCapture={() => (hovered.current = false)}
    >
      {/* Glow under the window: olive, low, so the frame reads as lit from
          below rather than boxed in. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[8%] -bottom-10 top-1/3 rounded-[50%] bg-olive-500/10 blur-3xl dark:bg-olive-500/[0.07]"
      />

      <motion.div
        style={{ rotateX, scale, transformOrigin: '50% 0%' }}
        className="relative overflow-hidden rounded-2xl border border-sand-200 bg-sand-100 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_24px_60px_-12px_rgba(0,0,0,0.18)] dark:border-sand-800 dark:bg-sand-900 dark:shadow-[0_2px_4px_rgba(0,0,0,0.3),0_32px_80px_-16px_rgba(0,0,0,0.7)]"
      >
        {/* Window bar */}
        <div className="flex h-10 items-center gap-3 border-b border-sand-200 px-4 dark:border-sand-800">
          <div aria-hidden className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sand-300 dark:bg-sand-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-sand-300 dark:bg-sand-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-sand-300 dark:bg-sand-700" />
          </div>
          <div className="mx-auto flex h-6 min-w-0 items-center gap-2 rounded-md border border-sand-200 bg-sand-50 px-3 font-mono text-[11px] text-sand-600 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-400">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${finished ? 'bg-olive-500' : 'bg-sand-400 dark:bg-sand-600'}`} />
            <span className="truncate">localhost:3000{run.path}</span>
          </div>
          {!reduce && (
            <button
              type="button"
              onClick={() => setUserPaused((p) => !p)}
              aria-label={userPaused ? 'Play the demo' : 'Pause the demo'}
              className="flex h-7 w-7 items-center justify-center rounded-md text-sand-600 transition-colors hover:bg-sand-200 hover:text-sand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 dark:text-sand-400 dark:hover:bg-sand-800 dark:hover:text-sand-100"
            >
              {userPaused ? <Play weight="regular" size={14} /> : <Pause weight="regular" size={14} />}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,330px)_minmax(0,1fr)]">
          {/* ── Transcript ── */}
          <div className="order-2 flex min-h-[300px] flex-col border-t border-sand-200 p-4 text-left dark:border-sand-800 lg:order-1 lg:border-r lg:border-t-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sand-900 dark:text-sand-50">Your agent</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-200/70 px-2 py-0.5 text-[10px] font-semibold text-sand-700 dark:bg-sand-800/70 dark:text-sand-300">
                <span className="relative flex h-1.5 w-1.5" aria-hidden>
                  {!finished && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-olive-600 opacity-60 dark:bg-olive-400" />}
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-olive-600 dark:bg-olive-400" />
                </span>
                {finished ? 'Done' : 'Working'}
              </span>
            </div>

            {/* Prompt */}
            <div className="mt-3 rounded-xl border border-sand-200 bg-sand-50 px-3 py-2.5 text-[13px] leading-snug text-sand-900 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-50">
              <span className="sr-only">{run.prompt}</span>
              <span aria-hidden>
                {run.prompt.slice(0, typed)}
                {typed < run.prompt.length && (
                  <span className="ml-px inline-block h-[1.05em] w-[2px] translate-y-[2px] animate-pulse bg-olive-600 dark:bg-olive-400" />
                )}
                {/* Reserve the full prompt's height so the steps never jump. */}
                <span className="invisible">{run.prompt.slice(typed)}</span>
              </span>
            </div>

            <ol className="mt-4 flex flex-col gap-3" aria-live="off">
              <StepRow state={read} title="Read the rules" meta="andromeda-pro/rules.md">
                <p className="mt-1.5 border-l-2 border-olive-500/60 pl-2 font-mono text-[10.5px] leading-relaxed text-sand-600 dark:text-sand-400">
                  <span className="text-olive-700 dark:text-olive-400">must</span> · {run.quote}
                </p>
              </StepRow>
              <StepRow state={install} title={`Install ${run.components.length} components`}>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {run.components.map((c, i) => (
                    <span
                      key={c}
                      className={`rounded border border-sand-200 bg-sand-50 px-1.5 py-px font-mono text-[10px] text-sand-700 transition-all duration-200 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-300 ${
                        i < chipsShown ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
                      }`}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </StepRow>
              <StepRow state={compose} title="Compose the screen" meta={`${run.regions.length} regions`} />
              <StepRow
                state={check}
                title="Check against the rules"
                meta={check === 'wait' ? `${run.pins.length} rules` : `${pinsShown} of ${run.pins.length} pass`}
              />
              <StepRow state={themes} title="Render light and dark" meta="one token set" />
            </ol>

            <p
              className={`mt-auto pt-4 text-[12px] font-medium text-sand-700 transition-opacity duration-300 dark:text-sand-300 ${
                finished ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Check weight="regular" size={12} className="mr-1 inline text-olive-600 dark:text-olive-400" />
              Screen ready. Every rule passed.
            </p>
          </div>

          {/* ── Preview canvas ── */}
          <div className="order-1 p-2 sm:p-3 lg:order-2">
            <div
              className="relative aspect-[1138/613] overflow-hidden rounded-lg bg-[#e9e9ea] [container-type:inline-size] dark:bg-[#0d0d0e]"
              style={posterVars(run)}
              role="img"
              aria-label={`${run.tab}: the Andromeda Pro template your agent builds, checked against the rules`}
            >
              {/* Blueprint grid under the unbuilt screen */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-100 [background-image:linear-gradient(to_right,rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.06)_1px,transparent_1px)] [background-size:24px_24px] dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)]"
              />

              {/* Regions: outline first, then the real pixels inside it. */}
              {run.regions.map((r, i) => {
                const outlined = shownT >= tl.outlineAt[i] && shownT < tl.fullAt + 300
                const filled = shownT >= tl.fillAt[i]
                const box = { left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%` }
                return (
                  <div key={`${run.slug}-${i}`} aria-hidden>
                    <div
                      className={`absolute inset-0 ${POSTER_BG} transition-[opacity,filter] duration-500 ease-out ${
                        filled ? 'opacity-100 blur-0' : 'opacity-0 blur-[6px]'
                      }`}
                      style={{ clipPath: `inset(${r.y}% ${100 - r.x - r.w}% ${100 - r.y - r.h}% ${r.x}%)` }}
                    />
                    <div
                      className={`absolute rounded-[3px] border border-dashed border-olive-600/70 transition-opacity duration-300 dark:border-olive-400/60 ${
                        outlined ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={box}
                    >
                      <span className="absolute left-1 top-1 whitespace-nowrap rounded-sm bg-sand-50/95 px-1 py-px font-mono text-[9px] leading-tight text-olive-700 dark:bg-sand-950/90 dark:text-olive-400 sm:text-[10px]">
                        {`<${r.label.split(' ')[0]}`}
                        <span className="text-sand-600 dark:text-sand-400">{r.label.slice(r.label.split(' ')[0].length)}</span>
                        {' />'}
                      </span>
                    </div>
                  </div>
                )
              })}

              {/* Everything between the regions settles in last. */}
              <div
                aria-hidden
                className={`absolute inset-0 ${POSTER_BG} transition-opacity duration-500 ${shownT >= tl.fullAt ? 'opacity-100' : 'opacity-0'}`}
              />

              {/* Theme sweep: the other theme wipes across and back. */}
              <motion.div
                aria-hidden
                className={`absolute inset-0 ${POSTER_BG_FLIP}`}
                initial={false}
                animate={{
                  clipPath:
                    sweep === 'in' ? 'inset(0% 0% 0% 0%)' : sweep === 'out' ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)',
                }}
                transition={{ duration: sweep === 'idle' ? 0 : sweep === 'in' ? 0.9 : 0.7, ease: [0.65, 0, 0.35, 1] }}
              />
              {sweepLine !== 'off' && (
                <motion.span
                  key={`${run.slug}-${sweepLine}`}
                  aria-hidden
                  className="absolute inset-y-0 w-[2px] bg-olive-500 shadow-[0_0_12px_2px_rgba(218,228,160,0.55)]"
                  initial={{ left: '0%' }}
                  animate={{ left: '100%' }}
                  transition={{ duration: sweepLine === 'in' ? 0.9 : 0.7, ease: [0.65, 0, 0.35, 1] }}
                />
              )}
              <span
                aria-hidden
                className={`absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-olive-500/50 bg-sand-950/85 px-3 py-1 text-[11px] font-semibold text-sand-50 backdrop-blur transition-opacity duration-300 ${
                  sweep === 'in' ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <span className="dark:hidden">Dark theme</span>
                <span className="hidden dark:inline">Light theme</span>
              </span>

              {/* Rule pins */}
              {run.pins.map((p, i) => (
                <Pin key={`${run.slug}-pin-${i}`} pin={p} shown={shownT >= tl.pinAt[i] && sweep === 'idle'} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs: which screen the agent builds. The bar under the active tab is
          the run's progress, written straight to the DOM by the clock. */}
      <div role="tablist" aria-label="Screens your agent builds" className="mt-5 flex flex-wrap justify-center gap-2">
        {runs.map((r, i) => {
          const active = i === index
          return (
            <button
              key={r.slug}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => select(i)}
              className={`relative overflow-hidden rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 ${
                active
                  ? 'border-sand-300 bg-sand-100 text-sand-900 dark:border-sand-700 dark:bg-sand-900 dark:text-sand-50'
                  : 'border-sand-200 text-sand-600 hover:border-sand-300 hover:text-sand-900 dark:border-sand-800 dark:text-sand-400 dark:hover:border-sand-700 dark:hover:text-sand-100'
              }`}
            >
              {r.tab}
              <span
                ref={(el) => {
                  barRefs.current[i] = el
                }}
                aria-hidden
                className={`absolute inset-x-0 bottom-0 h-[2px] origin-left bg-olive-500 ${active && !reduce ? '' : 'opacity-0'}`}
                style={{ transform: 'scaleX(0)' }}
              />
            </button>
          )
        })}
      </div>

      {preload && (
        <div aria-hidden className="hidden">
          {runs.flatMap((r) => [r.dark, r.light]).filter(Boolean).map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src as string} alt="" />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Pieces ───────────────────────────────────────────────────────────────────

function StepRow({
  state,
  title,
  meta,
  children,
}: {
  state: Step
  title: string
  meta?: string
  children?: React.ReactNode
}) {
  return (
    <li className={`flex gap-2.5 transition-opacity duration-300 ${state === 'wait' ? 'opacity-35' : 'opacity-100'}`}>
      <span className="mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
        {state === 'done' ? (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-olive-500 text-sand-950">
            <Check weight="regular" size={9} />
          </span>
        ) : state === 'run' ? (
          <CircleNotch weight="regular" size={14} className="animate-spin text-olive-600 dark:text-olive-400" />
        ) : (
          <span className="h-3 w-3 rounded-full border border-sand-300 dark:border-sand-700" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[13px] font-semibold text-sand-900 dark:text-sand-50">{title}</span>
          {meta && <span className="shrink-0 font-mono text-[10.5px] text-sand-600 dark:text-sand-400">{meta}</span>}
        </div>
        {state !== 'wait' && children}
      </div>
    </li>
  )
}

function Pin({ pin, shown }: { pin: { x: number; y: number; rule: string; side: 'left' | 'right' | 'top' }; shown: boolean }) {
  const label =
    pin.side === 'right'
      ? 'left-4 top-1/2 -translate-y-1/2'
      : pin.side === 'left'
        ? 'right-4 top-1/2 -translate-y-1/2'
        : 'bottom-4 left-1/2 -translate-x-1/2'
  return (
    <div
      aria-hidden
      className={`absolute h-0 w-0 transition-all duration-300 ease-out ${shown ? 'opacity-100' : 'opacity-0'}`}
      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
    >
      <span className="absolute -left-[7px] -top-[7px] flex h-[14px] w-[14px] items-center justify-center">
        {shown && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-olive-500/60" />}
        <span className="relative h-[10px] w-[10px] rounded-full border-2 border-sand-950 bg-olive-500" />
      </span>
      <span
        className={`absolute ${label} flex items-center gap-1.5 whitespace-nowrap rounded-full border border-olive-500/50 bg-sand-950/90 py-1 pl-1.5 pr-2.5 text-[10px] font-semibold text-sand-50 shadow-lg backdrop-blur transition-transform duration-300 sm:text-[11px] ${
          shown ? 'scale-100' : 'scale-90'
        }`}
      >
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-olive-500 text-sand-950">
          <Check weight="regular" size={8} />
        </span>
        {pin.rule}
      </span>
    </div>
  )
}
