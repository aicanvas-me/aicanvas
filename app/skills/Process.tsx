'use client'

import { AnimatePresence, motion, useInView, useReducedMotion, type TargetAndTransition, type Transition } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check } from '@/app/_icons/icons/check'
import { WHOOSH } from './_lib/entries'

const STEP_MS = 3800
const EASE = [0.16, 1, 0.3, 1] as const
const STEPS = WHOOSH.points
const MONO = 'font-mono text-[12px] leading-relaxed'
const DIM = 'text-sand-600 dark:text-sand-400'
const INK = 'text-sand-900 dark:text-sand-50'

type Cue = (delay: number, t?: Transition) => { initial: false | TargetAndTransition; animate: TargetAndTransition; transition: Transition }

function Line({ cue, delay, children, className = '' }: { cue: Cue; delay: number; children: ReactNode; className?: string }) {
  return (
    <motion.p className={`${MONO} ${className}`} {...cue(delay)}>
      {children}
    </motion.p>
  )
}

function You({ cue, delay, children }: { cue: Cue; delay: number; children: ReactNode }) {
  return (
    <motion.p
      className="ml-auto w-fit rounded-card rounded-br-sm bg-sand-900 px-3 py-1.5 text-[13px] font-semibold text-sand-50 dark:bg-sand-50 dark:text-sand-900"
      {...cue(delay)}
    >
      {children}
    </motion.p>
  )
}

function Bar({ cue, delay, seconds, label }: { cue: Cue; delay: number; seconds: number; label: string }) {
  const fill = cue(delay, { duration: seconds, ease: 'linear' })
  return (
    <motion.div className="space-y-1.5" {...cue(delay - 0.1)}>
      <p className={`${MONO} ${DIM}`}>{label}</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-sand-200 dark:bg-sand-800">
        <motion.span
          className="block h-full origin-left rounded-full bg-sand-900 dark:bg-sand-50"
          initial={fill.initial === false ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={fill.transition}
        />
      </div>
    </motion.div>
  )
}

const OK = <Check size={13} className="mr-1.5 inline -translate-y-px text-success" />

function Panel({ step, cue }: { step: number; cue: Cue }) {
  switch (step) {
    case 0:
      return (
        <div className="space-y-2">
          <Line cue={cue} delay={0} className={DIM}>reading example.com, the repo and the README</Line>
          {['found the one true claim', 'kept the real numbers and words', 'noted the palette, type and UI'].map((t, i) => (
            <Line key={t} cue={cue} delay={0.5 + i * 0.35} className={INK}>
              {OK}
              {t}
            </Line>
          ))}
        </div>
      )
    case 1:
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            {[
              ['purpose', 'launch film'],
              ['format', '16:9'],
              ['feel', 'fast and punchy'],
              ['length', '15 s'],
              ['the line', 'written from your site'],
              ['brand', 'taken from your site'],
              ['sound', 'effects on the motion'],
            ].map(([q, d], i) => (
              <motion.div key={q} className="contents" {...cue(0.1 + i * 0.12)}>
                <span className={`${MONO} ${DIM}`}>{q}</span>
                <span className={`${MONO} ${INK}`}>{d}</span>
              </motion.div>
            ))}
          </div>
          <You cue={cue} delay={1.3}>you decide</You>
        </div>
      )
    case 2:
      return (
        <div className="space-y-2">
          <Line cue={cue} delay={0} className={DIM}>treatment.md</Line>
          <Line cue={cue} delay={0.25} className={INK}>idea: the invoice that gets itself paid</Line>
          {[
            ['0.0 s', 'the pain, already moving'],
            ['2.5 s', 'hard cut, the claim in giant type'],
            ['4.5 s', 'the product working, one camera move'],
            ['11.0 s', 'the promise in 3 to 6 words'],
          ].map(([t, b], i) => (
            <Line key={t} cue={cue} delay={0.6 + i * 0.15}>
              <span className={`inline-block w-14 ${DIM}`}>{t}</span>
              <span className={INK}>{b}</span>
            </Line>
          ))}
        </div>
      )
    case 3:
      return (
        <div className="space-y-2">
          <Line cue={cue} delay={0} className={DIM}>film.js</Line>
          <div className="grid grid-cols-3 gap-2">
            {['hook', 'claim', 'product'].map((s, i) => (
              <motion.div
                key={s}
                className="rounded-inset border border-sand-200 p-2 dark:border-sand-800"
                {...cue(0.3 + i * 0.25)}
              >
                <p className={`${MONO} ${DIM}`}>scene {i + 1}</p>
                <p className={`${MONO} ${INK}`}>{s}</p>
              </motion.div>
            ))}
          </div>
          <Line cue={cue} delay={1.3} className={DIM}>looking at its own frames before writing more</Line>
        </div>
      )
    case 4:
      return (
        <div className="space-y-2.5">
          <Line cue={cue} delay={0} className={DIM}>check: 2 notes, text too close to the edge</Line>
          <div className="grid grid-cols-9 gap-1">
            {Array.from({ length: 9 }, (_, i) => (
              <motion.span key={i} className="aspect-video rounded-sm bg-sand-200 dark:bg-sand-800" {...cue(0.3 + i * 0.07)} />
            ))}
          </div>
          <div className="grid grid-cols-12 gap-0.5">
            {Array.from({ length: 12 }, (_, i) => (
              <motion.span key={i} className="aspect-[3/4] rounded-[2px] bg-sand-300 dark:bg-sand-700" {...cue(1 + i * 0.04)} />
            ))}
          </div>
          <Line cue={cue} delay={1.9} className={INK}>
            {OK}check: clean
          </Line>
        </div>
      )
    default:
      return (
        <div className="space-y-3">
          <Bar cue={cue} delay={0.1} seconds={1} label="draft · 960x540 · 30 fps · one to three minutes" />
          <You cue={cue} delay={1.3}>yes</You>
          <Bar cue={cue} delay={1.8} seconds={1.6} label="4k · 3840x2160 · 60 fps" />
          <Line cue={cue} delay={3.4} className={INK}>
            {OK}film.mp4
          </Line>
        </div>
      )
  }
}

