'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { SpecimenIcon } from '../variant-types'
import { IconSvg } from '@/app/icons/_components/IconSvg'
import { ICON_WEIGHTS } from '@/app/icons/_lib/icon-utils'
import { StageLight } from '@/app/components/StageLight'
import { buttonClasses } from '@/app/components/buttonClasses'
import { Heart } from '@/app/_icons/icons/heart'
import { Bell } from '@/app/_icons/icons/bell'
import { Bolt } from '@/app/_icons/icons/bolt'
import { Star } from '@/app/_icons/icons/star'
import styles from './variant.module.css'

const COLOURS = [
  { label: 'Neutral', value: 'currentColor', swatch: 'var(--vb-neutral)' },
  { label: 'Cyan', value: 'var(--premium)', swatch: 'var(--premium)' },
  { label: 'Orange', value: 'var(--free)', swatch: 'var(--free)' },
  { label: 'Purple', value: 'var(--new)', swatch: 'var(--new)' },
  { label: 'Green', value: 'var(--success)', swatch: 'var(--success)' },
]
const FALLBACKS = [Heart, Bolt, Star, Bell]
const CELLS = 32
// A cell's place in the colour wave for each column count the grid can take.
const wave = (index: number, columns: number) => `${((index % columns) + Math.floor(index / columns)) * 30}ms`

export function IconWorkbench({ icons }: { icons: SpecimenIcon[] }) {
  const panel = useRef<HTMLDivElement>(null)
  const stopDemo = useRef<() => void>(() => {})
  const [{ size, weightIndex, colourIndex }, setTuning] = useState({ size: 24, weightIndex: 2, colourIndex: 0 })
  const weight = ICON_WEIGHTS[weightIndex]
  const colour = COLOURS[colourIndex]

  useEffect(() => {
    const element = panel.current
    if (!element) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let started = false
    let stopped = reduced.matches
    const stop = () => {
      stopped = true
      cancelAnimationFrame(frame)
    }
    stopDemo.current = stop

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.5) {
        if (started) stop()
        return
      }
      if (started || stopped || document.hidden) return
      started = true
      let start: number | undefined
      const tick = (now: number) => {
        if (stopped) return
        start ??= now
        const elapsed = now - start
        // One five-second demonstration, then the controls belong to the visitor.
        const progress = Math.min(elapsed / 1400, 1)
        const nextSize = Math.round(24 + 24 * (1 - (1 - progress) ** 3))
        const nextWeight = elapsed < 1000 ? 2 : elapsed < 1800 ? 0 : elapsed < 2800 ? 4 : 2
        const nextColour = elapsed < 2600 ? 0 : elapsed < 3400 ? 1 : elapsed < 4100 ? 3 : 4
        setTuning(current => current.size === nextSize && current.weightIndex === nextWeight && current.colourIndex === nextColour
          ? current
          : { size: nextSize, weightIndex: nextWeight, colourIndex: nextColour })
        if (elapsed < 5000) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }, { threshold: [0, 0.5] })
    observer.observe(element)
    const onPreference = () => { if (reduced.matches) stop() }
    const onVisibility = () => { if (document.hidden && started) stop() }
    reduced.addEventListener('change', onPreference)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      observer.disconnect()
      reduced.removeEventListener('change', onPreference)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const takeControl = () => stopDemo.current()

  return (
    <div className={styles.workbenchContainer}>
      <div ref={panel} className={`${styles.workbench} relative overflow-hidden rounded-section bg-sand-100 text-sand-900 dark:bg-sand-900 dark:text-sand-50`}>
        <StageLight />
        <div className="relative">
          <div className="flex items-center justify-between gap-3 border-b border-sand-200 px-5 py-4 dark:border-sand-800">
            <span className="text-xs font-semibold">Icon workbench</span>
            <span className="font-mono text-[11px] text-sand-600 dark:text-sand-400">LIVE PREVIEW / LINE</span>
          </div>
          <div>
            <div className={styles.iconGrid} aria-hidden>
              {(icons.length ? icons.slice(0, CELLS) : Array.from({ length: CELLS }, (_, index) => ({ name: `fallback-${index}`, markup: '' }))).map((icon, index) => {
                const Fallback = FALLBACKS[index % FALLBACKS.length]
                return (
                  <span key={icon.name} className={styles.iconCell}>
                    <span key={colourIndex} className={colourIndex ? styles.colourPop : ''} style={{ '--vb-delay-8': wave(index, 8), '--vb-delay-6': wave(index, 6), '--vb-delay-4': wave(index, 4) } as CSSProperties}>
                      {icon.markup ? <IconSvg markup={icon.markup} size={size} weight={weight.id} colour={colour.value} /> : <Fallback size={size} weight={weight.id} color={colour.value} />}
                    </span>
                  </span>
                )
              })}
            </div>
            <div onPointerDownCapture={takeControl} onFocusCapture={takeControl} onKeyDownCapture={takeControl} className={`${styles.controls} border-sand-200 dark:border-sand-800`}>
              <div>
                <label htmlFor="vb-icon-size" className="flex justify-between gap-2 text-xs font-semibold">Size<output aria-live="off" className="font-mono font-normal text-sand-600 dark:text-sand-400">{size}px</output></label>
                <input id="vb-icon-size" type="range" min="24" max="48" step="1" value={size} onChange={event => { takeControl(); setTuning(current => ({ ...current, size: Number(event.target.value) })) }} className={styles.range} />
              </div>
              <div>
                <label htmlFor="vb-icon-weight" className="flex flex-wrap justify-between gap-1 text-xs font-semibold">Weight<output aria-live="off" className="font-normal text-sand-600 dark:text-sand-400">{weight.label}</output></label>
                <input id="vb-icon-weight" type="range" min="0" max="4" step="1" value={weightIndex} aria-valuetext={weight.label} onChange={event => { takeControl(); setTuning(current => ({ ...current, weightIndex: Number(event.target.value) })) }} className={styles.range} />
                <div className="flex justify-between gap-2 text-[11px] text-sand-600 dark:text-sand-400"><span>Thin</span><span>Extra Bold</span></div>
              </div>
              <fieldset className="min-w-0"><legend className="mb-2 text-xs font-semibold">Colour</legend><div className="flex flex-wrap gap-1">
                {COLOURS.map((item, index) => <button key={item.label} type="button" aria-label={`${item.label} icons`} aria-pressed={colourIndex === index} onClick={() => { takeControl(); setTuning(current => ({ ...current, colourIndex: index })) }} className={`${buttonClasses({ variant: 'icon', size: 'xs' })} ${styles.swatch} ${colourIndex === index ? styles.selectedSwatch : ''}`}><span style={{ background: item.swatch }} /></button>)}
              </div></fieldset>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-sand-600 dark:text-sand-400">Go on. Drag a slider. Find your signature.</p>
    </div>
  )
}
