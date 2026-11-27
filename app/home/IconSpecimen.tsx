// The homepage's icon specimen: a spread of real Line glyphs over the same four
// icons drawn in all four styles, so the paid difference is visible rather than
// described. Server-rendered; the Line markup comes from the icon set, the four
// style rows from the React package the site itself installs.

import { Bell } from '@/app/_icons/icons/bell'
import { BellDuotone } from '@/app/_icons/icons/bell-duotone'
import { BellSolid } from '@/app/_icons/icons/bell-solid'
import { BellSolidDuotone } from '@/app/_icons/icons/bell-solid-duotone'
import { Bolt } from '@/app/_icons/icons/bolt'
import { BoltDuotone } from '@/app/_icons/icons/bolt-duotone'
import { BoltSolid } from '@/app/_icons/icons/bolt-solid'
import { BoltSolidDuotone } from '@/app/_icons/icons/bolt-solid-duotone'
import { Heart } from '@/app/_icons/icons/heart'
import { HeartDuotone } from '@/app/_icons/icons/heart-duotone'
import { HeartSolid } from '@/app/_icons/icons/heart-solid'
import { HeartSolidDuotone } from '@/app/_icons/icons/heart-solid-duotone'
import { Star } from '@/app/_icons/icons/star'
import { StarDuotone } from '@/app/_icons/icons/star-duotone'
import { StarSolid } from '@/app/_icons/icons/star-solid'
import { StarSolidDuotone } from '@/app/_icons/icons/star-solid-duotone'
import { IconSvg } from '../icons/_components/IconSvg'

export type SpecimenIcon = { name: string; markup: string }

const MUTED = 'text-sand-600 dark:text-sand-400'
const LABEL = 'text-[11px] font-semibold uppercase tracking-wider'

// One row per style, in the order the icon pages use them.
const STYLES = [
  { name: 'Line', premium: false, glyphs: [Heart, Bolt, Star, Bell] },
  { name: 'Duotone', premium: true, glyphs: [HeartDuotone, BoltDuotone, StarDuotone, BellDuotone] },
  { name: 'Solid', premium: true, glyphs: [HeartSolid, BoltSolid, StarSolid, BellSolid] },
  {
    name: 'Solid duotone',
    premium: true,
    glyphs: [HeartSolidDuotone, BoltSolidDuotone, StarSolidDuotone, BellSolidDuotone],
  },
]

// Two columns on a phone, four on a wide screen, so each cell draws only the
// edges its own row and column need.
const CELL = [
  '',
  'border-l',
  'border-t sm:border-t-0 sm:border-l',
  'border-l border-t sm:border-t-0',
]

export function IconSpecimen({ icons }: { icons: SpecimenIcon[] }) {
  return (
    <div className="overflow-hidden rounded-section border border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900">
      {icons.length > 0 && (
        <div
          aria-hidden
          className="grid grid-cols-7 gap-x-2 gap-y-5 px-5 py-7 sm:grid-cols-14 sm:gap-y-7 sm:px-8"
        >
          {icons.map(({ name, markup }) => (
            <span key={name} className={`flex items-center justify-center ${MUTED}`}>
              <IconSvg markup={markup} size={22} weight="regular" />
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 border-t border-sand-200 sm:grid-cols-4 dark:border-sand-800">
        {STYLES.map(({ name, premium, glyphs }, column) => (
          <div
            key={name}
            className={`flex flex-col gap-4 border-sand-200 p-5 sm:p-6 dark:border-sand-800 ${CELL[column]}`}
          >
            <span className="flex flex-wrap items-center gap-2">
              <span className={`${LABEL} text-sand-900 dark:text-sand-50`}>{name}</span>
              <span
                className={`inline-flex h-5 items-center gap-1 rounded-full border px-2 text-[10.5px] font-semibold ${
                  premium ? 'border-premium/30 text-premium' : 'border-free/30 text-free'
                }`}
              >
                <span className={`size-1.5 rounded-full ${premium ? 'bg-premium' : 'bg-free'}`} />
                {premium ? 'Premium' : 'Free'}
              </span>
            </span>
            <span aria-hidden className={`flex items-center gap-4 ${MUTED}`}>
              {glyphs.map((Glyph, i) => (
                <Glyph key={i} size={26} />
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