export function Process() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-20% 0px' })
  const still = useReducedMotion() ?? false
  const [step, setStep] = useState(0)
  const [held, setHeld] = useState(false)
  const playing = inView && !still && !held

  useEffect(() => {
    if (!playing) return
    const id = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), STEP_MS)
    return () => clearTimeout(id)
  }, [playing, step])

  const cue: Cue = (delay, t = { duration: 0.3, ease: EASE }) =>
    still
      ? { initial: false, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
      : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { ...t, delay } }

  return (
    <div ref={ref} className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:gap-10">
      <ol className="space-y-1">
        {STEPS.map((s, i) => {
          const on = i === step
          return (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => {
                  setStep(i)
                  setHeld(true)
                }}
                aria-current={on ? 'step' : undefined}
                className="group flex w-full cursor-pointer gap-4 rounded-inset py-2.5 pr-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <span className="relative w-0.5 shrink-0 overflow-hidden rounded-full bg-sand-300 dark:bg-sand-800">
                  {(i < step || (on && (held || still))) && <span className="absolute inset-0 bg-sand-900 dark:bg-sand-50" />}
                  {on && playing && (
                    <motion.span
                      key={step}
                      className="absolute inset-0 origin-top bg-sand-900 dark:bg-sand-50"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: STEP_MS / 1000, ease: 'linear' }}
                    />
                  )}
                </span>
                <span className="min-w-0">
                  <span className={`block font-mono text-xs ${DIM}`}>Step {String(i + 1).padStart(2, '0')}</span>
                  <span
                    className={`block text-base font-bold transition-colors duration-150 sm:text-lg ${
                      on ? INK : 'text-sand-600 group-hover:text-sand-900 dark:text-sand-400 dark:group-hover:text-sand-50'
                    }`}
                  >
                    {s.title}
                  </span>
                  <span
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <span className="overflow-hidden">
                      <span className={`block pt-1 text-[15px] leading-relaxed ${DIM}`}>{s.body}</span>
                    </span>
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <div
        aria-hidden
        className="flex min-h-[18rem] flex-col overflow-hidden rounded-card border border-sand-200 bg-sand-50 lg:self-start dark:border-sand-800 dark:bg-sand-950"
      >
        <div className="flex items-center justify-between border-b border-sand-200 px-4 py-2.5 dark:border-sand-800">
          <span className={`${MONO} ${DIM}`}>whoosh</span>
          <span className={`${MONO} ${DIM}`}>
            step {step + 1} of {STEPS.length}
          </span>
        </div>
        <div className="relative flex-1 p-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={still ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={still ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -12, transition: { duration: 0.2 } }}
              transition={{ duration: still ? 0 : 0.35, ease: EASE }}
            >
              <Panel step={step} cue={cue} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
