// @vitest-environment jsdom
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { createElement as h, type ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, within } from '@testing-library/react'
import { ANDROMEDA_TEMPLATE_META } from '../_lib/andromeda-pro/andromeda-meta'
import { DESIGN_SYSTEM_META } from '../lib/design-system-meta'
import { CATEGORIES } from '../lib/categories'
import { CATEGORY_COMPONENTS, CATEGORY_COUNTS, TOTAL_COMPONENTS } from '../lib/component-nav.generated'
import { ANDROMEDA_COMPONENT_META as PRO_COMPONENT_META } from '../_lib/andromeda-pro/andromeda-meta'
import { ANDROMEDA_COMPONENT_META as LEGACY_COMPONENT_META } from '../_lib/andromeda/andromeda-meta'
import { Sidebar } from './Sidebar'
import { segmentForPath } from './CatalogNav'
import {
  ICON_CATEGORIES,
  ICON_CATEGORY_COUNTS,
  ICON_COUNT,
} from '../icons/_lib/categories'

// The route the rail is rendered on, per test.
let currentPath = '/components'
const router = vi.hoisted(() => ({ push: vi.fn(), prefetch: vi.fn() }))
vi.mock('next/navigation', () => ({
  usePathname: () => currentPath,
  useRouter: () => router,
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

afterEach(() => {
  cleanup()
  currentPath = '/components'
  router.push.mockClear()
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

  it('the crumb line and the scroll padding it needed are gone', () => {
    // The crumbs moved into each page, above its title (PageCrumbs), so the
    // column has no sticky line to reserve room under any more.
    const bar = readFileSync(join(root, 'app/components/TopBar.tsx'), 'utf8')
    expect(bar, 'the bar is h-14 from md up').toMatch(/sticky top-0[^'\n]*\bhidden h-14\b[^'\n]*\bmd:flex\b/)
    expect(bar).not.toContain('CRUMB_BAR_CLASS')
    expect(bar).not.toContain('data-crumb-bar')
    const css = readFileSync(join(root, 'app/globals.css'), 'utf8')
    expect(css).not.toContain('data-crumb-bar')
    expect(css).not.toMatch(/scroll-padding-top:\s*2\.75rem/)
    const layout = readFileSync(join(root, 'app/layout.tsx'), 'utf8')
    expect(layout).not.toContain('CrumbBar')
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

  it("the rail's Pro template rows are the template meta, in the same order", () => {
    // The pole hardcodes its rows (it is a client module and cannot read the
    // registry), so a new template lands on the site with no way into the
    // rail. City Operations was built while the rail was being rewritten and
    // nearly shipped missing from it. This is the tie.
    const pole = readFileSync(join(root, 'app/components/CatalogNav.tsx'), 'utf8')
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

  // Renders the whole rail for three routes: room for a busy machine.
  it('carries no search, no logo, no site-page links and no rules', { timeout: 20_000 }, () => {
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

  it('carries the logo home on /kuendigen only, where the global bar steps aside', () => {
    expect(rail('/kuendigen').querySelector('a[href="/"]')).not.toBeNull()
    cleanup()
    expect(rail('/components').querySelector('a[href="/"]')).toBeNull()
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

  it('lists every component once by name, under its first category, with the counts, no Show more', () => {
    const aside = rail('/components')
    const panel = within(aside).getAllByRole('tabpanel').find((p) => !p.hidden)!
    expect(panel.querySelector('p')?.textContent).toBe(`Components${TOTAL_COMPONENTS}`)
    // "All components" first, on its own.
    const first = panel.querySelector('li a')!
    expect([first.textContent, first.getAttribute('href')]).toEqual(['All components', '/components'])
    // Then one labelled group per category, in categories.ts order.
    const groups = within(panel).getAllByRole('group')
    expect(groups.map((g) => g.querySelector(':scope > p a')?.textContent)).toEqual(CATEGORIES.map((c) => c.label))
    // Who lists each component: Glass for every glass piece, else its first
    // category in categories.ts order.
    const owner = new Map<string, string>()
    for (const r of CATEGORY_COMPONENTS.Glass ?? []) owner.set(r.slug, 'Glass')
    for (const c of CATEGORIES) for (const r of CATEGORY_COMPONENTS[c.label] ?? []) if (!owner.has(r.slug)) owner.set(r.slug, c.label)
    groups.forEach((g, i) => {
      const cat = CATEGORIES[i]
      const heading = g.querySelector(':scope > p')!
      expect(g.getAttribute('aria-labelledby')).toBe(heading.id)
      expect(heading.querySelector('a')?.getAttribute('href')).toBe(`/components/category/${cat.slug}`)
      const all = CATEGORY_COMPONENTS[cat.label] ?? []
      // The header's count is the category's count, the one its page shows.
      expect(heading.textContent, cat.label).toBe(`${cat.label}, ${CATEGORY_COUNTS[cat.label] ?? 0}`)
      expect(all.length, cat.label).toBe(CATEGORY_COUNTS[cat.label] ?? 0)
      // Its rows are the components it owns, in its own order.
      const rows = all.filter((r) => owner.get(r.slug) === cat.label)
      expect(
        [...g.querySelectorAll('li a')].map((a) => [a.textContent, a.getAttribute('href')]),
        cat.label,
      ).toEqual(rows.map((r) => [r.name, `/components/${r.slug}`]))
    })
    // Every released component is reachable by name, exactly once.
    const hrefs = [...panel.querySelectorAll('li a')]
      .map((a) => a.getAttribute('href')!)
      .filter((href) => /^\/components\/[^/]+$/.test(href))
    expect(new Set(hrefs).size).toBe(TOTAL_COMPONENTS)
    expect(hrefs).toHaveLength(TOTAL_COMPONENTS)
    expect(aside.querySelector('li.hidden')).toBeNull()
    expect(aside.textContent).not.toMatch(/Show \d+ more/)
  })

  it('lights the component you are on once, and the category header of the page you are on', () => {
    const [cat] = CATEGORIES.filter((c) => (CATEGORY_COMPONENTS[c.label] ?? []).length > 0)
    const comp = CATEGORY_COMPONENTS[cat.label][0]
    let aside = rail(`/components/${comp.slug}`)
    const lit = [...aside.querySelectorAll('a[aria-current="page"]')].map((a) => a.getAttribute('href'))
    expect(lit).toEqual([`/components/${comp.slug}`])
    cleanup()
    // A component tagged with two categories lights exactly one row.
    const seen = new Map<string, number>()
    for (const c of CATEGORIES) for (const r of CATEGORY_COMPONENTS[c.label] ?? []) seen.set(r.slug, (seen.get(r.slug) ?? 0) + 1)
    const twice = [...seen].find(([, n]) => n > 1)?.[0]
    if (twice) {
      aside = rail(`/components/${twice}`)
      expect([...aside.querySelectorAll('a[aria-current="page"]')].map((a) => a.getAttribute('href'))).toEqual([`/components/${twice}`])
      cleanup()
    }
    aside = rail(`/components/category/${cat.slug}`)
    expect(aside.querySelector(`[role="group"] > p a[href="/components/category/${cat.slug}"]`)?.getAttribute('aria-current')).toBe('page')
  })

  it('draws no headings, so the page outline opens with the page title', () => {
    expect(rail('/components').querySelectorAll('h1, h2, h3, h4, h5, h6')).toHaveLength(0)
  })

  it('opens only the system you are in, Andromeda Pro off the system pages, each as a button', () => {
    const systemButtons = (aside: HTMLElement) => {
      // The Design systems panel, which is hidden on /components.
      const panel = within(aside).getAllByRole('tabpanel', { hidden: true })[0]
      return within(panel)
        .getAllByRole('button', { hidden: true })
        .map((b) => [b.textContent, b.getAttribute('aria-expanded')])
    }
    expect(systemButtons(rail('/design-systems/andromeda/system'))).toEqual([
      ['Andromeda ProNew', 'false'],
      ['Andromeda Legacy', 'true'],
    ])
    cleanup()
    expect(systemButtons(rail('/design-systems/andromeda-pro/foundation'))).toEqual([
      ['Andromeda ProNew', 'true'],
      ['Andromeda Legacy', 'false'],
    ])
    cleanup()
    expect(systemButtons(rail('/components'))).toEqual([
      ['Andromeda ProNew', 'true'],
      ['Andromeda Legacy', 'false'],
    ])
  })

  it('opens a system to PAGES, TEMPLATES and COMPONENTS, each with its count and its own list', () => {
    const aside = rail('/design-systems/andromeda/system')
    const panel = within(aside).getAllByRole('tabpanel')[0]
    const legacy = within(panel).getByRole('button', { name: /Andromeda Legacy/ })
    const region = document.getElementById(legacy.getAttribute('aria-controls')!)!
    expect(region.hidden).toBe(false)
    const groups = within(region).getAllByRole('group')
    expect(groups.map((g) => g.querySelector(':scope > p')?.textContent)).toEqual([
      'Pages, 3',
      'Templates, 4',
      `Components, ${LEGACY_COMPONENT_META.length}`,
    ])
    for (const g of groups) expect(g.querySelector('ul'), g.textContent ?? '').not.toBeNull()
    expect([...groups[0].querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual([
      '/design-systems/andromeda',
      '/design-systems/andromeda/system',
      '/design-systems/andromeda/brain',
    ])
    // The page you are on keeps the raised pill.
    expect(groups[0].querySelector('a[aria-current="page"]')?.getAttribute('href')).toBe('/design-systems/andromeda/system')

    // Pro, closed here, still carries every link in the HTML.
    const pro = within(panel).getByRole('button', { name: /Andromeda Pro/ })
    const proRegion = document.getElementById(pro.getAttribute('aria-controls')!)!
    expect(proRegion.hidden).toBe(true)
    const proGroups = [...proRegion.querySelectorAll('[role="group"]')]
    expect(proGroups.map((g) => g.querySelector(':scope > p')?.textContent)).toEqual([
      'Pages, 5',
      `Templates, ${ANDROMEDA_TEMPLATE_META.length}`,
      `Components, ${PRO_COMPONENT_META.length}`,
    ])
    expect([...proGroups[0].querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual([
      '/design-systems/andromeda-pro',
      '/design-systems/andromeda-pro/foundation',
      '/design-systems/andromeda-pro/components',
      '/design-systems/andromeda-pro/image-pack',
      '/design-systems/andromeda-pro/brain',
    ])
    for (const c of PRO_COMPONENT_META)
      expect(proRegion.querySelector(`a[href="/design-systems/andromeda-pro/${c.slug}"]`), c.slug).not.toBeNull()

    // The row opens and closes it in place.
    fireEvent.click(pro)
    expect(pro.getAttribute('aria-expanded')).toBe('true')
    expect(proRegion.hidden).toBe(false)
    fireEvent.click(legacy)
    expect(legacy.getAttribute('aria-expanded')).toBe('false')
    expect(region.hidden).toBe(true)
  })

  it('lights the design-system leaf you are on', () => {
    const c = PRO_COMPONENT_META[0]
    const cases: [string, string][] = [
      ['/design-systems/andromeda-pro', '/design-systems/andromeda-pro'],
      ['/design-systems/andromeda-pro/image-pack', '/design-systems/andromeda-pro/image-pack'],
      ['/design-systems/andromeda-pro/brain/explore', '/design-systems/andromeda-pro/brain'],
      [`/design-systems/andromeda-pro/${c.slug}`, `/design-systems/andromeda-pro/${c.slug}`],
    ]
    for (const [path, href] of cases) {
      const aside = rail(path)
      expect([...aside.querySelectorAll('a[aria-current="page"]')].map((a) => a.getAttribute('href')), path).toEqual([href])
      cleanup()
    }
  })

  it('swaps the list at once and opens the landing page on a click; arrow keys only swap the list', () => {
    const aside = rail('/components')
    const visible = () => within(aside).getAllByRole('tabpanel').filter((p) => !p.hidden)
    // The segment the route is in already: no trip back to its landing page.
    fireEvent.click(within(aside).getByRole('tab', { name: 'Components' }))
    expect(router.push).not.toHaveBeenCalled()
    fireEvent.click(within(aside).getByRole('tab', { name: 'Design systems' }))
    expect(router.push).toHaveBeenLastCalledWith('/design-systems/andromeda-pro')
    expect(visible()).toHaveLength(1)
    expect(visible()[0].querySelector('p')?.textContent).toBe('Design systems2')
    expect(visible()[0].querySelector('a[href="/design-systems/andromeda-pro"]')).not.toBeNull()
    expect(visible()[0].querySelector('a[href="/design-systems/andromeda"]')).not.toBeNull()

    fireEvent.click(within(aside).getByRole('tab', { name: 'Icons' }))
    expect(router.push).toHaveBeenLastCalledWith('/icons')
    expect(visible()[0].querySelector('p')?.textContent).toBe(`Icons${ICON_COUNT}`)
    expect([...visible()[0].querySelectorAll('a')].map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['All icons', '/icons'],
      ...ICON_CATEGORIES.map(([slug, label]) => [`${label}${ICON_CATEGORY_COUNTS[slug]}`, `/icons?category=${slug}`]),
    ])

    const icons = within(aside).getByRole('tab', { name: 'Icons' })
    fireEvent.keyDown(icons, { key: 'ArrowRight' })
    expect(selectedTab(aside)).toBe('Design systems')
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Design systems')
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' })
    expect(selectedTab(aside)).toBe('Icons')
    fireEvent.keyDown(document.activeElement!, { key: 'Home' })
    expect(selectedTab(aside)).toBe('Design systems')
    // Two clicks navigated, the arrow keys did not.
    expect(router.push).toHaveBeenCalledTimes(2)
    // Only the selected tab is in the tab order.
    expect(within(aside).getAllByRole('tab').map((t) => t.tabIndex)).toEqual([0, -1, -1])
  })

  it('drops a hand-picked segment on navigation, and does not bring it back on return', () => {
    currentPath = '/components'
    const { container, rerender } = render(h(Sidebar))
    const aside = () => container.querySelector('aside')!
    fireEvent.click(within(aside()).getByRole('tab', { name: 'Design systems' }))
    expect(selectedTab(aside())).toBe('Design systems')
    currentPath = '/design-systems/andromeda-pro'
    rerender(h(Sidebar))
    expect(selectedTab(aside())).toBe('Design systems')
    currentPath = '/components'
    rerender(h(Sidebar))
    expect(selectedTab(aside())).toBe('Components')
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

// Every page drawn beside the rail signs off with the site footer and the AI
// CANVAS wordmark, inside whatever element scrolls that page.
describe('the footer on every rail page', () => {
  const src = (rel: string) => readFileSync(join(root, rel), 'utf8')

  it('is the site footer, as a contentinfo landmark, with the wordmark under it', async () => {
    const { RailFooter } = await import('./RailFooter')
    const { container } = render(h(RailFooter))
    const footer = within(container).getByRole('contentinfo')
    expect(within(footer).getByRole('link', { name: 'Components' }).getAttribute('href')).toBe('/components')
    const mark = container.querySelector('[aria-hidden] .v3-wordmark')
    expect(mark?.textContent).toBe('AICANVAS')
    // Sized to its own column, not the window: beside the rail the column is
    // narrower than the viewport. (jsdom drops container units, so read it.)
    expect(src('app/components/RailFooter.tsx')).toContain('<Wordmark fit="column" />')
    expect(src('app/components/Wordmark.tsx')).toContain('18.5cqw')
  })

  it('ends the standalone pages, outside their <main>, in the root scroll column', () => {
    for (const rel of ['app/components/HomeClient.tsx', 'app/components/[slug]/ComponentPageView.tsx']) {
      const page = src(rel)
      expect(page, rel).toContain('<RailFooter />')
      expect(page, rel).not.toContain('<SiteFooter')
      expect(page.indexOf('<RailFooter />'), rel).toBeGreaterThan(page.lastIndexOf('</PageFrame>'))
    }
    // Every standalone route renders one of the two.
    expect(src('app/components/page.tsx')).toContain('<HomeClient')
    expect(src('app/components/category/[slug]/page.tsx')).toContain('<HomeClient')
    expect(src('app/components/collection/[slug]/page.tsx')).toContain('<HomeClient')
    expect(src('app/components/[slug]/page.tsx')).toContain('ComponentPageView')
  })

  it('ends the Andromeda scrollers on every page but a template leaf, and no page draws its own', async () => {
    for (const rel of [
      'app/design-systems/andromeda/AndromedaContentColumn.tsx',
      'app/design-systems/andromeda-pro/AndromedaContentColumn.tsx',
    ])
      expect(src(rel), rel).toContain('{!isTemplate && <RailFooter />}')
    const pages = walk(join(root, 'app/design-systems')).filter((f) => /<SiteFooter[ />]/.test(readFileSync(f, 'utf8')))
    expect(pages.map((f) => f.slice(root.length + 1))).toEqual([])

    const { AndromedaContentColumn } = await import('../design-systems/andromeda/AndromedaContentColumn')
    for (const path of ['/design-systems/andromeda', '/design-systems/andromeda/system', '/design-systems/andromeda/button']) {
      currentPath = path
      const { container } = render(h(AndromedaContentColumn, null, h('main', null, 'page')))
      const column = container.firstElementChild!
      expect(within(column as HTMLElement).getByRole('contentinfo'), path).toBeTruthy()
      // Last in the scroller, after the page.
      expect(column.lastElementChild?.hasAttribute('data-rail-footer'), path).toBe(true)
      cleanup()
    }
    currentPath = '/design-systems/andromeda/templates/signal-room'
    const { container } = render(h(AndromedaContentColumn, null, h('main', null, 'page')))
    expect(container.querySelector('footer')).toBeNull()
  })
})
