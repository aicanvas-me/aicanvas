// @vitest-environment jsdom
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { createElement as h, type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, within } from '@testing-library/react'
import { ANDROMEDA_TEMPLATE_META } from '../_lib/andromeda-pro/andromeda-meta'
import { DESIGN_SYSTEM_META } from '../lib/design-system-meta'
import { CATEGORIES } from '../lib/categories'
import { TOTAL_COMPONENTS } from '../lib/component-nav.generated'
import { Sidebar } from './Sidebar'
import { segmentForPath } from './CatalogNav'

// The route the rail is rendered on, per test.
let currentPath = '/components'
vi.mock('next/navigation', () => ({
  usePathname: () => currentPath,
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('next/link', () => ({
  default: (props: { href: string; children: ReactNode; prefetch?: boolean }) => {
    const attrs: Record<string, unknown> = { ...props }
    delete attrs.prefetch
    delete attrs.children
    return h('a', attrs, props.children)
  },
}))
// The icon barrel is thousands of modules the rail never needs in a test.
vi.mock('@phosphor-icons/react', () => {
  const Icon = () => null
  return { CaretDown: Icon, Cube: Icon, DiamondsFour: Icon, Shapes: Icon, GithubLogo: Icon, XLogo: Icon, Sparkle: Icon }
})

afterEach(() => {
  cleanup()
  currentPath = '/components'
})

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
    // nothing. Resolve every specifier in the file and keep only the ones
    // that land on the rail: a sibling './Sidebar', a '../components/Sidebar',
    // the '@/app/components/Sidebar' alias that most of this app is written
    // in, an explicit .tsx, either quote, and a dynamic import all count, and
    // Pro's registry import does not.
    const rail = join(root, 'app', 'components', 'Sidebar')
    const offenders = walk(join(root, 'app'))
      .filter((f) => {
        const src = readFileSync(f, 'utf8')
        if (!/<Sidebar[ />]/.test(src)) return false
        return [...src.matchAll(/(?:from|import\()\s*['"](\.[^'"]*|@\/[^'"]*)['"]/g)].some(
          (m) => {
            // tsconfig maps '@/*' to './*' at the repo root.
            const spec = m[1]
            const hit = spec.startsWith('@/')
              ? join(root, spec.slice(2))
              : resolve(dirname(f), spec)
            return hit === rail || hit === `${rail}.tsx`
          },
        )
      })
      .map((f) => f.slice(root.length + 1))

    expect(offenders).toEqual(['app/layout.tsx'])
  })

  it('the embedded prop is gone', () => {
    const src = readFileSync(join(root, 'app', 'components', 'Sidebar.tsx'), 'utf8')
    expect(src).not.toContain('embedded')
  })

  it('the hide check covers the rail-less pages, /lab and template leaves, never a catalog route', () => {
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

  it('the scroll column reserves the crumb line\'s height, so a page opened from a scrolled one still starts at its top', () => {
    // Next scrolls the new page's root into view, and that root sits below the
    // sticky crumb line. The reserve and the line's height are one number in
    // two files. The bar itself sits above the column and needs no reserve.
    const bar = readFileSync(join(root, 'app/components/TopBar.tsx'), 'utf8')
    expect(bar, 'the bar is h-14 from md up').toMatch(/sticky top-0[^'\n]*\bhidden h-14\b[^'\n]*\bmd:flex\b/)
    expect(bar, 'the crumb line is h-11 from md up').toMatch(/CRUMB_BAR_CLASS =\s*'sticky top-0[^'\n]*\bhidden h-11\b[^'\n]*\bmd:flex\b/)
    expect(bar).toContain('data-crumb-bar')
    const css = readFileSync(join(root, 'app/globals.css'), 'utf8')
    expect(css, 'globals.css must reserve 2.75rem (h-11) under the crumb line').toMatch(
      /@media \(min-width: 48rem\) \{\s*\.app-scroll-column:has\(> \[data-crumb-bar\]\) \{\s*scroll-padding-top: 2\.75rem;/,
    )
  })

  it('the old per-page bar signature (h-14 shrink-0 + border-b border-sand-200 on one line) only survives in the template shell', () => {
    // The site bar itself has no bottom rule any more, and the rail lost the
    // logo block that matched its height.
    const ALLOWED = ['app/_components/TemplatePreviewShell.tsx']

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

// The rail is only the catalog now: the bar carries the logo, the search and
// the site's other pages, and the switch picks which list the rail shows.
describe('the catalog rail', () => {
  function rail(path: string) {
    currentPath = path
    const { container } = render(h(Sidebar))
    return container.querySelector('aside')!
  }
  const selectedTab = (aside: HTMLElement) =>
    within(aside).getAllByRole('tab').find((t) => t.getAttribute('aria-selected') === 'true')?.getAttribute('aria-label')

  it('carries no search, no logo, no site-page links and no rules', () => {
    for (const path of ['/components', '/components/category/widgets', '/design-systems/andromeda-pro']) {
      const aside = rail(path)
      expect(aside.querySelector('input'), path).toBeNull()
      expect(within(aside).queryByRole('button', { name: 'Search' }), path).toBeNull()
      expect(aside.querySelector('a[href="/"]'), path).toBeNull()
      for (const href of ['/mcp', '/pricing', '/about', '/faq', '/contact', '/feedback'])
        expect(aside.querySelector(`a[href="${href}"]`), `${path} ${href}`).toBeNull()
      expect(aside.className, path).not.toMatch(/\bborder-r\b/)
      expect(aside.querySelector('[class*="border-t"], [class*="border-b"]'), path).toBeNull()
      // GitHub and X stay at the foot.
      expect(within(aside).getByRole('link', { name: 'GitHub repository' })).toBeTruthy()
      expect(within(aside).getByRole('link', { name: 'X profile' })).toBeTruthy()
      cleanup()
    }
    const src = readFileSync(join(root, 'app/components/Sidebar.tsx'), 'utf8')
    expect(src).not.toContain('SecondaryNav')
    expect(src).not.toContain('SiteSearch')
  })

  it('draws a three-way switch: Design systems, Components, Icons', () => {
    const aside = rail('/components')
    const list = within(aside).getByRole('tablist')
    const tabs = within(list).getAllByRole('tab')
    expect(tabs.map((t) => t.getAttribute('aria-label'))).toEqual(['Design systems', 'Components', 'Icons'])
    for (const t of tabs) expect(t.getAttribute('title')).toBe(t.getAttribute('aria-label'))
    // The selected tab shows its label, the others their icon only.
    expect(tabs.map((t) => t.textContent)).toEqual(['', 'Components', ''])
  })

  it('opens on the segment the route belongs to', () => {
    const cases: [string, string][] = [
      ['/components', 'Components'],
      ['/components/category/widgets', 'Components'],
      ['/components/collection/glass', 'Components'],
      ['/components/jar-of-emotions', 'Components'],
      ['/ideation', 'Components'],
      ['/design-systems/andromeda-pro', 'Design systems'],
      ['/design-systems/andromeda/system', 'Design systems'],
      ['/icons', 'Icons'],
    ]
    for (const [path, label] of cases) {
      expect(selectedTab(rail(path)), path).toBe(label)
      cleanup()
    }
    expect(segmentForPath('/icons/arrow')).toBe('icons')
    expect(segmentForPath('/design-systems-ish')).toBe('components')
  })

  it('lists every category under Components with the standalone count, no Show more', () => {
    const aside = rail('/components')
    const panel = within(aside).getAllByRole('tabpanel').find((p) => !p.hidden)!
    expect(panel.querySelector('p')?.textContent).toBe(`Components${TOTAL_COMPONENTS}`)
    const rows = [...panel.querySelectorAll('li a')].map((a) => a.textContent)
    expect(rows).toEqual(['All Components', ...CATEGORIES.map((c) => c.label)])
    expect(aside.querySelector('li.hidden')).toBeNull()
    expect(aside.textContent).not.toMatch(/Show \d+ more/)
  })

  it('switches the list in place on a click or an arrow key, without navigating', () => {
    const aside = rail('/components')
    const visible = () => within(aside).getAllByRole('tabpanel').filter((p) => !p.hidden)
    fireEvent.click(within(aside).getByRole('tab', { name: 'Design systems' }))
    expect(visible()).toHaveLength(1)
    expect(visible()[0].querySelector('p')?.textContent).toBe('Design systems2')
    expect(visible()[0].querySelector('a[href="/design-systems/andromeda-pro"]')).not.toBeNull()
    expect(visible()[0].querySelector('a[href="/design-systems/andromeda"]')).not.toBeNull()

    fireEvent.click(within(aside).getByRole('tab', { name: 'Icons' }))
    expect(visible()[0].querySelector('p')?.textContent).toBe('Icons')
    expect([...visible()[0].querySelectorAll('a')].map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['All icons', '/icons'],
    ])

    const icons = within(aside).getByRole('tab', { name: 'Icons' })
    fireEvent.keyDown(icons, { key: 'ArrowRight' })
    expect(selectedTab(aside)).toBe('Design systems')
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Design systems')
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' })
    expect(selectedTab(aside)).toBe('Icons')
    fireEvent.keyDown(document.activeElement!, { key: 'Home' })
    expect(selectedTab(aside)).toBe('Design systems')
    // Only the selected tab is in the tab order.
    expect(within(aside).getAllByRole('tab').map((t) => t.tabIndex)).toEqual([0, -1, -1])
  })

  it('keeps every category link in the HTML whichever segment is on', () => {
    const aside = rail('/design-systems/andromeda-pro')
    for (const c of CATEGORIES) expect(aside.querySelector(`a[href="/components/category/${c.slug}"]`), c.slug).not.toBeNull()
  })
})

describe('the phone drawer still reaches every page that left the rail and the bar', () => {
  it('uses the catalog switch and keeps search and the site pages', () => {
    const src = readFileSync(join(root, 'app/components/MobileNav.tsx'), 'utf8')
    expect(src).toContain('<CatalogNav')
    expect(src).toContain('<SecondaryNav')
    expect(src).toContain('useComponentSearch')
    const secondary = readFileSync(join(root, 'app/components/SecondaryNav.tsx'), 'utf8')
    for (const href of ['/mcp', '/pricing', '/about', '/faq', '/contact', '/feedback'])
      expect(secondary, href).toContain(`href: '${href}'`)
    const catalog = readFileSync(join(root, 'app/components/CatalogNav.tsx'), 'utf8')
    expect(catalog).toContain('href="/icons"')
  })
})
