import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Both of these were real failures while this was written, and both are
// invisible in a type check: the component renders null, so it fails by
// quietly doing nothing.
const root = join(__dirname, '..', '..')
const src = readFileSync(join(root, 'app/components/ScrollMemory.tsx'), 'utf8')
const layout = readFileSync(join(root, 'app/layout.tsx'), 'utf8')

describe('scroll memory', () => {
  it('is mounted by the root layout, and not inside a Suspense boundary', () => {
    expect(layout).toContain('<ScrollMemory />')
    // A boundary above it can remount it mid-navigation, which loses the
    // popstate that the restore depends on.
    expect(layout).not.toMatch(/<Suspense[^>]*>\s*(\{\/\*[\s\S]*?\*\/\}\s*)?<ScrollMemory\b/)
  })

  it('keeps the back/forward timestamp at module scope', () => {
    // In a ref it dies with the component, so Back fell through to the
    // new-page branch and scrolled the restored page to its top instead.
    expect(src).toMatch(/^let lastPop = 0$/m)
    expect(src).not.toContain('useRef')
  })

  it('never writes a position under a URL the reader has already left', () => {
    // Leaving a tall page for a short one clamps the column to zero and fires
    // a scroll event; without this the saved position becomes that zero.
    expect(src).toContain('if (key() !== url) return')
  })
})
