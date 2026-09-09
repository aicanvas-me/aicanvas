// Server-only registry: reads Andromeda component sources from disk with `fs`
// and `process.cwd()`, so a 'use client' file must never import it. Client-safe
// metadata lives in `andromeda-meta.ts`.
import { readFileSync } from 'fs'
import { join } from 'path'
import {
  ANDROMEDA_COMPONENT_META,
  type AndromedaComponentMeta,
} from './andromeda-meta'

const COMPONENTS_ROOT = join(
  process.cwd(),
  'design-systems',
  'andromeda',
  'components',
)

export type AndromedaComponentEntry = AndromedaComponentMeta & {
  code: string
}

function readSource(file: string): string {
  try {
    return readFileSync(join(COMPONENTS_ROOT, file), 'utf-8')
  } catch {
    return `// Source not found: ${file}`
  }
}

export const ANDROMEDA_COMPONENTS: AndromedaComponentEntry[] =
  ANDROMEDA_COMPONENT_META.map((e) => ({ ...e, code: readSource(e.sourceFile) }))

export function getAndromedaComponent(
  slug: string,
): AndromedaComponentEntry | undefined {
  return ANDROMEDA_COMPONENTS.find((c) => c.slug === slug)
}
