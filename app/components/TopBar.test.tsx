// @vitest-environment jsdom
// The crumb row above each catalog page's title can be overridden by the page
// (useTopBarLeft). Writing that override changes the context the hook reads,
// which re-renders the calling page. If the page hands back a fresh element
// every render the effect feeds on its own write and the page dies with
// "Maximum update depth exceeded". /components?q= hit exactly that path.
//
// This renders the real provider and hook against both shapes of caller.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { createElement as h, act, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { createPortal } from 'react-dom'
import { cleanup, fireEvent, render, within } from '@testing-library/react'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { TopBar } from './TopBar'
import { PageCrumbs, TopBarInstallSlot, TopBarProvider, useTopBarInstallSlot, useTopBarLeft } from './PageCrumbs'
import { offerPillMode } from './top-bar-crumbs'

// The route the bar is rendered on, per test.
let currentPath = '/'
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
// The bar's right cluster reads the session, the theme and the premium state;
// none of that is what these tests are about.
vi.mock('./SiteSearch', () => ({ SiteSearch: () => h('button', { type: 'button', 'aria-label': 'Search' }) }))
vi.mock('./ThemeToggle', () => ({ ThemeToggle: () => null }))
vi.mock('./auth/TopAuthPill', () => ({ TopAuthPill: () => null }))
vi.mock('./billing/OfferBanner', () => ({ OfferBanner: () => h('span', { 'data-offer': '' }) }))

afterEach(() => {
  cleanup()
  currentPath = '/'
})

// React only batches act() work when the environment says it is a test.
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const RENDER_CEILING = 200

// Renders a page that calls useTopBarLeft with whatever makeNode returns and
// reports how many times it rendered before the tree settled.
function rendersUntilSettled(makeNode: () => ReactNode | null): number {
  let renders = 0
  function Page() {
    renders++
    if (renders > RENDER_CEILING) throw new Error('runaway')
    useTopBarLeft(makeNode())
    return h('div', null, 'page')
  }
  const host = document.createElement('div')
  document.body.appendChild(host)
  try {
    act(() => {
      createRoot(host).render(h(TopBarProvider, null, h(Page)))
    })
  } catch {
    return RENDER_CEILING + 1
  }
  return renders
}

describe('useTopBarLeft', () => {
  it('settles when the page owns no override', () => {
    expect(rendersUntilSettled(() => null)).toBeLessThan(5)
  })

  it('settles when the page memoises its override', () => {
    const stable = h('p', null, '3 results')
    expect(rendersUntilSettled(() => stable)).toBeLessThan(5)
  })

  it('does not settle when the page builds a new element every render', () => {
    // The shape this test exists to forbid. Any caller that looks like this is
    // the bug, not the hook.
    expect(rendersUntilSettled(() => h('p', null, '3 results'))).toBeGreaterThan(5)
  })
})

// The tests above prove the hook's contract. This one fences the caller that
// broke it: HomeClient must hand useTopBarLeft a memoised identifier, never an
// expression that builds a new element on every render.
describe('HomeClient honours the useTopBarLeft contract', () => {
  it('passes a memoised identifier, not an inline expression', () => {
    const src = readFileSync(join(__dirname, 'HomeClient.tsx'), 'utf8')
    const call = src.match(/useTopBarLeft\(([^)]*)\)/)
    expect(call, 'HomeClient no longer calls useTopBarLeft').not.toBeNull()
    const arg = call![1].trim()
    expect(arg, 'the argument must be a plain identifier').toMatch(/^[A-Za-z_$][\w$]*$/)
    expect(src).toMatch(new RegExp(`const ${arg} = useMemo\\(`))
  })
})

