import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Every design-system page draws its column, eyebrow, title and lead from the
// one frame in DesignSystemPage.tsx. Before this these ten pages carried five
// different hand-rolled containers, from max-w-4xl to an inline 1180px, so
// walking the sidebar moved the text column on almost every click. A new page
// belongs on this list; a page that drops the frame fails here.

const ROOT = join(__dirname, '..', '..')

const PAGES = [
  'app/design-systems/andromeda-pro/overview-b/OverviewB.tsx',
  'app/design-systems/andromeda-pro/foundation/FoundationView.tsx',
  'app/design-systems/andromeda-pro/system/AndromedaGallery.tsx',
  'app/design-systems/andromeda-pro/image-pack/page.tsx',
  'app/design-systems/andromeda-pro/brain/BrainStoryV4.tsx',
  'app/design-systems/andromeda-pro/[component]/AndromedaComponentView.tsx',
  'app/design-systems/andromeda/AndromedaOverview.tsx',
  'app/design-systems/andromeda/system/AndromedaShowcase.tsx',
  'app/design-systems/andromeda/brain/BrainStoryV4.tsx',
  'app/design-systems/andromeda/[component]/AndromedaComponentView.tsx',
]

const read = (p: string) => readFileSync(join(ROOT, p), 'utf8')

describe('design-system page frame', () => {
  it.each(PAGES)('%s imports the shared frame', (page) => {
    // Either import style the pages already use: relative, or the @/app alias.
    expect(read(page)).toMatch(/from '(?:(?:\.\.\/)+|@\/app\/)_components\/DesignSystemPage'/)
  })

  // The widths the ten pages used to disagree on. A demo, chart or card inside
  // a section may still set its own width; what may not come back is a second
  // page column.
  it.each(PAGES)('%s keeps no page column of its own', (page) => {
    const src = read(page)
    expect(src).not.toMatch(/max-w-4xl|max-w-6xl|max-w-7xl/)
    expect(src).not.toMatch(/maxWidth: '1180px'|maxWidth: 896/)
  })

  it('the frame is one column width for all of them', () => {
    expect(read('app/_components/DesignSystemPage.tsx')).toContain('mx-auto w-full max-w-5xl px-4 sm:px-6')
  })
})
