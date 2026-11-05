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
  it('shows why it is disabled as visible text the control is described by', () => {
    const slider = renderSlider(true)
    const hint = screen.getByText(HINT)
    expect(slider.getAttribute('aria-describedby')).toBe(hint.id)
  })

  it('shows no hint while enabled', () => {
    const slider = renderSlider(false)
    expect(screen.queryByText(HINT)).toBeNull()
    expect(slider.hasAttribute('aria-describedby')).toBe(false)
  })
})