// The install control is owned by the page and drawn inside the crumb row. The
// row can commit after the page's own install code has mounted. A page that
// looked the slot up once on mount portaled into the server's copy of the node,
// broke hydration, and was left holding a detached node: the install button
// vanished on every first load of the three showcase pages. The row publishes
// its own node and pages follow it.
describe('useTopBarInstallSlot', () => {
  function Page() {
    const slot = useTopBarInstallSlot()
    return slot ? createPortal(h('button', null, 'Install'), slot) : null
  }
  function mount() {
    const host = document.createElement('div')
    document.body.appendChild(host)
    const rootEl = createRoot(host)
    const render = (bar: ReactNode) =>
      act(() => rootEl.render(h(TopBarProvider, null, h(Page), bar)))
    const button = () => document.querySelector('#andromeda-install-slot button')
    return { render, button, unmount: () => act(() => rootEl.unmount()) }
  }

  it('reaches a page that mounted before the bar did', () => {
    const t = mount()
    t.render(null)
    expect(t.button()).toBeNull()
    t.render(h(TopBarInstallSlot, { id: 'andromeda-install-slot' }))
    expect(t.button()?.textContent).toBe('Install')
    t.unmount()
  })

  it('follows the node when the bar is rebuilt, and lets go when it leaves', () => {
    const t = mount()
    t.render(h(TopBarInstallSlot, { key: 'a', id: 'andromeda-install-slot' }))
    const first = document.getElementById('andromeda-install-slot')
    t.render(h(TopBarInstallSlot, { key: 'b', id: 'andromeda-install-slot' }))
    const second = document.getElementById('andromeda-install-slot')
    expect(second).not.toBe(first)
    expect(second?.querySelector('button')?.textContent).toBe('Install')
    t.render(null)
    expect(document.querySelector('button')).toBeNull()
    t.unmount()
  })

  it('is the only way a page finds the slot', () => {
    const app = join(__dirname, '..')
    const walk = (dir: string, out: string[] = []): string[] => {
      for (const name of readdirSync(dir)) {
        if (name === 'node_modules' || name.startsWith('.')) continue
        const full = join(dir, name)
        if (statSync(full).isDirectory()) walk(full, out)
        else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(full)
      }
      return out
    }
    const offenders = walk(app).filter((f) => /getElementById\([^)]*install-slot/.test(readFileSync(f, 'utf8')))
    expect(offenders).toEqual([])
  })
})

// Which routes carry the offer pill. The rule is "wherever the middle of the
// bar is free", so the cases that matter are the ones where it is not.
describe('offerPillMode', () => {
  it('links from the ordinary pages', () => {
    for (const path of ['/', '/components', '/components/category/forms', '/faq', '/about', '/mcp'])
      expect(offerPillMode(path), path).toBe('link')
  })

  it("stays off a single component's page, where the crumb is already long", () => {
    for (const path of [
      '/components/perspective-showcase-hero',
      '/components/jar-of-emotions',
      '/design-systems/andromeda/button',
      '/design-systems/andromeda-pro/gauge',
    ])
      expect(offerPillMode(path), path).toBeNull()
  })

  it('stands down where an install control owns the right of the bar', () => {
    for (const path of [
      '/design-systems/andromeda/system',
      '/design-systems/andromeda-pro/foundation',
      '/design-systems/andromeda-pro/components',
      '/design-systems/andromeda-pro/brain/explore',
    ])
      expect(offerPillMode(path), path).toBeNull()
  })

  it('shows on the pricing page without linking to it', () => {
    expect(offerPillMode('/pricing')).toBe('static')
    expect(offerPillMode('/pricing/')).toBe('static')
  })
})

// One bar on every page that draws one: the catalog routes now get the same
// navigation as the homepage, instead of a crumb bar beside the rail.
describe('the crumb row stays off the pages without the rail', () => {
  it('no rail-less page imports PageCrumbs', () => {
    const appDir = join(process.cwd(), 'app')
    const dirs = ['home', 'pricing', 'mcp', 'faq', 'about', 'contact', 'feedback', 'welcome', 'credits', 'impressum', 'privacy', 'terms', 'refund', 'premium-license', 'account']
    const files: string[] = [join(appDir, 'page.tsx')]
    const walk = (d: string) => {
      for (const f of readdirSync(d)) {
        const p = join(d, f)
        if (statSync(p).isDirectory()) walk(p)
        else if (/\.tsx?$/.test(f)) files.push(p)
      }
    }
    for (const d of dirs) walk(join(appDir, d))
    for (const f of files) expect(readFileSync(f, 'utf8'), f).not.toMatch(/PageCrumbs/)
  })
})

