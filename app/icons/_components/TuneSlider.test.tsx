// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { TuneSlider } from './TuneSlider'

afterEach(cleanup)

const HINT = 'Solid styles are filled shapes with a fixed weight'

function renderSlider(disabled: boolean) {
  render(
    <TuneSlider
      label="Weight"
      disabled={disabled}
      hint={HINT}
      disabledValue="Fixed"
      value={2}
      onChange={() => {}}
      min={0}
      max={4}
      step={1}
      format={String}
      valueText={String}
    />,
  )
  return screen.getByRole('slider', { name: 'Weight' })
}

describe('TuneSlider', () => {
  it('reads Fixed in the value slot and describes the reason without an extra row', () => {
    const slider = renderSlider(true)
    const hint = screen.getByText(HINT)
    expect(slider.getAttribute('aria-describedby')).toBe(hint.id)
    expect(hint.className).toContain('sr-only')
    expect(screen.getAllByText('Fixed').length).toBeGreaterThan(0)
    expect(slider.getAttribute('aria-valuetext')).toBe('Fixed')
  })

  it('shows no hint while enabled', () => {
    const slider = renderSlider(false)
    expect(screen.queryByText(HINT)).toBeNull()
    expect(slider.hasAttribute('aria-describedby')).toBe(false)
    expect(screen.queryAllByText('Fixed')).toHaveLength(0)
  })
})
