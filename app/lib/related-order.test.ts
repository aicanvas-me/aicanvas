import { describe, expect, it } from 'vitest'
import { nextInOrder, rankRelated } from './related-order'

const list = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((slug) => ({ slug }))
const slugs = (xs: { slug: string }[]) => xs.map((x) => x.slug)

describe('nextInOrder', () => {
  it('starts after the current component', () => {
    expect(slugs(nextInOrder(list, 'e')).slice(0, 3)).toEqual(['f', 'g', 'h'])
  })
  it('wraps around at the end and never includes itself', () => {
    expect(slugs(nextInOrder(list, 'g'))).toEqual(['h', 'a', 'b', 'c', 'd', 'e', 'f'])
  })
})

describe('rankRelated', () => {
  const c = (slug: string, cat: string, extra: string[] = [], useCases: string[] = []) => ({
    slug,
    tags: [{ label: cat, accent: true }, ...extra.map((label) => ({ label }))],
    useCases,
  })
  const entry = c('me', 'Backgrounds', ['Canvas', 'Tailwind CSS'], ['Hero section'])
  const all = [
    entry,
    c('old', 'Backgrounds', ['Tailwind CSS']),
    c('new', 'Backgrounds', ['Tailwind CSS']),
    c('canvas', 'Backgrounds', ['Canvas', 'Tailwind CSS']),
    c('hero', 'Backgrounds', ['Tailwind CSS'], ['Hero section']),
    c('button', 'Buttons', ['Tailwind CSS'], ['Hero section']),
  ]
  const order = ['old', 'me', 'canvas', 'hero', 'button', 'new']

  it('keeps the same category, most related first, then newest', () => {
    expect(slugs(rankRelated(entry, all, order))).toEqual(['hero', 'canvas', 'new', 'old'])
  })
})
