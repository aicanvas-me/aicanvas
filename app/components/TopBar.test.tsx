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
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { TopBarProvider, useTopBarLeft } from './TopBar'

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
