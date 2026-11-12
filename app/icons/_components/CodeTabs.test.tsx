// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { CodeTabs } from './CodeTabs'

const gate = vi.hoisted(() => ({ blocked: () => false, askForPremium: () => {}, masked: false, needsAccount: false }))
vi.mock('./useInstallGate', () => ({ useInstallGate: () => gate }))

const MARKUP = '<path d="M4 12h16" />'

afterEach(() => {
  cleanup()
  gate.masked = false
  gate.needsAccount = false
})

function setup() {
  render(<CodeTabs name="arrow-right" markup={MARKUP} size={24} weight="regular" colour={null} style="line" />)
  return screen.getAllByRole('tab')
}

describe('CodeTabs', () => {
  it('keeps only the selected tab in the Tab order and points every tab at the panel', () => {
    const tabs = setup()
    const panel = screen.getByRole('tabpanel')
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([0, -1, -1])
    for (const tab of tabs) expect(tab.getAttribute('aria-controls')).toBe(panel.id)
    expect(panel.getAttribute('aria-labelledby')).toBe(tabs[0].id)
  })

  it('moves and selects with Left, Right, Home and End, wrapping at the ends', () => {
    const tabs = setup()
    tabs[0].focus()
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tabs[1])
    expect(tabs[1].getAttribute('aria-selected')).toBe('true')
    expect(tabs.map((tab) => tab.tabIndex)).toEqual([-1, 0, -1])

    fireEvent.keyDown(tabs[1], { key: 'End' })
    expect(document.activeElement).toBe(tabs[2])
    fireEvent.keyDown(tabs[2], { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tabs[0])
    fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(tabs[2])
    fireEvent.keyDown(tabs[2], { key: 'Home' })
    expect(document.activeElement).toBe(tabs[0])
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe(tabs[0].id)
  })

  it('marks the arrow keys handled, so the page does not also walk to another icon', () => {
    const tabs = setup()
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
    tabs[0].dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })
})

describe('CodeTabs Install', () => {
  const install = () => {
    fireEvent.click(screen.getByRole('tab', { name: 'Install' }))
    return screen.getByRole('tabpanel').textContent ?? ''
  }

  it('shows dots and the Premium note until Premium is confirmed', () => {
    gate.masked = true
    render(<CodeTabs name="arrow-right" markup={MARKUP} size={24} weight="regular" colour={null} style="solid" />)
    const text = install()
    expect(text).toContain('@aicanvas/••••••••••••')
    expect(text).not.toContain('arrow-right')
    expect(text).toContain('Requires AI Canvas Premium to install.')
  })

  it('keeps a free command readable and says it needs an account when signed out', () => {
    gate.needsAccount = true
    render(<CodeTabs name="arrow-right" markup={MARKUP} size={24} weight="regular" colour={null} style="line" />)
    const text = install()
    expect(text).toContain('npx shadcn@latest add @aicanvas/icon-arrow-right')
    expect(text).toContain('Free account required.')
  })
})
