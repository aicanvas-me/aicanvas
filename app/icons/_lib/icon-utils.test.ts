import { describe, it, expect } from 'vitest'
import { fitMarkup } from './icon-utils'
import { buildSvg } from './svg'

const solid = '<g data-fit="12 12 20"><path d="M2 2H22V22H2Z" fill="currentColor" stroke="none"/></g>'

describe('fitMarkup', () => {
  it('drops the wrapper at a line weight of 2, leaving the file markup', () => {
    expect(fitMarkup(solid, 2)).toBe('<path d="M2 2H22V22H2Z" fill="currentColor" stroke="none"/>')
  })

  it('scales the solid about its centre so the long side moves by the weight change', () => {
    // 64 px, stroke 2, absolute: weight 0.75, long side 20 -> 18.75
    expect(fitMarkup(solid, 0.75)).toBe('<g transform="matrix(0.9375 0 0 0.9375 0.75 0.75)"><path d="M2 2H22V22H2Z" fill="currentColor" stroke="none"/></g>')
  })

  it('leaves markup without a fit alone', () => {
    expect(fitMarkup('<path d="M4 4L20 20"/>', 0.75)).toBe('<path d="M4 4L20 20"/>')
  })
})

describe('buildSvg', () => {
  it('applies the fit at the exported weight', () => {
    expect(buildSvg(solid, 24, 2)).not.toContain('transform')
    expect(buildSvg(solid, 64, 2)).toContain('stroke-width="0.75"')
    expect(buildSvg(solid, 64, 2)).toContain('matrix(0.9375 0 0 0.9375 0.75 0.75)')
    expect(buildSvg(solid, 64, 2, 'currentColor', false)).not.toContain('transform')
  })
})
