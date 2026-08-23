/**
 * Parse the hand-authored `@typedef` / `@property` JSDoc blocks that Andromeda
 * design-system components already carry into structured prop rows, so the
 * component pages can render a props table without a typing pass or a docgen
 * dependency (react-docgen-typescript would need the files typed first and
 * floods the table with inherited DOM props). The blocks are hand-authored, so
 * a component file without one simply yields no table.
 *
 * Zero-dependency, string-only — the same shape as the other scripts/ generators
 * (generate-component-codes.mjs, generate-registry.mjs). A component file may
 * declare more than one prop block (compound components like Table →
 * TableRow / TableHeader / TableCell); each becomes its own table.
 *
 * Input:  raw component source.
 * Output: { [tableName]: PropRow[] }, tableName = the @typedef name minus a
 *         trailing "Props". PropRow = { name, type, optional, default, description }.
 */

/**
 * Extract a balanced-brace `{...}` type at the start of `str`. The type can
 * itself contain braces (`React.ComponentType<{ size?: number }>`), so a naive
 * `\{[^}]*\}` is wrong — scan for the matching close brace.
 * Returns { type, rest } where rest is the remainder after the closing brace.
 */
function takeBraceType(str) {
  if (str[0] !== '{') return { type: '', rest: str }
  let depth = 0
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{') depth++
    else if (str[i] === '}') {
      depth--
      if (depth === 0) return { type: str.slice(1, i).trim(), rest: str.slice(i + 1).trim() }
    }
  }
  return { type: str.slice(1).trim(), rest: '' } // unterminated — defensive
}

/** Parse one `@property` payload (everything after "@property "). */
function parseProperty(payload) {
  const { type, rest } = takeBraceType(payload.trim())
  let name = '', optional = false, def = '', description = rest

  if (rest[0] === '[') {
    // Balanced bracket scan — the default value can itself contain `]`
    // (e.g. `[modes=['area','bar']]`), so stopping at the first `]` is wrong.
    optional = true
    let depth = 0, end = -1
    for (let i = 0; i < rest.length; i++) {
      if (rest[i] === '[') depth++
      else if (rest[i] === ']') { depth--; if (depth === 0) { end = i; break } }
    }
    if (end >= 0) {
      const inner = rest.slice(1, end)
      const eq = inner.indexOf('=')
      if (eq >= 0) {
        name = inner.slice(0, eq).trim()
        def = inner.slice(eq + 1).trim()
      } else {
        name = inner.trim()
      }
      description = rest.slice(end + 1).trim()
    } else {
      name = rest.slice(1).trim() // unterminated — defensive
    }
  } else {
    const m = rest.match(/^(\S+)/)
    name = m ? m[1] : ''
    description = m ? rest.slice(m[0].length).trim() : ''
  }
  return { name, type, optional, default: def, description }
}

export function parseJsdocProps(source) {
  const result = {}
  let table = null       // current typedef name (minus Props)
  let pending = null     // prop row being built, so continuation lines append

  const flush = () => {
    if (pending && table && pending.name) (result[table] ||= []).push(pending)
    pending = null
  }

  for (const raw of source.split('\n')) {
    // Strip a leading ` * ` / ` *` comment gutter; keep inner text as-is.
    const line = raw.replace(/^\s*\*?\s?/, '')

    const typedef = line.match(/@typedef\s*\{[^}]*\}\s*([A-Za-z0-9_]+)/)
    if (typedef) {
      flush()
      table = typedef[1].replace(/Props$/, '')
      result[table] ||= []
      continue
    }

    const prop = line.match(/^@property\s+(.*)$/)
    if (prop) {
      flush()
      if (table) pending = parseProperty(prop[1])
      continue
    }

    // End of the comment block (or a different tag) closes the current typedef.
    if (raw.includes('*/') || /^@(param|returns?|example|typedef)\b/.test(line)) {
      flush()
      if (raw.includes('*/')) table = null
      continue
    }

    // A non-tag, non-empty line while a prop is open = wrapped description text.
    if (pending && line.trim() && !line.trim().startsWith('@')) {
      pending.description = pending.description
        ? `${pending.description} ${line.trim()}`
        : line.trim()
    }
  }
  flush()

  for (const k of Object.keys(result)) if (result[k].length === 0) delete result[k]
  return result
}

// ── Self-check: run `node scripts/lib/parse-jsdoc-props.mjs` ───────────────────
// Parses every Andromeda component and asserts the tricky cases resolve.
import { fileURLToPath } from 'node:url'
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { readFileSync, readdirSync } = await import('node:fs')
  const { join, dirname } = await import('node:path')
  const assert = (await import('node:assert')).default
  const dir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'design-systems', 'andromeda', 'components')

  // Unit cases on synthetic input (independent of the live corpus).
  const demo = parseJsdocProps(`
/**
 * @typedef {object} DemoProps
 * @property {'default'|'outline'|'ghost'} [variant='default']
 * @property {boolean} [asChild=false]  Renders the child element.
 * @property {React.ComponentType<{ size?: number }>} [icon] Left icon
 *   that wraps to a second line.
 * @property {string} label
 * @property {number} [min=0]
 * @property {('area'|'bar')[]} [modes=['area','bar']]  Toggle appears when >1.
 */`)
  const d = demo.Demo
  assert(d, 'Demo table missing')
  const variant = d.find((p) => p.name === 'variant')
  assert.equal(variant.type, "'default'|'outline'|'ghost'")
  assert.equal(variant.optional, true)
  assert.equal(variant.default, "'default'")
  const icon = d.find((p) => p.name === 'icon')
  assert.equal(icon.type, 'React.ComponentType<{ size?: number }>', 'nested-brace type broken')
  assert.equal(icon.description, 'Left icon that wraps to a second line.', 'continuation join broken')
  const label = d.find((p) => p.name === 'label')
  assert.equal(label.optional, false, 'required prop misread as optional')
  assert.equal(d.find((p) => p.name === 'min').default, '0')
  const modes = d.find((p) => p.name === 'modes')
  assert.equal(modes.default, "['area','bar']", 'array default with inner ] broken')
  assert.equal(modes.description, 'Toggle appears when >1.', 'array-default description lost')

  // Live corpus: parse every component; report coverage.
  const files = readdirSync(dir).filter((f) => f.endsWith('.tsx'))
  let withProps = 0, totalProps = 0
  const multi = []
  for (const f of files) {
    const tables = parseJsdocProps(readFileSync(join(dir, f), 'utf-8'))
    const names = Object.keys(tables)
    if (names.length) withProps++
    for (const n of names) {
      totalProps += tables[n].length
      for (const p of tables[n]) assert(p.name && p.type !== undefined, `${f}:${n} bad row ${JSON.stringify(p)}`)
    }
    if (names.length > 1) multi.push(`${f} → ${names.join(', ')}`)
  }
  // Guard the floor: a big drop here means the parser stopped matching, not
  // that the blocks were removed by hand.
  assert(withProps >= 28, `expected >=28 components with props, got ${withProps}/${files.length}`)
  const tableTables = parseJsdocProps(readFileSync(join(dir, 'Table.tsx'), 'utf-8'))
  assert(Object.keys(tableTables).length >= 3, 'Table compound blocks not all parsed')

  console.log(`parse-jsdoc-props self-check OK`)
  console.log(`  ${withProps}/${files.length} components have prop tables, ${totalProps} props total`)
  console.log(`  compound: ${multi.join(' | ') || '(none)'}`)
}
