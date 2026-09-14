// The only enforcement for the matrix. It proves a declared case RENDERS and
// that a forced state has a real rule to fire; it never proves anything looks
// right, and it is structurally blind to a forced cell that is visually
// identical to Rest. That is what the Rest baseline column and the maintainer's
// eyes are for — the page is the instrument, this file is the floor.
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ANDROMEDA_COMPONENT_META } from '../andromeda-meta'
import { COMPONENT_COUNTS } from '../../../design-systems/andromeda-pro/system/component-counts'
import { CATEGORY } from '../../../design-systems/andromeda-pro/system/categories'
import { SPECS } from './index'
import { MatrixBlock } from './Matrix'
import type { MatrixCase, MatrixSpec } from './types'

// This matrix renders Andromeda PRO, whose sources arrive injected from the
// vault. There is deliberately no fallback to Andromeda Legacy's committed
// tree: the two systems have different components and different token shapes,
// so falling back checked Pro's matrix against Legacy's source and reported
// mismatches that meant nothing. Without the injected tree the file reads are
// existsSync-guarded and their checks simply skip.
const COMPONENT_DIR = join(process.cwd(), 'design-systems/andromeda-pro/components')

// The UNDECLARED migration allowlist that lived here is gone: every component
// is declared, so the catalog check below is now an exact match in both
// directions and a new component cannot be added without a declaration.

const html = new Map<string, string>()
const markup = (spec: MatrixSpec) => {
  if (!html.has(spec.slug)) html.set(spec.slug, renderToStaticMarkup(<MatrixBlock spec={spec} />))
  return html.get(spec.slug)!
}

/** Slice the exact case canvas out of the markup, balanced over nested spans. */
function canvas(source: string, kind: string, label: string): string | null {
  const open = source.indexOf(`data-case-kind="${kind}" data-case-label="${escapeAttr(label)}"`)
  if (open === -1) return null
  const tagStart = source.lastIndexOf('<span', open)
  let i = source.indexOf('>', open) + 1
  let depth = 1
  while (depth > 0 && i < source.length) {
    const nextOpen = source.indexOf('<span', i)
    const nextClose = source.indexOf('</span', i)
    if (nextClose === -1) return null
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++
      i = nextOpen + 5
    } else {
      depth--
      i = nextClose + 6
    }
  }
  return source.slice(tagStart, i)
}

const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')

/** Text content of a slice, tags removed — "did anything actually render". */
const textOf = (slice: string) => slice.replace(/<[^>]*>/g, '').trim()

/** From the `{` at index i, the matching `}` (string-aware enough for cva). */
function braceBlock(src: string, i: number): string {
  let depth = 0
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++
    else if (src[j] === '}') {
      depth--
      if (depth === 0) return src.slice(i, j + 1)
    }
  }
  return ''
}

