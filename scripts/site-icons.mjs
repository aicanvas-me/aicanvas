#!/usr/bin/env node
// Gives the site its icons from the icon set's vault checkout: the React
// package's own files, copied unchanged, so the site runs exactly what a
// customer installs. The icons live only in the vault, so the output is
// gitignored, like the /icons data. app/_icons/site-icons.json lists the icons
// the site uses, each with the Phosphor icon it falls back to when no vault
// checkout is found (a public clone, a free-only build), so the site always
// builds with icons. The source, as in icons-data.mjs: ICONS_LOCAL_PATH,
// PREMIUM_LOCAL_PATH/icons, then the icon-library worktree.
//
//   app/_icons/vault/                              Icon.tsx + icons/<name>.ts, from icons/react
//   app/_icons/site-icons.premium.generated.tsx    re-exports them (or the Phosphor stand-ins)
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const OUT = join(ROOT, 'app/_icons/site-icons.premium.generated.tsx')
const VAULT = join(ROOT, 'app/_icons/vault')
const icons = JSON.parse(readFileSync(join(ROOT, 'app/_icons/site-icons.json'), 'utf8'))
const pascal = (name) => name.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('')

const SRC = [
  process.env.ICONS_LOCAL_PATH,
  process.env.PREMIUM_LOCAL_PATH && join(process.env.PREMIUM_LOCAL_PATH, 'icons'),
  join(homedir(), 'aicanvas-premium-icon-library/icons'),
].find((dir) => dir && existsSync(join(dir, 'react/icons/index.ts')))

// The leak guard blocks a commit of the output; the marker is joined so it skips this file.
const MARKER = ['AICANVAS', 'PREMIUM', 'DO', 'NOT', 'COMMIT'].join('-')
const HEAD = `// ${MARKER} - built by scripts/site-icons.mjs, do not edit.\n`

rmSync(VAULT, { recursive: true, force: true })
let body
if (SRC) {
  const missing = Object.keys(icons).filter((name) => !existsSync(join(SRC, 'react/icons', `${name}.ts`)))
  if (missing.length) throw new Error(`site-icons: not in the icon set: ${missing.join(', ')}`)
  mkdirSync(join(VAULT, 'icons'), { recursive: true })
  copyFileSync(join(SRC, 'react/Icon.tsx'), join(VAULT, 'Icon.tsx'))
  for (const name of Object.keys(icons)) copyFileSync(join(SRC, 'react/icons', `${name}.ts`), join(VAULT, 'icons', `${name}.ts`))
  body = `export type { IconProps, IconVariant } from './vault/Icon'
${Object.keys(icons).map((name) => `export { ${pascal(name)} } from './vault/icons/${name}'`).join('\n')}
`
} else {
  const names = Object.values(icons).filter((p, i, all) => all.indexOf(p) === i)
  body = `import type { SVGProps } from 'react'
import type { Icon as PhosphorIcon, IconWeight } from '@phosphor-icons/react'
import { ${names.map((p) => `${p} as Ph${p}`).join(', ')} } from '@phosphor-icons/react/dist/ssr'

export type IconVariant = 'linear' | 'duotone' | 'solid' | 'solid-duotone'
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  variant?: IconVariant
  size?: number | string
  strokeWidth?: number | string
  absoluteStrokeWidth?: boolean
}

// No vault checkout: the Phosphor icon each site icon stands in for.
const WEIGHT: Record<IconVariant, IconWeight> = { linear: 'regular', duotone: 'duotone', solid: 'fill', 'solid-duotone': 'fill' }
const wrap = (P: PhosphorIcon) =>
  function Icon({ variant = 'linear', strokeWidth = 1.5, absoluteStrokeWidth, ...rest }: IconProps) {
    void absoluteStrokeWidth
    return <P weight={variant === 'linear' && Number(strokeWidth) >= 2 ? 'bold' : WEIGHT[variant]} {...(rest as object)} />
  }

${Object.entries(icons).map(([name, p]) => `export const ${pascal(name)} = wrap(Ph${p})`).join('\n')}
`
}

writeFileSync(OUT, HEAD + body)
console.log(`site-icons: ${Object.keys(icons).length} icons from ${SRC ?? 'Phosphor (no vault checkout)'}`)
