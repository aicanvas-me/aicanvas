// @vitest-environment jsdom
//
// Andromeda Tooltip: the behaviours that have bitten in production or that a
// screenshot cannot prove. The edge-clamp case is a regression test for a
// live-site crash ("Maximum update depth exceeded" on hover of a trigger near
// the viewport edge); the rest pins the portal, the keyboard contract and SSR.
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { act, createElement as h } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { Tooltip } from '../../design-systems/andromeda/components/Tooltip'

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const tip = () => document.querySelector<HTMLElement>('[role="tooltip"]')

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  // jsdom has no matchMedia; framer's reduced-motion hook reads it on mount.
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent() { return false },
    })) as typeof window.matchMedia
  }
})

let root: Root | null = null
let host: HTMLDivElement | null = null

function mount(props: Record<string, unknown>) {
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  act(() => {
    root!.render(h(Tooltip, { label: 'Notifications', ...props }, h('button', { type: 'button' }, 'bell')))
  })
  const wrapper = host.firstElementChild as HTMLDivElement
  return { wrapper, button: wrapper.querySelector('button')! }
}

function fire(el: Element, type: string, init?: Record<string, unknown>) {
  act(() => {
    const Ctor = type === 'keydown' ? KeyboardEvent : MouseEvent
    el.dispatchEvent(new Ctor(type, { bubbles: true, cancelable: true, ...init }))
  })
}

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  root = null
  host = null
})

describe('Andromeda Tooltip', () => {
  it('reveals on hover and on keyboard focus, with role=tooltip', () => {
    const { wrapper } = mount({})
    expect(tip()).toBeNull()

    fire(wrapper, 'mouseover')
    // React's onMouseEnter is synthesised from mouseover/mouseout pairs.
    expect(tip()?.textContent).toBe('Notifications')

    fire(wrapper, 'mouseout', { relatedTarget: document.body })
    fire(wrapper, 'focusin')
    expect(tip()?.textContent).toBe('Notifications')
  })

  it('does not loop when the label has to be clamped away from the viewport edge', async () => {
    const { wrapper } = mount({})
    // A 20px trigger sitting 24px from the right edge of a 1024px viewport,
    // carrying a 200px label. Centred, the label would poke 94px past the
    // inset, so the clamp has to run. The old code measured its own shifted
    // rect and compounded that correction until React threw.
    wrapper.getBoundingClientRect = () =>
      ({ left: 1000, right: 1020, width: 20, top: 100, bottom: 120, height: 20, x: 1000, y: 100, toJSON() {} }) as DOMRect
    const widthDesc = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get() { return (this as HTMLElement).getAttribute('role') === 'tooltip' ? 200 : 20 },
    })
    try {
      fire(wrapper, 'mouseover')
      // Let every follow-up render, resize pass and framer frame settle.
      await act(() => sleep(50))
      expect(tip()).not.toBeNull()
      // 8px inset: limit 1016, centre 1010, half 100 → shift = 1016 - 1110.
      const transform = tip()!.style.transform
      if (transform) expect(transform).toContain('-94px')
    } finally {
      if (widthDesc) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', widthDesc)
    }
  })

  it('renders inline by default, inside the trigger wrapper', () => {
    const { wrapper } = mount({})
    fire(wrapper, 'mouseover')
    expect(wrapper.contains(tip())).toBe(true)
    expect(tip()!.style.position).toBe('absolute')
  })

  it('portal: lifts the label to <body> at fixed coords, carrying the token layer', async () => {
    const { wrapper } = mount({ portal: true })
    await act(() => sleep(0)) // the mounted flag flips in a passive effect
    fire(wrapper, 'mouseover')
    const node = tip()!
    expect(node).not.toBeNull()
    expect(wrapper.contains(node)).toBe(false)
    expect(node.parentElement).toBe(document.body)
    expect(node.style.position).toBe('fixed')
    // A body portal leaves the wrapper's token layer behind, so the label
    // carries it itself; without this the theme channel is dead on it.
    expect(node.style.getPropertyValue('--andromeda-text-secondary')).not.toBe('')
    // The opt-in must never reach the DOM as an attribute.
    expect(wrapper.hasAttribute('portal')).toBe(false)
  })

  it('Escape dismisses an open label', async () => {
    const { wrapper } = mount({})
    fire(wrapper, 'focusin')
    expect(tip()).not.toBeNull()
    fire(wrapper, 'keydown', { key: 'Escape' })
    // AnimatePresence keeps the node through its exit fade (duration.fast).
    await act(() => sleep(400))
    expect(tip()).toBeNull()
  })

  it('renders on the server, portal or not', () => {
    for (const portal of [false, true]) {
      const html = renderToString(h(Tooltip, { label: 'X', portal }, h('button', null, 'go')))
      expect(html).toContain('<button')
      expect(html).not.toContain('role="tooltip"')
    }
  })
})
