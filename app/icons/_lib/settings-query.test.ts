import { describe, it, expect } from 'vitest'
import { fromIconQuery, toIconQuery, type IconSettings } from './settings-query'

const PAGE: IconSettings = { style: 'line', size: 24, weight: 'regular', colour: null }

describe('toIconQuery', () => {
  it('gives an empty string when nothing differs from the defaults', () => {
    expect(toIconQuery(PAGE, PAGE)).toBe('')
    expect(toIconQuery({ ...PAGE, colour: null }, { ...PAGE, colour: '#E5484D' })).toBe('')
  })

  it('writes only the keys that differ', () => {
    expect(toIconQuery({ ...PAGE, size: 40 }, PAGE)).toBe('?size=40')
    expect(toIconQuery({ ...PAGE, weight: 'bold' }, PAGE)).toBe('?weight=bold')
    expect(toIconQuery({ ...PAGE, colour: '#3E7BFA' }, PAGE)).toBe('?colour=%233E7BFA')
    expect(toIconQuery({ style: 'solid-duotone', size: 48, weight: 'thin', colour: '#E5484D' }, PAGE)).toBe(
      '?style=solid-duotone&size=48&weight=thin&colour=%23E5484D',
    )
  })
})

describe('fromIconQuery', () => {
  it('round trips every setting', () => {
    const settings: IconSettings = { style: 'duotone', size: 64, weight: 'light', colour: '#8E5BD9' }
    expect(fromIconQuery(toIconQuery(settings, PAGE))).toEqual(settings)
    expect(fromIconQuery(toIconQuery({ ...PAGE, weight: 'regular' }, { ...PAGE, weight: 'bold' }))).toEqual({ weight: 'regular' })
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

  it('takes a weight only as one of the four ids', () => {
    for (const weight of ['thin', 'light', 'regular', 'bold', 'extrabold'] as const) {
      expect(fromIconQuery(`?weight=${weight}`)).toEqual({ weight })
    }
    expect(fromIconQuery('?weight=Bold')).toEqual({})
    expect(fromIconQuery('?weight=heavy')).toEqual({})
    expect(fromIconQuery('?weight=2')).toEqual({})
    expect(fromIconQuery('?weight=')).toEqual({})
  })

  it('drops numbers that are not numbers', () => {
    expect(fromIconQuery('?size=')).toEqual({})
    expect(fromIconQuery('?size=big')).toEqual({})
    expect(fromIconQuery('?size=Infinity')).toEqual({})
    expect(fromIconQuery('?size=NaN')).toEqual({})
    expect(fromIconQuery('?size=%20')).toEqual({})
  })

  it('ignores the old stroke and abs keys, so an old link falls back to the default weight', () => {
    expect(fromIconQuery('?stroke=2&abs=0')).toEqual({})
    expect(fromIconQuery('?size=40&stroke=1.25&abs=1')).toEqual({ size: 40 })
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
