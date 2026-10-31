#!/usr/bin/env node
// Gives the site its icons from the icon set's vault checkout: the React
// package's own files, copied unchanged, so the site runs exactly what a
// customer installs, laid out as the package is (IconBase.tsx + icons/<key>.tsx).
// Site code imports each icon from its own file, never through a barrel: a
// server component importing one icon from a barrel ships every icon in it.
// The icons live only in the vault, so the output is gitignored, like the
// /icons data. app/_icons/site-icons.json lists the icons the site uses, each
// with the Phosphor icon it falls back to when no vault checkout is found (a
// public clone, a free-only build), so the site always builds with icons. The
// source, as in icons-data.mjs: ICONS_LOCAL_PATH, PREMIUM_LOCAL_PATH/icons,
// then the icon-library worktree.
//
//   app/_icons/IconBase.tsx       the package's runtime (or the Phosphor stand-in)
//   app/_icons/icons/<key>.tsx    one per site icon and style
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
].find((dir) => dir && existsSync(join(dir, 'react/IconBase.tsx')))

// The leak guard blocks a commit of the output; the marker is joined so it skips this file.
const MARKER = ['AICANVAS', 'PREMIUM', 'DO', 'NOT', 'COMMIT'].join('-')

rmSync(join(OUT, 'Icon.tsx'), { force: true })
rmSync(join(OUT, 'icons'), { recursive: true, force: true })
mkdirSync(join(OUT, 'icons'))
if (SRC) {
  const missing = Object.keys(icons).filter((name) => !existsSync(join(SRC, 'react/icons', `${name}.tsx`)))
  if (missing.length) throw new Error(`site-icons: not in the icon set: ${missing.join(', ')}`)
  copyFileSync(join(SRC, 'react/IconBase.tsx'), join(OUT, 'IconBase.tsx'))
  for (const name of Object.keys(icons)) copyFileSync(join(SRC, 'react/icons', `${name}.tsx`), join(OUT, 'icons', `${name}.tsx`))
} else {
  // Same server-safe contract; Phosphor does not read the provider's CSS variables.
  writeFileSync(
    join(OUT, 'IconBase.tsx'),
    `// ${MARKER} - built by scripts/site-icons.mjs, do not edit.
import { Children, forwardRef, isValidElement, type CSSProperties, type ReactNode, type SVGProps } from 'react'
import type { Icon as PhosphorIcon, IconWeight } from '@phosphor-icons/react'

export type IconNode = ReadonlyArray<readonly ['path' | 'circle', Readonly<Record<string, string>>]>
export type IconStyle = 'line' | 'duotone' | 'solid' | 'solid-duotone'
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  size?: number | string
  color?: string
  strokeWidth?: number | string
  absoluteStrokeWidth?: boolean
}

export interface IconProviderProps {
  strokeWidth?: number | string
  absoluteStrokeWidth?: boolean
  color?: string
  children: ReactNode
}

type ProviderStyle = CSSProperties & {
  '--aic-icon-stroke'?: number | string
  '--aic-icon-vector-effect'?: 'none'
}

export function IconProvider({ strokeWidth, absoluteStrokeWidth, color, children }: IconProviderProps) {
  const style: ProviderStyle = { display: 'contents' }
  if (strokeWidth !== undefined) style['--aic-icon-stroke'] = strokeWidth
  if (absoluteStrokeWidth === false) style['--aic-icon-vector-effect'] = 'none'
  if (color !== undefined) style.color = color
  return <span style={style}>{children}</span>
}

// No vault checkout: the Phosphor icon each site icon stands in for.
const WEIGHT: Record<IconStyle, IconWeight> = { line: 'regular', duotone: 'duotone', solid: 'fill', 'solid-duotone': 'fill' }
export function wrap(name: string, iconStyle: IconStyle, P: PhosphorIcon) {
  const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon({ size = 24, strokeWidth, absoluteStrokeWidth, className, children, ...rest }, ref) {
    void absoluteStrokeWidth
    const titled = Children.toArray(children).some((child) => isValidElement(child) && child.type === 'title')
    const labelled = titled || rest['aria-label'] != null || rest['aria-labelledby'] != null || rest.role != null
    return (
      <P
        ref={ref}
        size={size}
        weight={iconStyle === 'line' && Number(strokeWidth) >= 2 ? 'bold' : WEIGHT[iconStyle]}
        className={['aic-icon', \`aic-icon-\${name}\`, iconStyle !== 'line' && \`aic-icon-\${iconStyle}\`, className].filter(Boolean).join(' ')}
        {...(labelled ? (titled && rest.role == null ? { role: 'img' } : {}) : { 'aria-hidden': true })}
        {...rest}
      >
        {children}
      </P>
    )
  })
  Icon.displayName = name
  return Icon
}
`,
  )
  for (const [key, p] of Object.entries(icons)) {
    const suffix = key.match(/-(solid-duotone|solid|duotone)$/)
    const name = suffix ? key.slice(0, -suffix[0].length) : key
    const iconStyle = suffix?.[1] ?? 'line'
    writeFileSync(
      join(OUT, 'icons', `${key}.tsx`),
      `// ${MARKER} - built by scripts/site-icons.mjs, do not edit.\nimport { ${p} as Ph } from '@phosphor-icons/react/dist/ssr'\nimport { wrap } from '../IconBase'\n\nexport const ${pascal(key)} = wrap('${name}', '${iconStyle}', Ph)\nexport const ${pascal(key)}Icon = ${pascal(key)}\n`,
    )
  }
}
console.log(`site-icons: ${Object.keys(icons).length} icons from ${SRC ?? 'Phosphor (no vault checkout)'}`)