describe('the global top bar', () => {
  const CATALOG = [
    '/components',
    '/components/category/widgets',
    '/components/collection/glass',
    '/components/jar-of-emotions',
    '/design-systems/andromeda-pro',
    '/design-systems/andromeda/system',
  ]

  function bar(path: string) {
    currentPath = path
    const { container } = render(h(TopBarProvider, null, h(TopBar)))
    return container.querySelector('header')
  }

  // Renders the whole bar for every route below: room for a busy machine.
  it('draws the main navigation on the homepage and on every catalog route', { timeout: 20_000 }, () => {
    for (const path of ['/', '/pricing', ...CATALOG]) {
      const header = bar(path)
      expect(header, path).not.toBeNull()
      const nav = within(header!).getByRole('navigation', { name: 'Main' })
      // Every menu is closed, so the only buttons and links are the items.
      // jsdom applies no CSS, so both More menus are in the list: the compact
      // one shown below lg, then the wide one from lg up.
      const items = [...nav.querySelectorAll('button, a')].map((el) => el.textContent?.trim())
      expect(items, path).toEqual(['Design systems', 'Components & blocks', 'Docs', 'Icons', 'MCP', 'More', 'More'])
      cleanup()
    }
  })

  it('shows Docs, Icons, MCP and the wide More from lg, and folds them into a compact More below lg', () => {
    const header = bar('/components')!
    const nav = within(header).getByRole('navigation', { name: 'Main' })
    const icons = within(nav).getByRole('link', { name: 'Icons' })
    expect(icons.parentElement?.className).toBe('hidden lg:contents')
    expect(within(nav).getByRole('link', { name: 'Docs' }).parentElement).toBe(icons.parentElement)
    expect(within(nav).getByRole('link', { name: 'MCP' }).parentElement).toBe(icons.parentElement)
    const [compact, wide] = within(nav).getAllByRole('button', { name: 'More' })
    expect(compact.parentElement?.parentElement?.className).toBe('lg:hidden')
    expect(wide.parentElement?.parentElement?.className).toBe('hidden lg:block')
    fireEvent.click(compact)
    const links = [...header.querySelectorAll('ul a')].map((a) => a.getAttribute('href'))
    expect(links).toEqual(['/docs', '/icons', '/mcp', '/pricing', '/about', '/faq', '/contact', '/feedback'])
  })

  it('links Icons to /icons and MCP to /mcp, and Pricing is no longer a top-level link', () => {
    const header = bar('/components')!
    const nav = within(header).getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Icons' }).getAttribute('href')).toBe('/icons')
    expect(within(nav).getByRole('link', { name: 'MCP' }).getAttribute('href')).toBe('/mcp')
    expect(within(nav).queryByRole('link', { name: 'Pricing' })).toBeNull()
  })

  it('opens More on Pricing, then About, FAQ, Contact, Feedback', () => {
    const header = bar('/components')!
    // The wide More, the one drawn from lg up.
    fireEvent.click(within(header).getAllByRole('button', { name: 'More' })[1])
    const links = [...header.querySelectorAll('ul a')].map((a) => [a.textContent, a.getAttribute('href')])
    expect(links).toEqual([
      ['Pricing', '/pricing'],
      ['About', '/about'],
      ['FAQ', '/faq'],
      ['Contact', '/contact'],
      ['Feedback', '/feedback'],
    ])
  })

  it('marks the section you are in with aria-current, catalog routes included', () => {
    const components = bar('/components/category/widgets')!
    expect(within(components).getByRole('button', { name: 'Components & blocks' }).getAttribute('aria-current')).toBe('true')
    expect(within(components).getByRole('button', { name: 'Design systems' }).getAttribute('aria-current')).toBeNull()
    cleanup()
    const systems = bar('/design-systems/andromeda-pro/components')!
    expect(within(systems).getByRole('button', { name: 'Design systems' }).getAttribute('aria-current')).toBe('true')
    expect(within(systems).getByRole('button', { name: 'Components & blocks' }).getAttribute('aria-current')).toBeNull()
  })

  it('carries no crumbs, no install slot and no bottom rule', () => {
    for (const path of CATALOG) {
      const header = bar(path)!
      expect(header.querySelector('nav[aria-label="Breadcrumb"]'), path).toBeNull()
      expect(header.querySelector('[id$="install-slot"]'), path).toBeNull()
      expect(header.className, path).not.toMatch(/\bborder-b\b/)
      cleanup()
    }
  })

  it('sits above the rail and the scroll column in the root layout, not inside them', () => {
    const layout = readFileSync(join(__dirname, '..', 'layout.tsx'), 'utf8')
    const bar = layout.search(/<TopBar\s*\/>/)
    expect(bar).toBeGreaterThan(-1)
    expect(bar).toBeLessThan(layout.indexOf('<Sidebar'))
    expect(bar).toBeLessThan(layout.indexOf('app-scroll-column'))
  })
})

