// @vitest-environment jsdom
// The top bar's left side can be overridden by the page under it
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
import { CrumbBar, TopBar, TopBarInstallSlot, TopBarProvider, useTopBarInstallSlot, useTopBarLeft } from './TopBar'
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
// The icon barrel is thousands of modules the bar never needs in a test.
vi.mock('@phosphor-icons/react', () => ({ CaretDown: () => null }))

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

// The install control is owned by the page and drawn inside the bar. The bar
// hydrates in its own Suspense boundary, so the page can mount BEFORE it. A
// page that looked the slot up once on mount portaled into the server's copy
// of the node, broke the bar's hydration, and was left holding a detached node:
// the install button vanished on every first load of the three showcase pages.
// The bar now publishes its own node and pages follow it.
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

  it('draws the main navigation on the homepage and on every catalog route', () => {
    for (const path of ['/', '/pricing', ...CATALOG]) {
      const header = bar(path)
      expect(header, path).not.toBeNull()
      const nav = within(header!).getByRole('navigation', { name: 'Main' })
      // Every menu is closed, so the only buttons and links are the items.
      // jsdom applies no CSS, so both More menus are in the list: the compact
      // one shown below lg, then the wide one from lg up.
      const items = [...nav.querySelectorAll('button, a')].map((el) => el.textContent?.trim())
      expect(items, path).toEqual(['Design systems', 'Components & blocks', 'Icons', 'MCP', 'More', 'More'])
      cleanup()
    }
  })

  it('shows Icons, MCP and the wide More from lg, and folds Icons and MCP into a compact More below lg', () => {
    const header = bar('/components')!
    const nav = within(header).getByRole('navigation', { name: 'Main' })
    const icons = within(nav).getByRole('link', { name: 'Icons' })
    expect(icons.parentElement?.className).toBe('hidden lg:contents')
    expect(within(nav).getByRole('link', { name: 'MCP' }).parentElement).toBe(icons.parentElement)
    const [compact, wide] = within(nav).getAllByRole('button', { name: 'More' })
    expect(compact.parentElement?.parentElement?.className).toBe('lg:hidden')
    expect(wide.parentElement?.parentElement?.className).toBe('hidden lg:block')
    fireEvent.click(compact)
    const links = [...header.querySelectorAll('ul a')].map((a) => a.getAttribute('href'))
    expect(links).toEqual(['/icons', '/mcp', '/pricing', '/about', '/faq', '/contact', '/feedback'])
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
    expect(layout.search(/<CrumbBar\s*\/>/)).toBeGreaterThan(layout.indexOf('app-scroll-column'))
  })
})

// The crumbs and the install slot left the bar for one slim line at the top
// of the content column, on the routes that showed them before.
describe('the crumb line', () => {
  function line(path: string) {
    currentPath = path
    const { container } = render(h(TopBarProvider, null, h(CrumbBar)))
    return container.querySelector('[data-crumb-bar]')
  }

  it('draws the crumb trail on the catalog routes', () => {
    const el = line('/components/category/widgets')!
    const crumbs = within(el as HTMLElement).getByRole('navigation', { name: 'Breadcrumb' })
    expect(crumbs.textContent).toBe('Components & Blocks/Widgets')
  })

  it('carries the install slot where the bar used to, and the offer pill where it used to', () => {
    expect(line('/design-systems/andromeda-pro/components')!.querySelector('#andromeda-install-slot')).not.toBeNull()
    cleanup()
    expect(line('/design-systems/andromeda-pro/brain/explore')!.querySelector('#brain-install-slot')).not.toBeNull()
    cleanup()
    expect(line('/components')!.querySelector('[data-offer]')).not.toBeNull()
    cleanup()
    expect(line('/components/jar-of-emotions')!.querySelector('[data-offer]')).toBeNull()
  })

  it('stays off the rail-less pages, which never had crumbs', () => {
    for (const path of ['/', '/pricing', '/faq', '/account']) {
      expect(line(path), path).toBeNull()
      cleanup()
    }
  })

  it('a page portals its install control into the line', () => {
    currentPath = '/design-systems/andromeda-pro/components'
    function Page() {
      const slot = useTopBarInstallSlot()
      return slot ? createPortal(h('button', null, 'Install'), slot) : null
    }
    const { container } = render(h(TopBarProvider, null, h(CrumbBar), h(Page)))
    expect(container.querySelector('[data-crumb-bar] #andromeda-install-slot button')?.textContent).toBe('Install')
  })

  it('the page override replaces the crumbs', () => {
    currentPath = '/components'
    const count = h('p', null, '3 results')
    function Page() {
      useTopBarLeft(count)
      return null
    }
    const { container } = render(h(TopBarProvider, null, h(CrumbBar), h(Page)))
    expect(container.querySelector('[data-crumb-bar]')?.textContent).toContain('3 results')
    expect(container.querySelector('nav[aria-label="Breadcrumb"]')).toBeNull()
  })
})
