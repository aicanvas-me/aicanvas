// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ActionBar } from './ActionBar'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

const MARKUP = '<path d="M4 12h16" />'

afterEach(cleanup)

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