const appDir = join(__dirname, '..')
function walkApp(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walkApp(full, out)
    else if (/\.(tsx?|css)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(full)
  }
  return out
}
const read = (rel: string) => readFileSync(join(appDir, rel), 'utf8')

// The crumbs, the install slot and the offer pill left the slim line across
// the top of the content column for one row drawn by each page directly above
// its own title, where they replaced the small overline that used to sit there.
describe('the crumb row above the title', () => {
  function row(path: string) {
    currentPath = path
    const { container } = render(h(TopBarProvider, null, h(PageCrumbs)))
    return container.querySelector('[data-page-crumbs]')
  }

  it('draws the crumb trail on the catalog routes', () => {
    const el = row('/components/category/widgets')!
    const crumbs = within(el as HTMLElement).getByRole('navigation', { name: 'Breadcrumb' })
    expect(crumbs.textContent).toBe('Standalone: Components & Blocks/Widgets')
    cleanup()
    const ds = row('/design-systems/andromeda-pro')!
    expect(within(ds as HTMLElement).getByRole('navigation', { name: 'Breadcrumb' }).textContent).toBe(
      'Design Systems/Andromeda Pro',
    )
  })

  it('carries the install slot and the offer pill on its right, in the same row as the crumbs', () => {
    for (const [path, id] of [
      ['/design-systems/andromeda-pro/components', 'andromeda-install-slot'],
      ['/design-systems/andromeda-pro/foundation', 'andromeda-install-slot'],
      ['/design-systems/andromeda/system', 'andromeda-install-slot'],
      ['/design-systems/andromeda-pro/brain/explore', 'brain-install-slot'],
    ]) {
      const el = row(path)!
      const slot = el.querySelector(`#${id}`)
      expect(slot, path).not.toBeNull()
      // The crumbs come first, the slot after them.
      const nav = el.querySelector('nav[aria-label="Breadcrumb"]')!
      expect(nav.compareDocumentPosition(slot!) & Node.DOCUMENT_POSITION_FOLLOWING, path).toBeTruthy()
      cleanup()
    }
    const offer = row('/components')!
    expect(offer.querySelector('[data-offer]')).not.toBeNull()
    expect(
      offer.querySelector('nav[aria-label="Breadcrumb"]')!.compareDocumentPosition(offer.querySelector('[data-offer]')!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    cleanup()
    expect(row('/components/jar-of-emotions')!.querySelector('[data-offer]')).toBeNull()
  })

  it('a page portals its install control into the row', () => {
    currentPath = '/design-systems/andromeda-pro/components'
    function Page() {
      const slot = useTopBarInstallSlot()
      return slot ? createPortal(h('button', null, 'Install'), slot) : null
    }
    const { container } = render(h(TopBarProvider, null, h(Page), h(PageCrumbs)))
    expect(container.querySelector('[data-page-crumbs] #andromeda-install-slot button')?.textContent).toBe('Install')
  })

  it('the page override replaces the crumbs', () => {
    currentPath = '/components'
    const count = h('p', null, '3 results')
    function Page() {
      useTopBarLeft(count)
      return h(PageCrumbs)
    }
    const { container } = render(h(TopBarProvider, null, h(Page)))
    expect(container.querySelector('[data-page-crumbs]')?.textContent).toContain('3 results')
    expect(container.querySelector('nav[aria-label="Breadcrumb"]')).toBeNull()
  })

  it('the override never bleeds onto the next page', () => {
    currentPath = '/components'
    const count = h('p', null, '3 results')
    function Page() {
      useTopBarLeft(count)
      return null
    }
    const { container, rerender } = render(h(TopBarProvider, null, h(Page), h(PageCrumbs)))
    expect(container.textContent).toContain('3 results')
    currentPath = '/components/category/widgets'
    rerender(h(TopBarProvider, null, h(PageCrumbs)))
    expect(container.textContent).not.toContain('3 results')
    expect(container.querySelector('nav[aria-label="Breadcrumb"]')?.textContent).toBe('Standalone: Components & Blocks/Widgets')
  })

  // Every page that has crumbs draws the row above its own h1, and the
  // overline that used to sit there is gone.
  const CRUMB_PAGES = [
    'components/HomeClient.tsx',
    'components/[slug]/ComponentPageView.tsx',
    'design-systems/andromeda-pro/overview-b/OverviewB.tsx',
    'design-systems/andromeda-pro/foundation/FoundationView.tsx',
    'design-systems/andromeda-pro/system/AndromedaGallery.tsx',
    'design-systems/andromeda-pro/image-pack/page.tsx',
    'design-systems/andromeda-pro/brain/BrainStoryV4.tsx',
    'design-systems/andromeda-pro/brain/BrainViewer.tsx',
    'design-systems/andromeda-pro/[component]/AndromedaComponentView.tsx',
    'design-systems/andromeda/AndromedaOverview.tsx',
    'design-systems/andromeda/system/AndromedaShowcase.tsx',
    'design-systems/andromeda/brain/BrainStoryV4.tsx',
    'design-systems/andromeda/brain/BrainViewer.tsx',
    'design-systems/andromeda/[component]/AndromedaComponentView.tsx',
  ]

  it('is drawn directly above the h1 on every crumb page, with no overline between them', () => {
    for (const rel of CRUMB_PAGES) {
      const src = read(rel)
      const crumbs = src.indexOf('<PageCrumbs')
      expect(crumbs, rel).toBeGreaterThan(-1)
      // The brain readers' titles are the markdown file's own heading, in the
      // rendered body.
      const title = [
        src.indexOf('<PageTitle', crumbs),
        src.indexOf('<h1', crumbs),
        src.indexOf('dangerouslySetInnerHTML={{ __html: html }}', crumbs),
      ].filter((i) => i > -1)
      expect(title.length, `${rel}: no title after the crumbs`).toBeGreaterThan(0)
      const between = src.slice(crumbs, Math.min(...title))
      expect(between, rel).not.toContain('PageOverline')
      expect(between, rel).not.toMatch(/uppercase/)
    }
    expect(read('lib/categories.ts')).not.toContain('COMPONENTS_SECTION_OVERLINE')
  })

  it('is never drawn on the pages without the rail', () => {
    expect(read('components/PageKit.tsx')).not.toContain('PageCrumbs')
    expect(read('home/HomePage.tsx')).not.toContain('PageCrumbs')
  })

  it('replaced the crumb line, which is gone with everything that existed only for it', () => {
    const offenders = walkApp(appDir).filter((f) => /data-crumb-bar|CrumbBar/.test(readFileSync(f, 'utf8')))
    expect(offenders.map((f) => f.slice(appDir.length + 1))).toEqual([])
    expect(read('components/TopBar.tsx')).not.toContain('installSlot')
  })
})
