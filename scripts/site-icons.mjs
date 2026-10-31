#!/usr/bin/env node
// Builds the site's own icons from the icon set's vault checkout. The icons
// live only in the vault, so the output is gitignored, like the /icons data.
// app/_icons/site-icons.json lists the icons the site uses, each with the
// Phosphor icon it falls back to when no vault checkout is found (a public
// clone, a free-only build), so the site always builds with icons.
// The source, as in icons-data.mjs: ICONS_LOCAL_PATH, PREMIUM_LOCAL_PATH/icons,
// then the icon-library worktree.
//
//   app/_icons/site-icons.premium.generated.tsx
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const OUT = join(ROOT, 'app/_icons/site-icons.premium.generated.tsx')
const icons = JSON.parse(readFileSync(join(ROOT, 'app/_icons/site-icons.json'), 'utf8'))
const pascal = (name) => name.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('')

const SRC = [
  process.env.ICONS_LOCAL_PATH,
  process.env.PREMIUM_LOCAL_PATH && join(process.env.PREMIUM_LOCAL_PATH, 'icons'),
  join(homedir(), 'aicanvas-premium-icon-library/icons'),
].find((dir) => dir && existsSync(join(dir, 'react/icons.ts')))

// The leak guard blocks a commit of the output; the marker is joined so it skips this file.
const MARKER = ['AICANVAS', 'PREMIUM', 'DO', 'NOT', 'COMMIT'].join('-')
const HEAD = `// ${MARKER} - built by scripts/site-icons.mjs, do not edit.
import type { SVGProps } from 'react'

export type IconVariant = 'linear' | 'duotone' | 'solid' | 'solid-duotone'
export interface IconProps extends SVGProps<SVGSVGElement> {
  variant?: IconVariant
  size?: number | string
  strokeWidth?: number | string
}
`

let body
if (SRC) {
  // One line per icon in the vault's generated React file; reuse the drawing
  // as is, under a hook-free createIcon so server components can render it.
  const lines = new Map()
  for (const line of readFileSync(join(SRC, 'react/icons.ts'), 'utf8').split('\n')) {
    const m = line.match(/^export const \w+ = \/\* @__PURE__ \*\/ createIcon\('([\w-]+)'/)
    if (m) lines.set(m[1], line)
  }
  const missing = Object.keys(icons).filter((name) => !lines.has(name))
  if (missing.length) throw new Error(`site-icons: not in the icon set: ${missing.join(', ')}`)
  body = `import { createElement } from 'react'

type IconNode = ReadonlyArray<readonly ['path' | 'circle', Readonly<Record<string, string>>]>

// The vault Icon's render, without its context. Its nonScalingStroke mode: lines stay
// strokeWidth screen px even when a class sets the size (size-4) instead of the size prop.
function createIcon(name: string, node: IconNode, styles: Partial<Record<Exclude<IconVariant, 'linear'>, IconNode>> = {}) {
  function Icon({ variant = 'linear', size = 24, color = 'currentColor', strokeWidth = 1.5, className, children, ...rest }: IconProps) {
    const labelled = rest['aria-label'] != null || rest['aria-labelledby'] != null || rest.role != null
    return createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        color,
        stroke: 'currentColor',
        strokeWidth,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        className: ['aic-icon', \`aic-icon-\${name}\`, className].filter(Boolean).join(' '),
        ...(labelled ? {} : { 'aria-hidden': true }),
        ...rest,
      },
      ...(variant === 'linear' ? node : (styles[variant] ?? node)).map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs, vectorEffect: 'non-scaling-stroke' })),
      children,
    )
  }
  Icon.displayName = name
  return Icon
}

${Object.keys(icons).map((name) => lines.get(name)).join('\n')}
`
} else {
  const names = Object.values(icons).filter((p, i, all) => all.indexOf(p) === i)
  body = `import type { Icon as PhosphorIcon, IconWeight } from '@phosphor-icons/react'
import { ${names.join(', ')} } from '@phosphor-icons/react/dist/ssr'

// No vault checkout: the Phosphor icon each site icon stands in for.
const WEIGHT: Record<IconVariant, IconWeight> = { linear: 'regular', duotone: 'duotone', solid: 'fill', 'solid-duotone': 'fill' }
const wrap = (P: PhosphorIcon) =>
  function Icon({ variant = 'linear', strokeWidth = 1.5, ref, ...rest }: IconProps) {
    void ref
    return <P weight={variant === 'linear' && Number(strokeWidth) >= 2 ? 'bold' : WEIGHT[variant]} {...(rest as object)} />
  }

${Object.entries(icons).map(([name, p]) => `export const ${pascal(name)} = wrap(${p})`).join('\n')}
`
}

writeFileSync(OUT, HEAD + '\n' + body)
console.log(`site-icons: ${Object.keys(icons).length} icons from ${SRC ?? 'Phosphor (no vault checkout)'}`)
