import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// One rail, rendered once. Before this, four call sites mounted `<Sidebar>` —
// the root layout plus three design-system / ideation layouts each rendering
// their own `embedded` copy — so crossing between those route spaces unmounted
// one rail and mounted another, flashing and losing scroll and open/closed
// state. This is the contract that keeps it from creeping back: the root
// layout is the only render site, the `embedded` prop is gone, the hide check
// has let go of '/design-systems' and '/ideation', and the layouts that used to
// render their own copy still own their scroll column.

const root = join(__dirname, '..', '..')

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name.startsWith('.')) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.tsx$/.test(name)) out.push(full)
  }
  return out
}

describe('sidebar single-instance contract', () => {
  it('only app/layout.tsx renders a <Sidebar>', () => {
    const offenders = walk(join(root, 'app'))
      .filter((f) => /<Sidebar[ />]/.test(readFileSync(f, 'utf8')))
      .map((f) => f.slice(root.length + 1))

    expect(offenders).toEqual(['app/layout.tsx'])
  })

  it('the embedded prop is gone', () => {
    const src = readFileSync(join(root, 'app', 'components', 'Sidebar.tsx'), 'utf8')
    expect(src).not.toContain('embedded')
  })

  it('the hide check covers only /lab and template leaves', () => {
    const src = readFileSync(join(root, 'app', 'components', 'Sidebar.tsx'), 'utf8')
    // Read the hide check itself, not the whole file: `onDesignSystems` still
    // tests the same prefix, and it legitimately does — it is what opens the
    // right pole for the route. Only the HIDE check must have let go of it.
    const check = /const hideSidebar\s*=([\s\S]*?)\n  const /.exec(src)?.[1] ?? ''
    expect(check).not.toBe('')
    expect(check).not.toContain('/design-systems')
    expect(check).not.toContain('/ideation')
    expect(check).toContain("startsWith('/lab')")
    expect(check).toContain('TEMPLATE_LEAF_RE.test')
  })

  it('the ex-embedded layouts still own their scroll column', () => {
    const layouts = [
      'app/design-systems/andromeda-pro/layout.tsx',
      'app/design-systems/andromeda/layout.tsx',
      'app/ideation/layout.tsx',
    ]
    for (const layout of layouts) {
      const src = readFileSync(join(root, layout), 'utf8')
      expect(src, `${layout} should still carry data-owns-scroll`).toContain('data-owns-scroll')
    }
  })
})
