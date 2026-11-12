// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { LINE_ICON_NOTICE } from '../../../scripts/lib/icon-notice.mjs'
import { ActionBar } from './ActionBar'

const gate = vi.hoisted(() => ({ blocked: vi.fn(() => false), askForPremium: vi.fn(), masked: false, needsAccount: false }))
vi.mock('./useInstallGate', () => ({ useInstallGate: () => gate }))

const MARKUP = '<path d="M4 12h16" />'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
  gate.blocked.mockReset().mockReturnValue(false)
  gate.askForPremium.mockReset()
})

function openMenu() {
  render(<ActionBar name="arrow-right" markup={MARKUP} size={24} weight="regular" colour={null} style="line" />)
  const trigger = screen.getByRole('button', { name: 'More copy and download options' })
  fireEvent.click(trigger)
  return { trigger, menu: screen.getByRole('menu'), items: screen.getAllByRole('menuitem') }
}

describe('ActionBar menu', () => {
  it('moves focus to the first item and ties the trigger to the menu', () => {
    const { trigger, menu, items } = openMenu()
    expect(document.activeElement).toBe(items[0])
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(trigger.getAttribute('aria-controls')).toBe(menu.id)
  })

  it('walks the items with Up, Down, Home and End, wrapping at the ends', () => {
    const { items } = openMenu()
    fireEvent.keyDown(items[0], { key: 'ArrowUp' })
    expect(document.activeElement).toBe(items[items.length - 1])
    fireEvent.keyDown(items[items.length - 1], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[0])
    fireEvent.keyDown(items[0], { key: 'End' })
    expect(document.activeElement).toBe(items[items.length - 1])
    fireEvent.keyDown(items[items.length - 1], { key: 'Home' })
    expect(document.activeElement).toBe(items[0])
  })

  it('keeps arrow keys from reaching the page listener that walks to another icon', () => {
    const { items } = openMenu()
    const walk = vi.fn()
    document.addEventListener('keydown', walk)
    fireEvent.keyDown(items[0], { key: 'ArrowRight' })
    fireEvent.keyDown(items[0], { key: 'ArrowDown' })
    document.removeEventListener('keydown', walk)
    expect(walk).not.toHaveBeenCalled()
  })

  it('closes on Escape and on a pick, returning focus to the trigger', () => {
    const { trigger, items } = openMenu()
    fireEvent.keyDown(items[1], { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger)

    fireEvent.click(trigger)
    fireEvent.click(screen.getAllByRole('menuitem')[2])
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
})

describe('ActionBar downloads', () => {
  const { createObjectURL, revokeObjectURL } = URL
  afterEach(() => {
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL
  })

  it('revokes the download URL only after a delay', () => {
    vi.useFakeTimers()
    const revoke = vi.fn()
    URL.createObjectURL = () => 'blob:icon'
    URL.revokeObjectURL = revoke
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    render(<ActionBar name="arrow-right" markup={MARKUP} size={24} weight="regular" colour={null} style="line" />)
    fireEvent.click(screen.getByRole('button', { name: 'SVG' }))
    expect(revoke).not.toHaveBeenCalled()
    vi.advanceTimersByTime(5000)
    expect(revoke).toHaveBeenCalledWith('blob:icon')
  })

  it('copies and downloads a Line SVG with its licence notice, and a paid style without', async () => {
    const blobs: Blob[] = []
    URL.createObjectURL = (blob: Blob | MediaSource) => {
      blobs.push(blob as Blob)
      return 'blob:icon'
    }
    URL.revokeObjectURL = () => {}
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    const { items } = openMenu()
    fireEvent.click(items.find((item) => item.textContent === 'Copy SVG')!)
    fireEvent.click(screen.getByRole('button', { name: 'SVG' }))
    await waitFor(() => expect(writeText).toHaveBeenCalled())
    expect(writeText.mock.calls[0][0]).toContain(`<!--! ${LINE_ICON_NOTICE} -->`)
    expect(await blobs[0].text()).toContain(`<!--! ${LINE_ICON_NOTICE} -->`)

    cleanup()
    render(<ActionBar name="arrow-right" markup={MARKUP} size={24} weight="regular" colour={null} style="duotone" />)
    fireEvent.click(screen.getByRole('button', { name: 'SVG' }))
    expect(await blobs[1].text()).not.toContain('<!--')
  })

  it('says so when the PNG export fails', async () => {
    URL.createObjectURL = () => {
      throw new Error('no blob URLs')
    }
    const { items } = openMenu()
    fireEvent.click(items.find((item) => item.textContent === 'Download PNG')!)
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/PNG download failed/))
  })
})

describe('ActionBar gate', () => {
  const PREVIEW = 'aic-preview:/icons-preview/solid/arrow-right.png'

  it('does not copy an install when the gate takes the click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    gate.blocked.mockReturnValue(true)
    render(<ActionBar name="arrow-right" markup={MARKUP} size={24} weight="regular" colour={null} style="line" />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy for agent' }))
    fireEvent.click(screen.getByRole('button', { name: 'More copy and download options' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Copy install command' }))
    expect(gate.blocked).toHaveBeenCalledTimes(2)
    fireEvent.click(screen.getByRole('button', { name: 'More copy and download options' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Copy JSX' }))
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1))
    expect(writeText.mock.calls[0][0]).toBe('<ArrowRight size={24} />')
  })

  it('gives a locked paid style the same labels as Line, each opening the upgrade box', () => {
    render(<ActionBar name="arrow-right" markup={PREVIEW} size={24} weight="regular" colour={null} style="solid" />)
    fireEvent.click(screen.getByRole('button', { name: 'SVG' }))
    fireEvent.click(screen.getByRole('button', { name: 'More copy and download options' }))
    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
      'Copy for agent', 'Copy install command', 'Copy JSX', 'Copy SVG', 'Download SVG', 'Download PNG',
    ])
    fireEvent.click(screen.getByRole('menuitem', { name: 'Download PNG' }))
    expect(gate.askForPremium).toHaveBeenCalledTimes(2)
  })

  it('waits while a paid style still loads, so a subscriber is never upsold', () => {
    render(<ActionBar name="arrow-right" markup={PREVIEW} size={24} weight="regular" colour={null} style="solid" exportReady={false} />)
    expect(screen.getByRole('button', { name: 'SVG' })).toHaveProperty('disabled', true)
    fireEvent.click(screen.getByRole('button', { name: 'More copy and download options' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Copy SVG' }))
    expect(gate.askForPremium).not.toHaveBeenCalled()
  })
})
