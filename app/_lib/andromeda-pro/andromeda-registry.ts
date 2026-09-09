// Server-only registry — reads Andromeda component sources from disk so
// each per-component page can ship the source as a string.
//
// CLIENT components must NOT import this file (it pulls in `fs` and
// `process.cwd()`). Use `andromeda-meta.ts` for client-safe metadata.

// NB: this module is implicitly server-only because it uses `fs` and
// `process.cwd()` at module scope. Do not import it from a 'use client' file.
import { readFileSync } from 'fs'
import { join } from 'path'
import {
  ANDROMEDA_COMPONENT_META,
  ANDROMEDA_META,
  type AndromedaComponentMeta,
} from './andromeda-meta'

export { ANDROMEDA_META, type AndromedaComponentMeta } from './andromeda-meta'

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
