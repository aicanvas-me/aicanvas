// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { StylePicker } from './StylePicker'

afterEach(cleanup)

describe('StylePicker', () => {
  it('renders the one style track, the pick the only radio in the Tab order', () => {
    render(<StylePicker value="solid" onChange={() => {}} />)
    const radios = screen.getAllByRole('radio')
    expect(radios.map((radio) => radio.getAttribute('aria-label'))).toEqual([
      'Line, Free',
      'Duotone, Premium',
      'Solid, Premium',
      'Solid duotone, Premium',
    ])
    expect(radios.map((radio) => radio.tabIndex)).toEqual([-1, -1, 0, -1])
  })

  it('picks the next style with the arrow keys, wrapping at the ends', () => {
    const onChange = vi.fn()
    render(<StylePicker value="solid-duotone" onChange={onChange} />)
    fireEvent.keyDown(screen.getAllByRole('radio')[3], { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith('line')
  })
})
