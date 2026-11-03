import { describe, it, expect } from 'vitest'
import { fromIconQuery, toIconQuery, type IconSettings } from './settings-query'

const PAGE: IconSettings = { style: 'line', size: 24, strokeWidth: 2, absolute: true, colour: null }

describe('toIconQuery', () => {
  it('gives an empty string when nothing differs from the defaults', () => {
    expect(toIconQuery(PAGE, PAGE)).toBe('')
    expect(toIconQuery({ ...PAGE, colour: null }, { ...PAGE, colour: '#E5484D' })).toBe('')
  })

  it('writes only the keys that differ', () => {
    expect(toIconQuery({ ...PAGE, size: 40 }, PAGE)).toBe('?size=40')
    expect(toIconQuery({ ...PAGE, absolute: false }, PAGE)).toBe('?abs=0')
    expect(toIconQuery({ ...PAGE, strokeWidth: 1.25 }, PAGE)).toBe('?stroke=1.25')
    expect(toIconQuery({ ...PAGE, colour: '#3E7BFA' }, PAGE)).toBe('?colour=%233E7BFA')
    expect(toIconQuery({ style: 'solid-duotone', size: 48, strokeWidth: 1.5, absolute: false, colour: '#E5484D' }, PAGE)).toBe(
      '?style=solid-duotone&size=48&stroke=1.5&abs=0&colour=%23E5484D',
    )
  })
})

describe('fromIconQuery', () => {
  it('round trips every setting', () => {
    const settings: IconSettings = { style: 'duotone', size: 64, strokeWidth: 2.75, absolute: false, colour: '#8E5BD9' }
    expect(fromIconQuery(toIconQuery(settings, PAGE))).toEqual(settings)
    expect(fromIconQuery(toIconQuery({ ...PAGE, absolute: true }, { ...PAGE, absolute: false }))).toEqual({ absolute: true })
    expect(fromIconQuery('')).toEqual({})
  })

  it('reads a query with or without the leading ?', () => {
    expect(fromIconQuery('size=32')).toEqual({ size: 32 })
    expect(fromIconQuery('?size=32')).toEqual({ size: 32 })
  })

  it('drops an unknown style', () => {
    expect(fromIconQuery('?style=outline')).toEqual({})
    expect(fromIconQuery('?style=LINE')).toEqual({})
  })

  it('clamps the size to 16..96 and snaps it to 4px steps', () => {
    expect(fromIconQuery('?size=4')).toEqual({ size: 16 })
    expect(fromIconQuery('?size=500')).toEqual({ size: 96 })
    expect(fromIconQuery('?size=-20')).toEqual({ size: 16 })
    expect(fromIconQuery('?size=33')).toEqual({ size: 32 })
    expect(fromIconQuery('?size=35.5')).toEqual({ size: 36 })
  })

  it('clamps the stroke to 1..3 and snaps it to 0.25', () => {
    expect(fromIconQuery('?stroke=0')).toEqual({ strokeWidth: 1 })
    expect(fromIconQuery('?stroke=9')).toEqual({ strokeWidth: 3 })
    expect(fromIconQuery('?stroke=1.3')).toEqual({ strokeWidth: 1.25 })
    expect(fromIconQuery('?stroke=1.4')).toEqual({ strokeWidth: 1.5 })
  })

  it('drops numbers that are not numbers', () => {
    expect(fromIconQuery('?size=&stroke=')).toEqual({})
    expect(fromIconQuery('?size=big&stroke=thin')).toEqual({})
    expect(fromIconQuery('?size=Infinity&stroke=NaN')).toEqual({})
    expect(fromIconQuery('?size=%20')).toEqual({})
  })

  it('takes abs only as 0 or 1', () => {
    expect(fromIconQuery('?abs=0')).toEqual({ absolute: false })
    expect(fromIconQuery('?abs=1')).toEqual({ absolute: true })
    expect(fromIconQuery('?abs=false')).toEqual({})
    expect(fromIconQuery('?abs=')).toEqual({})
  })

  it('takes a colour only in the picker’s form', () => {
    expect(fromIconQuery('?colour=%23E5484D')).toEqual({ colour: '#E5484D' })
    expect(fromIconQuery('?colour=E5484D')).toEqual({})
    expect(fromIconQuery('?colour=%23e5484d')).toEqual({})
    expect(fromIconQuery('?colour=%23ABC')).toEqual({})
    expect(fromIconQuery('?colour=red')).toEqual({})
    expect(fromIconQuery('?colour=%23E5484D;background:url(x)')).toEqual({})
  })

  it('never throws on garbage', () => {
    for (const search of ['?%', '?%E0%A4%A', '?=&&==', '?size=%%%', '#size=40', '?style=%00', '???', '?colour=%FF']) {
      expect(() => fromIconQuery(search)).not.toThrow()
    }
    expect(fromIconQuery('?%E0%A4%A&size=40&style=nope')).toEqual({ size: 40 })
  })
})
