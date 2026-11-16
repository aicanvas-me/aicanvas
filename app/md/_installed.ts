import 'server-only'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Usage } from '@/lib/agent-markdown/component'

// Where an install lands and how to import it, read from the emitted registry item.
// Only paths and export names leave this file, never file content.
interface Item {
  registryDependencies?: string[]
  files?: { target?: string; content?: string }[]
}

function item(registrySlug: string): Item | null {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'registry-data', `${registrySlug}.json`), 'utf8')) as Item
  } catch {
    return null
  }
}

/** Entry file, import line and render line; null when the item or its export is not found. */
export function installedUsage(registrySlug: string, entry: 'first' | 'index' = 'first'): Usage | null {
  const files = item(registrySlug)?.files ?? []
  const file = entry === 'index' ? files.find((f) => f.target?.endsWith('/index.tsx')) : files[0]
  if (!file?.target || !file.content) return null
  const modulePath = '@/' + file.target.replace(entry === 'index' ? /\/index\.tsx$/ : /\.tsx?$/, '')
  const base = file.target.split('/').pop()!.replace(/\.tsx?$/, '')
  const def = file.content.match(/^export default (?:function\s+)?([A-Z]\w*)/m)?.[1]
  if (def) return { file: file.target, importLine: `import ${def} from '${modulePath}'`, render: `<${def} />` }
  const named = new RegExp(`^export (?:const|function) (${base})\\b`, 'm').exec(file.content)?.[1]
  if (named) return { file: file.target, importLine: `import { ${named} } from '${modulePath}'` }
  return null
}

/** Registry slugs a template pulls in with it (components, tokens, icons). */
export function installedDependencies(registrySlug: string): string[] {
  return (item(registrySlug)?.registryDependencies ?? []).map((u) => u.split('/').pop()!.replace(/\.json$/, ''))
}
