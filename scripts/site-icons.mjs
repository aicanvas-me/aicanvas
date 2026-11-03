#!/usr/bin/env node
// Gives the site its icons from the icon set's vault checkout: the React
// package's own files, copied unchanged, so the site runs exactly what a
// customer installs, laid out as the package is (IconBase.tsx + icons/<key>.tsx).
// Site code imports each icon from its own file, never through a barrel: a
// server component importing one icon from a barrel ships every icon in it.
// The icons live only in the vault, so the output is gitignored, like the
// /icons data. app/_icons/site-icons.json lists the icons the site uses. When no
// vault checkout is found (a public clone, a free-only build) each one becomes an
// empty placeholder of the right size, so a build without the vault still compiles.
// The source, as in icons-data.mjs: ICONS_LOCAL_PATH, PREMIUM_LOCAL_PATH/icons,
// then the icon-library worktree.
//
//   app/_icons/IconBase.tsx       the package's runtime (or the placeholder runtime)
//   app/_icons/icons/<key>.tsx    one per site icon and style
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { iconSourceCandidates } from './lib/icon-source.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT = join(ROOT, 'app/_icons')
const names = JSON.parse(readFileSync(join(OUT, 'site-icons.json'), 'utf8'))
const pascal = (name) => name.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('')

const SRC = iconSourceCandidates(ROOT).find((dir) => existsSync(join(dir, 'react/IconBase.tsx')))

// The leak guard blocks a commit of the output; the marker is joined so it skips this file.
const MARKER = ['AICANVAS', 'PREMIUM', 'DO', 'NOT', 'COMMIT'].join('-')

rmSync(join(OUT, 'Icon.tsx'), { force: true })
rmSync(join(OUT, 'icons'), { recursive: true, force: true })
mkdirSync(join(OUT, 'icons'))
if (SRC) {
  const missing = names.filter((name) => !existsSync(join(SRC, 'react/icons', `${name}.tsx`)))
  if (missing.length) throw new Error(`site-icons: not in the icon set: ${missing.join(', ')}`)
  copyFileSync(join(SRC, 'react/IconBase.tsx'), join(OUT, 'IconBase.tsx'))
  for (const name of names) copyFileSync(join(SRC, 'react/icons', `${name}.tsx`), join(OUT, 'icons', `${name}.tsx`))
} else {
  // Same server-safe contract; the placeholder ignores weight.
  writeFileSync(
    join(OUT, 'IconBase.tsx'),
    `// ${MARKER} - built by scripts/site-icons.mjs, do not edit.
import { Children, forwardRef, isValidElement, type CSSProperties, type ReactNode, type SVGProps } from 'react'

export type IconNode = ReadonlyArray<readonly ['path' | 'circle', Readonly<Record<string, string>>]>
export type IconStyle = 'line' | 'duotone' | 'solid' | 'solid-duotone'
export type IconWeight = 'thin' | 'light' | 'regular' | 'bold'
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref' | 'strokeWidth'> {
  size?: number | string
  color?: string
  weight?: IconWeight
}

export interface IconProviderProps {
  weight?: IconWeight
  color?: string
  children: ReactNode
}

export function IconProvider({ color, children }: IconProviderProps) {
  const style: CSSProperties = { display: 'contents' }
  if (color !== undefined) style.color = color
  return <span style={style}>{children}</span>
}

// No vault checkout: an empty placeholder of the right size.
export function wrap(name: string, iconStyle: IconStyle) {
  const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon({ size = 24, color, weight, className, children, ...rest }, ref) {
    void color
    void weight
    const titled = Children.toArray(children).some((child) => isValidElement(child) && child.type === 'title')
    const labelled = titled || rest['aria-label'] != null || rest['aria-labelledby'] != null || rest.role != null
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={['aic-icon', \`aic-icon-\${name}\`, iconStyle !== 'line' && \`aic-icon-\${iconStyle}\`, className].filter(Boolean).join(' ')}
        {...(labelled ? (titled && rest.role == null ? { role: 'img' } : {}) : { 'aria-hidden': true })}
        {...rest}
      >
        {children}
      </svg>
    )
  })
  Icon.displayName = name
  return Icon
}
`,
  )
  for (const key of names) {
    const suffix = key.match(/-(solid-duotone|solid|duotone)$/)
    const name = suffix ? key.slice(0, -suffix[0].length) : key
    const iconStyle = suffix?.[1] ?? 'line'
    writeFileSync(
      join(OUT, 'icons', `${key}.tsx`),
      `// ${MARKER} - built by scripts/site-icons.mjs, do not edit.\nimport { wrap } from '../IconBase'\n\nexport const ${pascal(key)} = wrap('${name}', '${iconStyle}')\nexport const ${pascal(key)}Icon = ${pascal(key)}\n`,
    )
  }
}
console.log(`site-icons: ${names.length} icons from ${SRC ?? 'empty placeholders (no vault checkout)'}`)
