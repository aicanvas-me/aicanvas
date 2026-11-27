'use client'

import { useState, type CSSProperties } from 'react'
import type { SpecimenIcon } from '../IconSpecimen'
import { IconSvg } from '@/app/icons/_components/IconSvg'
import { ICON_WEIGHTS } from '@/app/icons/_lib/icon-utils'
import { StageLight } from '@/app/components/StageLight'
import { buttonClasses } from '@/app/components/buttonClasses'
import { Heart } from '@/app/_icons/icons/heart'
import { HeartDuotone } from '@/app/_icons/icons/heart-duotone'
import { HeartSolid } from '@/app/_icons/icons/heart-solid'
import { HeartSolidDuotone } from '@/app/_icons/icons/heart-solid-duotone'
import { Bell } from '@/app/_icons/icons/bell'
import { Bolt } from '@/app/_icons/icons/bolt'
import { Star } from '@/app/_icons/icons/star'
import styles from './variant.module.css'

const COLOURS = [
  { label: 'Neutral', value: 'currentColor', swatch: 'var(--vb-neutral)' },
  { label: 'Cyan', value: '#22D3EE', swatch: '#22D3EE' },
  { label: 'Orange', value: '#FB923C', swatch: '#FB923C' },
  { label: 'Purple', value: '#A78BFA', swatch: '#A78BFA' },
  { label: 'Green', value: '#4ADE80', swatch: '#4ADE80' },
]
const FALLBACKS = [Heart, Bolt, Star, Bell]
const STYLES = [
  { name: 'Line', Icon: Heart, tier: 'Free' },
  { name: 'Duotone', Icon: HeartDuotone, tier: 'Premium' },
  { name: 'Solid', Icon: HeartSolid, tier: 'Premium' },
  { name: 'Solid duotone', Icon: HeartSolidDuotone, tier: 'Premium' },
]

export function IconWorkbench({ icons }: { icons: SpecimenIcon[] }) {
  const [size, setSize] = useState(32)
  const [weightIndex, setWeightIndex] = useState(2)
  const [colourIndex, setColourIndex] = useState(0)
  const weight = ICON_WEIGHTS[weightIndex]
  const colour = COLOURS[colourIndex]

  return (
    <div className={styles.workbenchContainer}>
      <div className={`${styles.workbench} relative overflow-hidden rounded-[24px] bg-sand-100 text-sand-900 dark:bg-sand-900 dark:text-sand-50`}>
        <StageLight />
        <div className="relative">
          <div className="flex items-center justify-between gap-3 border-b border-sand-200 px-5 py-4 dark:border-sand-800">
            <span className="text-xs font-semibold">Make them yours.</span>
            <span className="font-mono text-[10px] text-sand-600 dark:text-sand-400">LIVE PREVIEW / LINE</span>
          </div>
          <div className={styles.tuningLayout}>
            <div className={styles.iconGrid} aria-hidden>
              {(icons.length ? icons.slice(0, 24) : Array.from({ length: 24 }, (_, index) => ({ name: `fallback-${index}`, markup: '' }))).map((icon, index) => {
                const Fallback = FALLBACKS[index % FALLBACKS.length]
                return (
                  <span key={icon.name} className={styles.iconCell}>
                    <span key={colourIndex} className={colourIndex ? styles.colourPop : ''} style={{ '--vb-delay': `${((index % 6) + Math.floor(index / 6)) * 30}ms` } as CSSProperties}>
                      {icon.markup ? <IconSvg markup={icon.markup} size={size} weight={weight.id} colour={colour.value} /> : <Fallback size={size} weight={weight.id} color={colour.value} />}
                    </span>
                  </span>
                )
              })}
            </div>
            <div className={`${styles.controls} border-sand-200 dark:border-sand-800`}>
              <div>
                <label htmlFor="vb-icon-size" className="flex justify-between gap-2 text-xs font-semibold">Size<output className="font-mono font-normal text-sand-600 dark:text-sand-400">{size}px</output></label>
                <input id="vb-icon-size" type="range" min="24" max="48" step="1" value={size} onChange={event => setSize(Number(event.target.value))} className={styles.range} />
              </div>
              <div>
                <label htmlFor="vb-icon-weight" className="flex flex-wrap justify-between gap-1 text-xs font-semibold">Weight<output className="font-normal text-sand-600 dark:text-sand-400">{weight.label}</output></label>
                <input id="vb-icon-weight" type="range" min="0" max="4" step="1" value={weightIndex} aria-valuetext={weight.label} onChange={event => setWeightIndex(Number(event.target.value))} className={styles.range} />
                <div className="flex justify-between text-[9px] text-sand-600 dark:text-sand-400"><span>Thin</span><span>Extra Bold</span></div>
              </div>
              <fieldset className="min-w-0"><legend className="mb-2 text-xs font-semibold">Colour</legend><div className="flex flex-wrap gap-1">
                {COLOURS.map((item, index) => <button key={item.label} type="button" aria-label={`${item.label} icons`} aria-pressed={colourIndex === index} onClick={() => setColourIndex(index)} className={`${buttonClasses({ variant: 'icon', size: 'xs' })} ${styles.swatch} ${colourIndex === index ? styles.selectedSwatch : ''}`}><span style={{ background: item.swatch }} /></button>)}
              </div></fieldset>
            </div>
          </div>
          <div className="flex items-center justify-between border-y border-sand-200 px-5 py-3 dark:border-sand-800"><span className="text-[10px] font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">One family. Four expressions.</span><span className="font-mono text-[10px] text-sand-600 dark:text-sand-400">24 px grid</span></div>
          <div className="grid grid-cols-4 gap-1 px-3 py-5">
            {STYLES.map(({ name, Icon, tier }) => <div key={name} className="flex flex-col items-center gap-2 text-center"><Icon size={36} /><span className="mt-1 text-[10px] font-semibold sm:text-xs">{name}</span><span className="flex items-center gap-1 text-[9px] text-sand-600 dark:text-sand-400"><span aria-hidden className={`size-1 rounded-full ${tier === 'Free' ? 'bg-free' : 'bg-premium'}`} />{tier}</span></div>)}
          </div>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-sand-600 dark:text-sand-400">Go on. Drag a slider. Find your signature.</p>
    </div>
  )
}
