#!/usr/bin/env node
// Gives the site its icons from the icon set's vault checkout: the React
// package's own files, copied unchanged, so the site runs exactly what a
// customer installs, laid out as the package is (Icon.tsx + icons/<name>.ts).
// Site code imports each icon from its own file, never through a barrel: a
// server component importing one icon from a barrel ships every icon in it.
// The icons live only in the vault, so the output is gitignored, like the
// /icons data. app/_icons/site-icons.json lists the icons the site uses, each
// with the Phosphor icon it falls back to when no vault checkout is found (a
// public clone, a free-only build), so the site always builds with icons. The
// source, as in icons-data.mjs: ICONS_LOCAL_PATH, PREMIUM_LOCAL_PATH/icons,
// then the icon-library worktree.
//
//   app/_icons/Icon.tsx           the package's Icon.tsx (or the Phosphor stand-in)
//   app/_icons/icons/<name>.ts    one per site icon
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT = join(ROOT, 'app/_icons')
const icons = JSON.parse(readFileSync(join(OUT, 'site-icons.json'), 'utf8'))
const pascal = (name) => name.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('')

const SRC = [
  process.env.ICONS_LOCAL_PATH,
  process.env.PREMIUM_LOCAL_PATH && join(process.env.PREMIUM_LOCAL_PATH, 'icons'),
  join(homedir(), 'aicanvas-premium-icon-library/icons'),
].find((dir) => dir && existsSync(join(dir, 'react/icons/index.ts')))

// The leak guard blocks a commit of the output; the marker is joined so it skips this file.
const MARKER = ['AICANVAS', 'PREMIUM', 'DO', 'NOT', 'COMMIT'].join('-')

rmSync(join(OUT, 'icons'), { recursive: true, force: true })
mkdirSync(join(OUT, 'icons'))
if (SRC) {
  const missing = Object.keys(icons).filter((name) => !existsSync(join(SRC, 'react/icons', `${name}.ts`)))
  if (missing.length) throw new Error(`site-icons: not in the icon set: ${missing.join(', ')}`)
  copyFileSync(join(SRC, 'react/Icon.tsx'), join(OUT, 'Icon.tsx'))
  for (const name of Object.keys(icons)) copyFileSync(join(SRC, 'react/icons', `${name}.ts`), join(OUT, 'icons', `${name}.ts`))
} else {
  // Same contract as the package: client modules, ref, size 24, aria-hidden unless labelled, aic-icon classes.
  writeFileSync(
    join(OUT, 'Icon.tsx'),
    `'use client'
// ${MARKER} - built by scripts/site-icons.mjs, do not edit.
import { forwardRef, type ReactNode, type SVGProps } from 'react'
import type { Icon as PhosphorIcon, IconWeight } from '@phosphor-icons/react'

export type IconVariant = 'linear' | 'duotone' | 'solid' | 'solid-duotone'
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  variant?: IconVariant
  size?: number | string
  strokeWidth?: number | string
  absoluteStrokeWidth?: boolean
}

// Accepts the package's defaults so code type-checks; the stand-ins do not read them.
export function IconProvider({ children }: Pick<IconProps, 'variant' | 'size' | 'color' | 'strokeWidth' | 'absoluteStrokeWidth' | 'className'> & { children: ReactNode }) {
  return children
}

// No vault checkout: the Phosphor icon each site icon stands in for.
const WEIGHT: Record<IconVariant, IconWeight> = { linear: 'regular', duotone: 'duotone', solid: 'fill', 'solid-duotone': 'fill' }
export function wrap(name: string, P: PhosphorIcon) {
  const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon({ variant = 'linear', size = 24, strokeWidth = 1.5, absoluteStrokeWidth, className, ...rest }, ref) {
    void absoluteStrokeWidth
    const labelled = rest['aria-label'] != null || rest['aria-labelledby'] != null || rest.role != null
    return (
      <P
        ref={ref}
        size={size}
        weight={variant === 'linear' && Number(strokeWidth) >= 2 ? 'bold' : WEIGHT[variant]}
        className={['aic-icon', \`aic-icon-\${name}\`, className].filter(Boolean).join(' ')}
        {...(labelled ? {} : { 'aria-hidden': true })}
        {...(rest as object)}
      />
    )
  })
  Icon.displayName = name
  return Icon
}
`,
  )
  for (const [name, p] of Object.entries(icons))
    writeFileSync(
      join(OUT, 'icons', `${name}.ts`),
      `'use client'\n// ${MARKER} - built by scripts/site-icons.mjs, do not edit.\nimport { ${p} as Ph } from '@phosphor-icons/react'\nimport { wrap } from '../Icon'\n\nexport const ${pascal(name)} = wrap('${name}', Ph)\n`,
    )
}
console.log(`site-icons: ${Object.keys(icons).length} icons from ${SRC ?? 'Phosphor (no vault checkout)'}`)