/** Top-level keys of an object literal source string. */
function topKeys(block: string): string[] {
  const inner = block.slice(1, -1)
  const keys: string[] = []
  let depth = 0
  let lineStart = 0
  for (let j = 0; j < inner.length; j++) {
    const ch = inner[j]
    if (ch === '{' || ch === '[' || ch === '(') depth++
    else if (ch === '}' || ch === ']' || ch === ')') depth--
    else if (ch === ',' && depth === 0) {
      pushKey(inner.slice(lineStart, j), keys)
      lineStart = j + 1
    }
  }
  pushKey(inner.slice(lineStart), keys)
  return keys
}
function pushKey(chunk: string, out: string[]) {
  // Line comments are stripped first: every one of these objects is documented
  // in place, and a comment sitting above the FIRST key hid that key entirely —
  // Tag's `default` variant went uncovered until this line existed.
  const m = chunk
    .replace(/^\s*\/\/.*$/gm, '')
    .trim()
    .match(/^['"]?([A-Za-z0-9_-]+)['"]?\s*:/)
  if (m) out.push(m[1])
}

const allCases = (s: MatrixSpec): MatrixCase[] => [...s.variants, ...s.states]

describe('andromeda matrix — membership and migration', () => {
  const known = new Set(ANDROMEDA_COMPONENT_META.map((m) => m.slug))

  it('every spec slug is a real component, exactly once', () => {
    const seen = new Set<string>()
    for (const s of SPECS) {
      expect(known, `${s.slug} is not in ANDROMEDA_COMPONENT_META`).toContain(s.slug)
      expect(seen.has(s.slug), `${s.slug} declared twice`).toBe(false)
      seen.add(s.slug)
    }
  })

  it('every component in the catalog is declared', () => {
    const declared = new Set(SPECS.map((s) => s.slug))
    for (const slug of known) {
      expect(declared, `${slug} has no matrix declaration`).toContain(slug)
    }
  })
})

describe('andromeda matrix — every declared label renders', () => {
  for (const spec of SPECS) {
    for (const kind of ['variant', 'state'] as const) {
      const cases = kind === 'variant' ? spec.variants : spec.states
      for (const c of cases) {
        it(`${spec.slug} ${kind} "${c.label}"`, () => {
          const slice = canvas(markup(spec), kind, c.label)
          expect(slice, `no canvas emitted for ${spec.slug}/${kind}/${c.label}`).not.toBeNull()
          // Fails in exactly the free-only build where the 7 v2 components are
          // replaced by placeholders — otherwise this suite would pass green on
          // a build that renders nothing.
          expect(slice!).not.toContain('available on the live site')
          if (c.clientOnly) return
          expect(
            textOf(slice!).length > 0 || /<(input|svg|img|canvas|hr)\b/.test(slice!),
            `${spec.slug}/${kind}/${c.label} rendered empty — mark it clientOnly with a reason if that is expected`,
          ).toBe(true)
        })
      }
    }
  }
})

describe('andromeda matrix — every forced state has something to paint', () => {
  // Scoped to the class ATTRIBUTE inside the exact canvas, never a substring
  // search: andromedaVars() writes `--andromeda-surface-hover:` into the inline
  // style of nearly every component root, so a bare search for "hover:" passes
  // on 30 of 40 components that have no hover treatment at all.
  const FORCEABLE = /(^|:)(hover|focus|focus-visible|active):/
  for (const spec of SPECS) {
    for (const c of spec.states) {
      if (!c.force) continue
      it(`${spec.slug} state "${c.label}"`, () => {
        if (spec.gaps?.[c.label]) return
        const slice = canvas(markup(spec), 'state', c.label)!
        const classes = [...slice.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/))
        // Two legitimate mechanisms, and the check accepts either. A Tailwind
        // variant class in the markup, or — for the inline-styled composites
        // whose states live in their own scoped stylesheet — a companion rule
        // in the source or in the spec's forcedStateCss. The second half is
        // what fails if someone deletes a companion line while the forced cell
        // still claims to show the state.
        const meta = ANDROMEDA_COMPONENT_META.find((m) => m.slug === spec.slug)!
        const file = join(COMPONENT_DIR, meta.sourceFile)
        const rule = `data-force~="${c.force}"`
        const companion =
          Boolean(spec.forcedStateCss?.includes(rule)) ||
          (existsSync(file) && readFileSync(file, 'utf8').includes(rule))
        const hit = companion || classes.some((t) => FORCEABLE.test(t))
        expect(
          hit,
          `${spec.slug}/${c.label} forces "${c.force}" but neither a ${c.force} class nor a companion rule exists — document it in gaps, or restore whichever went missing`,
        ).toBe(true)
      })
    }
  }
})

describe('andromeda matrix — variant enum coverage', () => {
  for (const spec of SPECS) {
    const meta = ANDROMEDA_COMPONENT_META.find((m) => m.slug === spec.slug)!
    const file = join(COMPONENT_DIR, meta.sourceFile)
    it(`${spec.slug} declares every cva variant`, () => {
      if (!existsSync(file)) return
      const src = readFileSync(file, 'utf8')
      // Every cva( call in the file: Avatar and Toggle have two each.
      const enums = new Set<string>()
      for (const m of src.matchAll(/\bvariant:\s*\{/g)) {
        for (const k of topKeys(braceBlock(src, m.index! + m[0].length - 1))) enums.add(k)
      }
      if (enums.size === 0) return // derived axes (state/status/bordered/size) are exempt
      const declared = new Set(
        allCases(spec)
          .map((c) => c.props?.variant)
          .filter((v): v is string => typeof v === 'string'),
      )
      // Whatever the source's own default is counts as declared once any case
      // omits the prop entirely.
      const hasBare = allCases(spec).some((c) => c.props && !('variant' in c.props))
      const dflt = src.match(/defaultVariants:\s*\{[^}]*?\bvariant:\s*['"]([A-Za-z0-9_-]+)['"]/)?.[1]
      if (hasBare && dflt) declared.add(dflt)
      for (const key of enums) {
        expect(declared, `${spec.slug} never renders variant "${key}"`).toContain(key)
      }
    })

    it(`${spec.slug} matches its rules-file variant list`, () => {
      const rules = join(COMPONENT_DIR, meta.sourceFile.replace(/\.tsx$/, '.rules.md'))
      if (!existsSync(rules)) return
      const fm = readFileSync(rules, 'utf8').match(/^---\n([\s\S]*?)\n---/)
      if (!fm) return // the public checkout's copies carry no frontmatter; the
      // vault's do, and this check activates by itself when they land here.
      const listed = fm[1]
        .match(/^variants:\s*\[([^\]]*)\]/m)?.[1]
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, '').toLowerCase())
        .filter(Boolean)
      if (!listed?.length) return
      const labels = new Set(allCases(spec).map((c) => c.label.toLowerCase()))
      const props = new Set(
        allCases(spec)
          .map((c) => c.props?.variant)
          .filter((v): v is string => typeof v === 'string')
          .map((v) => v.toLowerCase()),
      )
      for (const v of listed) {
        expect(labels.has(v) || props.has(v), `${spec.slug} rules.md lists variant "${v}", undeclared`).toBe(true)
      }
    })
  }
})

describe('andromeda matrix — overlay rule', () => {
  it('a spec with an inline open popover opts out of content-visibility', () => {
    for (const spec of SPECS) {
      const opens = allCases(spec).some((c) => c.props?.staticOpen)
      if (opens) {
        expect(spec.overflow, `${spec.slug} opens a popover inline and must set overflow: true`).toBe(true)
      }
    }
  })

  // The renderer reserves the panel's room as padding on ONE side, and the
  // upward rule hands the bottom back to the body's floor — so a card holding
  // both an upward and a downward panel at once would silently lose its
  // downward room. Nothing declares that today; this is the tripwire for the
  // day something does, cheaper than machinery for a case that does not exist.
  // Per CASE, never per spec: user-menu and user-card each declare an "Open up"
  // AND an "Open down", which is fine — they are separate cards.
  it('no single case opens a panel both up and down', () => {
    for (const spec of SPECS) {
      for (const kind of ['variant', 'state'] as const) {
        for (const c of kind === 'variant' ? spec.variants : spec.states) {
          const slice = canvas(markup(spec), kind, c.label)
          if (!slice) continue
          expect(
            slice.includes('data-placement="top"') && slice.includes('data-placement="bottom"'),
            `${spec.slug}/${c.label} mounts an upward AND a downward panel in one card — the reserve is one-sided, so split it into two cases or teach Matrix.tsx to reserve both ends`,
          ).toBe(false)
        }
      }
    }
  })
})

describe('andromeda matrix — the gallery cards cannot drift', () => {
  // The public /system page is a SERVER component, so it reads plain numbers
  // instead of importing the specs (which would drag every design-system
  // component, three.js included, into an index page that renders none of
  // them). These two checks are what make that copy safe.
  it('every card count matches its declaration', () => {
    for (const spec of SPECS) {
      const counts = COMPONENT_COUNTS[spec.slug]
      expect(counts, `${spec.slug} is missing from component-counts.ts`).toBeDefined()
      expect(counts.variants, `${spec.slug} variant count is stale`).toBe(spec.variants.length)
      expect(counts.states, `${spec.slug} state count is stale`).toBe(spec.states.length)
    }
    expect(Object.keys(COMPONENT_COUNTS).length).toBe(SPECS.length)
  })

  it('every component has a gallery category', () => {
    for (const m of ANDROMEDA_COMPONENT_META) {
      expect(CATEGORY[m.slug], `${m.slug} has no category — it would land in "Other"`).toBeDefined()
    }
  })
})
