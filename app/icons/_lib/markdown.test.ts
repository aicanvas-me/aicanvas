import { describe, it, expect } from 'vitest'
import { iconMarkdown } from './markdown'
import type { IconMeta } from './types'

const icon: IconMeta = { name: 'arrow-up', category: 'arrows', tags: ['up'], added: '2026-10-01', isNew: false }

describe('iconMarkdown', () => {
  it('prints the Added date when it is known', () => {
    expect(iconMarkdown(icon, '<svg />')).toContain('- Added: Oct 1, 2026\n- Tags: up')
  })

  it('leaves the Added line out when the date is unknown', () => {
    const md = iconMarkdown({ ...icon, added: null }, '<svg />')
    expect(md).not.toContain('Added')
    expect(md).toContain('- Styles: 4\n- Tags: up')
  })
})
