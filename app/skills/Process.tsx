'use client'

import { AnimatePresence, motion, useInView, type TargetAndTransition, type Transition } from 'framer-motion'
import { useMedia } from '../home/useMedia'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Bot } from '@/app/_icons/icons/bot'
import { Check } from '@/app/_icons/icons/check'
import { YOU_AVATAR } from './_lib/media'
import { WHOOSH } from './_lib/entries'

const STEP_MS = 3800
const LAST_STEP_MS = 5800
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

const AVATAR = 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sand-200 bg-sand-100 text-sand-700 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300'

function You({ cue, delay, children }: { cue: Cue; delay: number; children: ReactNode }) {
  return (
    <motion.div className="flex items-end justify-end gap-2" {...cue(delay)}>
      <p className="max-w-[85%] rounded-card rounded-br-sm bg-sand-900 px-3 py-1.5 text-[13px] font-semibold text-sand-50 dark:bg-sand-200 dark:text-sand-900">
        {children}
      </p>
      <span className={`${AVATAR} overflow-hidden`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a ready-sized 160px avatar from R2 */}
        <img src={YOU_AVATAR} alt="" width={24} height={24} className="h-full w-full object-cover" />
      </span>
    </motion.div>
  )
}

function Agent({ cue, delay, children }: { cue: Cue; delay: number; children: ReactNode }) {
  return (
    <div className="flex gap-2.5">
      <motion.span className={AVATAR} {...cue(delay)}>
        <Bot size={13} />
      </motion.span>
      <div className="min-w-0 flex-1 space-y-2 pt-0.5">{children}</div>
    </div>
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

// A display:contents wrapper cannot fade, so each grid cell carries its own cue.
function Field({ cue, delay, label, children }: { cue: Cue; delay: number; label: string; children: ReactNode }) {
  return (
    <>
      <motion.span className={`${MONO} ${DIM}`} {...cue(delay)}>{label}</motion.span>
      <motion.span {...cue(delay)}>{children}</motion.span>
    </>
  )
}

const OK = <Check size={13} className="mr-1.5 inline -translate-y-px text-success" />

function Panel({ step, cue }: { step: number; cue: Cue }) {
  switch (step) {
    case 0:
      return (
        <div className="space-y-4">
          <You cue={cue} delay={0}>Make a launch video for our invoice app. The site is example.com. What matters most: clients pay without being chased.</You>
          <Agent cue={cue} delay={0.7}>
            <Line cue={cue} delay={0.8} className={DIM}>reading example.com, the repo and the README</Line>
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
              <Field cue={cue} delay={1.2} label="the claim">
                <span className={`${MONO} ${INK}`}>&quot;the invoice that gets itself paid&quot;</span>
              </Field>
              <Field cue={cue} delay={1.5} label="colours">
                <span className="flex gap-1.5">
                  {['bg-sand-900 dark:bg-sand-50', 'bg-sand-600', 'bg-sand-300 dark:bg-sand-700', 'border border-sand-300 bg-sand-100 dark:border-sand-700 dark:bg-sand-900'].map((c) => (
                    <span key={c} className={`h-4 w-4 rounded-full ${c}`} />
                  ))}
                </span>
              </Field>
              <Field cue={cue} delay={1.8} label="type">
                <span className={INK}>
                  <span className="text-lg font-extrabold leading-none">Aa</span>
                  <span className={`${MONO} ml-2`}>Inter, 800 and 400</span>
                </span>
              </Field>
              <Field cue={cue} delay={2.1} label="to show">
                <span className="flex flex-wrap gap-1.5">
                  {['inbox', 'invoice', 'paid'].map((x) => (
                    <span key={x} className={`${MONO} rounded-chip border border-sand-200 px-2 dark:border-sand-800 ${INK}`}>{x}</span>
                  ))}
                </span>
              </Field>
            </div>
            <Line cue={cue} delay={2.5} className={INK}>
              {OK}only real words and numbers, nothing invented
            </Line>
          </Agent>
        </div>
      )
    case 1:
      return (
        <div className="space-y-4">
          <Agent cue={cue} delay={0}>
            <Line cue={cue} delay={0.05} className={INK}>Before I start, seven questions:</Line>
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              {[
                ['purpose', 'launch video'],
                ['format', '16:9'],
                ['feel', 'fast and punchy'],
                ['length', '15 s'],
                ['the line', 'written from your site'],
                ['brand', 'taken from your site'],
                ['sound', 'effects on the motion'],
              ].map(([q, d], i) => (
                <Field key={q} cue={cue} delay={0.2 + i * 0.12} label={q}>
                  <span className={`${MONO} ${INK}`}>{d}</span>
                </Field>
              ))}
            </div>
          </Agent>
          <You cue={cue} delay={1.5}>you decide</You>
        </div>
      )
    case 2:
      return (
        <Agent cue={cue} delay={0}>
          <Line cue={cue} delay={0.05} className={DIM}>treatment.md</Line>
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
        </Agent>
      )
    case 3:
      return (
        <Agent cue={cue} delay={0}>
          <Line cue={cue} delay={0.05} className={DIM}>film.js</Line>
          <div className="grid grid-cols-3 gap-2">
            {['hook', 'claim', 'product'].map((x, i) => (
              <motion.div key={x} className="rounded-inset border border-sand-200 p-2 dark:border-sand-800" {...cue(0.3 + i * 0.25)}>
                <p className={`${MONO} ${DIM}`}>scene {i + 1}</p>
                <p className={`${MONO} ${INK}`}>{x}</p>
              </motion.div>
            ))}
          </div>
          <Line cue={cue} delay={1.3} className={DIM}>looking at its own frames before writing more</Line>
        </Agent>
      )
    case 4:
      return (
        <Agent cue={cue} delay={0}>
          <Line cue={cue} delay={0.05} className={DIM}>check: 2 notes, text too close to the edge</Line>
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
        </Agent>
      )
    default:
      return (
        <div className="space-y-3">
          <Agent cue={cue} delay={0}>
            <Bar cue={cue} delay={0.1} seconds={0.9} label="draft · 960x540 · low res" />
          </Agent>
          <You cue={cue} delay={1.2}>make the title bigger</You>
          <Agent cue={cue} delay={1.7}>
            <Bar cue={cue} delay={1.8} seconds={0.6} label="draft 2 · title bigger" />
          </Agent>
          <You cue={cue} delay={2.7}>yes</You>
          <Agent cue={cue} delay={3.1}>
            <Bar cue={cue} delay={3.2} seconds={1.3} label="4k · 3840x2160 · 60 fps" />
            <Line cue={cue} delay={4.6} className={INK}>
              {OK}video.mp4
            </Line>
          </Agent>
        </div>
      )
  }
}

export function Process() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '-20% 0px' })
  const still = useMedia('(prefers-reduced-motion: reduce)', false)
  const [step, setStep] = useState(0)
  const [held, setHeld] = useState(false)
  const playing = inView && !still && !held

  useEffect(() => {
    if (!playing) return
    const id = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), step === STEPS.length - 1 ? LAST_STEP_MS : STEP_MS)
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
                      transition={{ duration: (i === STEPS.length - 1 ? LAST_STEP_MS : STEP_MS) / 1000, ease: 'linear' }}
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
        className="flex min-h-[22rem] flex-col overflow-hidden rounded-card border border-sand-200 bg-sand-50 lg:self-start dark:border-sand-800 dark:bg-sand-950"
      >
        <div className="flex items-center justify-between border-b border-sand-200 px-4 py-2.5 dark:border-sand-800">
          <span className={`${MONO} ${DIM}`}>/whoosh</span>
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
