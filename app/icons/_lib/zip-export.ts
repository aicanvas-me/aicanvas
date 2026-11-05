import 'server-only'

import { strToU8, zipSync, type Zippable } from 'fflate'
import { buildSvg } from './svg'
import { iconFileName, takesStroke, type IconWeight } from './icon-utils'
import type { IconStyle } from './types'

export type ZipFormat = 'svg' | 'react'

export interface IconZipInput {
  style: IconStyle
  format: ZipFormat
  size: number
  weight: IconWeight
  colour: string | null
  names: string[]
  markup: Record<string, string>
  react: { base: string; files: Record<string, string> }
}

const ZIP_DATE = new Date('1980-01-01T00:00:00.000Z')

function addText(entries: Zippable, path: string, text: string) {
  entries[path] = [strToU8(text), { mtime: ZIP_DATE }]
}

function preset(input: IconZipInput) {
  const hasStroke = takesStroke(input.style)
  return {
    style: input.style,
    format: input.format,
    size: input.size,
    weight: hasStroke ? input.weight : null,
    colour: input.colour,
    count: input.names.length,
    generatedAt: new Date().toISOString(),
  }
}

function readme(input: IconZipInput): string {
  const colour = input.colour ?? 'currentColor'
  const weight = takesStroke(input.style) ? `${input.weight} weight` : 'fixed solid weight'
  const contents =
    input.format === 'react'
      ? 'React icon components and their shared IconBase runtime'
      : `${input.format.toUpperCase()} files for ${input.names.length} icons`

  return [
    `AI Canvas icons: ${contents}.`,
    `Preset: ${input.style} style, ${input.size}px, ${weight}, colour ${colour}.`,
    input.format === 'react'
      ? "Import example: import { Search } from '@/components/icons/search'"
      : `Files are in the ${input.format}/ folder.`,
    ...(input.format === 'react'
      ? [
          'The export name is the PascalCase file name. Paid styles add Duotone / Solid / SolidDuotone. A name starting with a digit gets an Icon prefix.',
          '<IconProvider weight="..."> from IconBase sets defaults.',
        ]
      : []),
    'See preset.json for the machine-readable settings used for this export.',
    'Licensed to AI Canvas Premium subscribers: https://aicanvas.me/premium-license',
    '',
  ].join('\n')
}

function addReactFiles(entries: Zippable, input: IconZipInput) {
  addText(entries, 'components/icons/IconBase.tsx', input.react.base)

  const added = new Set<string>()
  for (const name of input.names) {
    const file = `${iconFileName(name, input.style)}.tsx`
    const source = input.react.files[file]
    if (source === undefined) continue
    addText(entries, `components/icons/${file}`, source)
    added.add(file)
  }

  for (const file of Object.keys(input.react.files).sort()) {
    if (added.has(file)) continue
    addText(entries, `components/icons/${file}`, input.react.files[file])
  }
}

export async function buildIconZip(input: IconZipInput): Promise<Uint8Array> {
  const entries: Zippable = {}

  if (input.format === 'svg') {
    for (const name of input.names) {
      addText(
        entries,
        `svg/${name}.svg`,
        buildSvg(input.markup[name], input.size, input.weight, input.colour, input.style),
      )
    }
  } else {
    addReactFiles(entries, input)
  }

  addText(entries, 'preset.json', `${JSON.stringify(preset(input), null, 2)}\n`)
  addText(entries, 'README.txt', readme(input))

  return zipSync(entries, { level: 6 })
}

export function zipFileName(style: IconStyle, format: ZipFormat): string {
  return `aicanvas-icons-${style}-${format}.zip`
}
