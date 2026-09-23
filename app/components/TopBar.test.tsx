// @vitest-environment jsdom
// The top bar's left side can be overridden by the page under it
// (useTopBarLeft). Writing that override changes the context the hook reads,
// which re-renders the calling page. If the page hands back a fresh element
// every render the effect feeds on its own write and the page dies with
// "Maximum update depth exceeded". /components?q= hit exactly that path.
//
// This renders the real provider and hook against both shapes of caller.
import { describe, it, expect } from 'vitest'
import { createElement as h, act, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { createPortal } from 'react-dom'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { TopBarInstallSlot, TopBarProvider, useTopBarInstallSlot, useTopBarLeft } from './TopBar'
import { showsOfferPill } from './top-bar-crumbs'

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
describe('showsOfferPill', () => {
  it('rides the ordinary pages', () => {
    for (const path of ['/', '/components', '/components/category/forms', '/faq', '/about', '/mcp'])
      expect(showsOfferPill(path), path).toBe(true)
  })

  it('stands down where an install control owns the right of the bar', () => {
    for (const path of [
      '/design-systems/andromeda/system',
      '/design-systems/andromeda-pro/foundation',
      '/design-systems/andromeda-pro/components',
      '/design-systems/andromeda-pro/brain/explore',
    ])
      expect(showsOfferPill(path), path).toBe(false)
  })

  it('does not link the pricing page to itself', () => {
    expect(showsOfferPill('/pricing')).toBe(false)
    expect(showsOfferPill('/pricing/')).toBe(false)
  })
})
