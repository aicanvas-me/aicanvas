import { describe, it, expect } from 'vitest'
import { iconMarkdown } from './markdown'
import type { IconMeta } from './types'

const icon: IconMeta = { name: 'arrow-up', category: 'arrows', tags: ['up'], added: '2026-10-01', isNew: false }
const line = { style: 'line', size: 48, weight: 'regular', colour: null } as const

describe('iconMarkdown', () => {
  it('has no Added date', () => {
    const md = iconMarkdown(icon, '<svg />', line, false)
    expect(md).not.toContain('Added')
    expect(md).toContain('- Styles: 4\n- Tags: up')
  })

  it('uses the picked size, weight and colour', () => {
    const md = iconMarkdown(icon, '<svg />', { ...line, size: 64, weight: 'light', colour: '#EA4747' }, false)
    expect(md).toContain('<ArrowUp size={64} weight="light" color="#EA4747" />')
  })

  it('names the picked paid style and leaves its SVG to Premium', () => {
    const md = iconMarkdown(icon, null, { ...line, style: 'solid' }, false)
    expect(md).toContain('@aicanvas/icon-arrow-up-solid')
    expect(md).toContain("import { ArrowUpSolid } from '@/components/icons/arrow-up-solid'")
    expect(md).toContain('Requires Premium.')
    expect(md).toContain('The SVG of this style comes with AI Canvas Premium.')
  })

  it('says a free install needs an account only while the gate is on', () => {
    expect(iconMarkdown(icon, '<svg />', line, true)).toContain('Needs a free AI Canvas account.')
    expect(iconMarkdown(icon, '<svg />', line, false)).not.toContain('Needs a free AI Canvas account.')
  })
})
