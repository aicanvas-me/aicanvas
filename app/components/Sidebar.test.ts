import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ANDROMEDA_TEMPLATE_META } from '../_lib/andromeda-pro/andromeda-meta'
import { DESIGN_SYSTEM_META } from '../lib/design-system-meta'

// One rail, rendered once. Before this, four call sites mounted `<Sidebar>` —
// the root layout plus three design-system / ideation layouts each rendering
// their own `embedded` copy — so crossing between those route spaces unmounted
// one rail and mounted another, flashing and losing scroll and open/closed
// state. This is the contract that keeps it from creeping back: the root
// layout is the only render site, the `embedded` prop is gone, the hide check
// has let go of '/design-systems' and '/ideation', and the layouts that used to
// render their own copy still own their scroll column.

const root = join(__dirname, '..', '..')

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name.startsWith('.')) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.tsx$/.test(name)) out.push(full)
  }
  return out
}

describe('sidebar single-instance contract', () => {
  it('only app/layout.tsx renders a <Sidebar>', () => {
    // Andromeda Pro has its own component named Sidebar, rendered from the
    // generated registry by its matrix case, so the tag's NAME proves
    // nothing. Resolve every relative specifier in the file against the
    // file's own directory and keep only the ones that land on the rail:
    // a sibling './Sidebar', a '../components/Sidebar', either quote, and a
    // dynamic import all count, and Pro's registry import does not.
    const rail = join(root, 'app', 'components', 'Sidebar')
    const offenders = walk(join(root, 'app'))
      .filter((f) => {
        const src = readFileSync(f, 'utf8')
        if (!/<Sidebar[ />]/.test(src)) return false
        return [...src.matchAll(/(?:from|import\()\s*['"](\.[^'"]*)['"]/g)].some(
          (m) => resolve(dirname(f), m[1]) === rail,
        )
      })
      .map((f) => f.slice(root.length + 1))

    expect(offenders).toEqual(['app/layout.tsx'])
  })

  it('the embedded prop is gone', () => {
    const src = readFileSync(join(root, 'app', 'components', 'Sidebar.tsx'), 'utf8')
    expect(src).not.toContain('embedded')
  })

  it('the hide check covers only /lab and template leaves', () => {
    const src = readFileSync(join(root, 'app', 'components', 'Sidebar.tsx'), 'utf8')
    // Read the hide check itself, not the whole file: `onDesignSystems` still
    // tests the same prefix, and it legitimately does — it is what opens the
    // right pole for the route. Only the HIDE check must have let go of it.
    const check = /const hideSidebar\s*=([\s\S]*?)\n  const /.exec(src)?.[1] ?? ''
    expect(check).not.toBe('')
    expect(check).not.toContain('/design-systems')
    expect(check).not.toContain('/ideation')
    expect(check).toContain("startsWith('/lab')")
    expect(check).toContain('TEMPLATE_LEAF_RE.test')
  })

  it('the ex-embedded layouts still own their scroll column', () => {
    const layouts = [
      'app/design-systems/andromeda-pro/layout.tsx',
      'app/design-systems/andromeda/layout.tsx',
      'app/ideation/layout.tsx',
    ]
    for (const layout of layouts) {
      const src = readFileSync(join(root, layout), 'utf8')
      expect(src, `${layout} should still carry data-owns-scroll`).toContain('data-owns-scroll')
    }
    // The attribute alone does not make it true. The page slot in the root
    // layout must keep min-h-0: a flex item's automatic minimum is its content,
    // so without it the slot grows to the whole page, these layouts stop
    // clipping, and the chrome column takes the scroll they declare they own.
    const rootLayout = readFileSync(join(root, 'app/layout.tsx'), 'utf8')
    expect(rootLayout, 'the page slot must keep min-h-0').toMatch(
      /className="flex min-h-0 flex-1 flex-col">\{children\}/,
    )
  })
})

describe('top bar single-instance contract', () => {
  it('only app/layout.tsx renders a <TopBar>', () => {
    const offenders = walk(join(root, 'app'))
      .filter((f) => /<TopBar[ />]/.test(readFileSync(f, 'utf8')))
      .map((f) => f.slice(root.length + 1))

    expect(offenders).toEqual(['app/layout.tsx'])
  })

  it('the scroll column reserves the bar\'s height, so a page opened from a scrolled one still starts at its top', () => {
    // Next scrolls the new page's root into view, and that root sits below the
    // sticky bar. The reserve and the bar's height are one number in two files.
    const bar = readFileSync(join(root, 'app/components/TopBar.tsx'), 'utf8')
    expect(bar, 'the bar is h-14 from md up').toMatch(/sticky top-0[^'\n]*\bhidden h-14\b[^'\n]*\bmd:flex\b/)
    const rootLayout = readFileSync(join(root, 'app/layout.tsx'), 'utf8')
    expect(rootLayout, 'the scroll column must keep md:scroll-pt-14').toMatch(
      /className="app-scroll-column [^"]*\bmd:scroll-pt-14\b/,
    )
  })

  it('the old per-page bar signature (h-14 shrink-0 + border-b border-sand-200 on one line) only survives in the shell, the template shell and the lab', () => {
    // Not a page top bar: the sidebar's own logo block is h-14 to match the
    // bar's height (see TopBar.tsx's comment), and it carries the same two
    // substrings by coincidence, not because it is a copy of the removed bar.
    const ALLOWED = [
      'app/_components/TemplatePreviewShell.tsx',
      'app/components/Sidebar.tsx',
      'app/components/TopBar.tsx',
    ]

    const offenders = walk(join(root, 'app'))
      .filter((f) =>
        readFileSync(f, 'utf8')
          .split('\n')
          .some((line) => line.includes('h-14 shrink-0') && line.includes('border-b border-sand-200')),
      )
      .map((f) => f.slice(root.length + 1))
      .sort()

    expect(offenders).toEqual([...ALLOWED].sort())
  })
})

describe('the rail lists every Andromeda Pro template', () => {
  it('the template switcher knows the same Pro templates the gallery does', () => {
    // A fourth hand-kept copy of the same list lives in design-system-meta.ts
    // and drives the switcher in the template bar. City Operations shipped
    // missing from it, so its own page offered nothing to switch to and the
    // other four never listed it.
    const expected = ANDROMEDA_TEMPLATE_META.map((t) => `andromeda-pro-${t.folder}`).sort()
    const actual = DESIGN_SYSTEM_META['andromeda-pro'].templates.map((t) => t.slug).sort()
    expect(actual).toEqual(expected)
  })

  it("the pole's Pro template rows are the template meta, in the same order", () => {
    // The pole hardcodes its rows (it is a client module and cannot read the
    // registry), so a new template lands on the site with no way into the
    // rail. City Operations was built while the rail was being rewritten and
    // nearly shipped missing from it. This is the tie.
    const pole = readFileSync(join(root, 'app/_components/DesignSystemsPole.tsx'), 'utf8')
    const pro = pole.slice(pole.indexOf("slug: 'andromeda-pro'"), pole.indexOf("slug: 'andromeda',"))
    const block = pro.slice(pro.indexOf('templates: ['), pro.indexOf('],', pro.indexOf('templates: [')))
    const railSlugs = [...block.matchAll(/slug: '([^']+)'/g)].map((m) => m[1])
    expect(railSlugs).toEqual(ANDROMEDA_TEMPLATE_META.map((t) => t.folder))
  })
})
