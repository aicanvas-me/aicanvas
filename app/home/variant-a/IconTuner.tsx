'use client'

// The icon tuner from the icons film, made real: a panel of Line icons that
// answers three controls. The first time it scrolls into view it plays the
// film's moves once (size up, weight down then up, three colours), then the
// controls belong to the visitor. Reduced motion skips the demo.

import { useEffect, useRef, useState } from 'react'
import { IconSvg } from '../../icons/_components/IconSvg'
import { ICON_WEIGHTS } from '../../icons/_lib/icon-utils'
import type { SpecimenIcon } from '../IconSpecimen'
import { useMedia } from '../useMedia'

// The ink swatch follows the theme; the others are the site's own role colours,
// tuned per theme, so every choice stays legible on both panels.
const COLOURS = [
  { id: 'ink', label: 'Ink', value: 'currentColor' },
  { id: 'cyan', label: 'Cyan', value: 'var(--premium)' },
  { id: 'orange', label: 'Orange', value: 'var(--free)' },
  { id: 'purple', label: 'Purple', value: 'var(--new)' },
  { id: 'green', label: 'Green', value: 'var(--success)' },
]

const MIN = 16
const MAX = 40

// The film's moves as [ms from start, change]; each step is one state write.
type Step = [number, { size?: number; weight?: number; colour?: number }]
const DEMO: Step[] = [
  [500, { size: 34 }],
  [1600, { weight: 1 }],
  [1800, { weight: 0 }],
  [2400, { weight: 2 }],
  [2600, { weight: 3 }],
  [2800, { weight: 4 }],
  [3400, { weight: 3 }],
  [3600, { weight: 2 }],
  [4100, { colour: 2 }],
  [4700, { colour: 3 }],
  [5300, { colour: 1 }],
  [6300, { colour: 0 }],
]

const LABEL = 'text-[13px] font-semibold text-sand-700 dark:text-sand-300'
const VALUE = 'font-mono text-[12px] text-sand-900 dark:text-sand-50'
const RANGE =
  'mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-sand-300 accent-sand-900 dark:bg-sand-700 dark:accent-sand-50'

export function IconTuner({ icons }: { icons: SpecimenIcon[] }) {
  const [size, setSize] = useState(20)
  const [weight, setWeight] = useState(2)
  const [colour, setColour] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const touched = useRef(false)
  const still = useMedia('(prefers-reduced-motion: reduce)', false)

  // One demo per visit, when half the panel is on screen; any touch ends it.
  useEffect(() => {
    const el = root.current
    if (!el || still) return
    const timers: number[] = []
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        for (const [at, change] of DEMO) {
          timers.push(
            window.setTimeout(() => {
              if (touched.current) return
              if (change.size !== undefined) setSize(change.size)
              if (change.weight !== undefined) setWeight(change.weight)
              if (change.colour !== undefined) setColour(change.colour)
            }, at),
          )
        }
      },
      { threshold: 0.5 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      timers.forEach(clearTimeout)
    }
  }, [still])

  // A colour change runs a pop through the grid, corner to corner, like the film.
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    if (still || !grid.current) return
    Array.from(grid.current.children).forEach((cell, i) => {
      (cell as HTMLElement).animate(
        [
          { transform: 'scale(0.82)' },
          { transform: 'scale(1.04)' },
          { transform: 'scale(1)' },
        ],
        {
          duration: 360,
          delay: ((i % 6) + Math.floor(i / 6)) * 30,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
      )
    })
  }, [colour, still])

  const take = () => {
    touched.current = true
  }

  const weightEntry = ICON_WEIGHTS[weight]

  return (
    <div
      ref={root}
      className="grid gap-6 p-5 sm:p-7 md:grid-cols-[1fr_200px] md:gap-0"
      onPointerDown={take}
      onKeyDown={take}
    >
      <div
        ref={grid}
        aria-hidden
        className="grid grid-cols-6 text-sand-900 md:pr-7 dark:text-sand-50 [&_svg]:transition-[width,height,stroke-width] [&_svg]:duration-300 [&_svg]:ease-out motion-reduce:[&_svg]:transition-none"
        style={{
          color:
            COLOURS[colour].value === 'currentColor'
              ? undefined
              : COLOURS[colour].value,
        }}
      >
        {icons.slice(0, 24).map(({ name, markup }) => (
          <span
            key={name}
            className="flex aspect-square items-center justify-center"
          >
            <IconSvg markup={markup} size={`${size}px`} weight={weightEntry.id} />
          </span>
        ))}
      </div>

      <div className="flex flex-col justify-center gap-8 border-sand-200 md:border-l md:pl-7 dark:border-sand-800">
        <label className="block">
          <span className="flex items-baseline justify-between">
            <span className={LABEL}>Size</span>
            <span className={VALUE}>{size}px</span>
          </span>
          <input
            type="range"
            min={MIN}
            max={MAX}
            step={1}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className={RANGE}
          />
        </label>

        <label className="block">
          <span className="flex items-baseline justify-between">
            <span className={LABEL}>Weight</span>
            <span className={VALUE}>{weightEntry.label}</span>
          </span>
          <input
            type="range"
            min={0}
            max={ICON_WEIGHTS.length - 1}
            step={1}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className={RANGE}
          />
        </label>

        <fieldset>
          <legend className={LABEL}>Colour</legend>
          <div className="mt-3 flex gap-2.5">
            {COLOURS.map((c, i) => (
              <button
                key={c.id}
                type="button"
                aria-label={c.label}
                aria-pressed={i === colour}
                onClick={() => setColour(i)}
                className={`size-7 rounded-full transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-900 dark:focus-visible:ring-sand-50 ${
                  i === colour
                    ? 'ring-2 ring-sand-900 ring-offset-2 ring-offset-sand-100 dark:ring-sand-50 dark:ring-offset-sand-900'
                    : ''
                } ${c.id === 'ink' ? 'bg-sand-900 dark:bg-sand-50' : ''}`}
                style={c.id === 'ink' ? undefined : { background: c.value }}
              />
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  )
}
