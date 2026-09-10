import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// The site theme and a component preview's theme are separate scopes. That
// separation is the whole reason the site can have a light mode at all: the
// first site toggle shipped in 5b4ef1a and was deleted in 12a8897 because it
// and the per-component toggles both wrote the `dark` class on <html>, so
// flipping one preview to dark dragged the entire site with it.
//
// Nothing about that is enforced by types, and it is one careless line away
// from coming back. These are the two lines that would let it.

const root = join(__dirname, '..', '..')

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name.startsWith('.')) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.tsx?$/.test(name)) out.push(full)
  }
  return out
}

describe('theme scope contract', () => {
  it('the dark variant excludes a light preview wrapper AND its descendants', () => {
    const css = readFileSync(join(root, 'app', 'globals.css'), 'utf8')
    const variant = css.split('\n').find((l) => l.startsWith('@variant dark'))
    expect(variant, 'no @variant dark line in globals.css').toBeTruthy()

    // Site dark + preview light: the wrapper itself must drop out, not only
    // what is inside it. Dropping only the descendants leaves the wrapper
    // painting its own dark background behind a light preview.
    expect(variant).toContain('[data-card-theme="light"],')
    expect(variant).toContain('[data-card-theme="light"] *')

    // Site light + preview dark: the wrapper carries a literal `dark` class, so
    // the variant has to match a scoped .dark and not just one on <html>.
    expect(variant).toContain('.dark, .dark *')
  })

  it('only ThemeProvider writes the site theme', () => {
    const offenders = walk(join(root, 'app'))
      .filter((f) => !f.endsWith('ThemeProvider.tsx'))
      .filter((f) => !f.endsWith('.test.ts'))
      // The frame mirror writes theme VARS on the frame document's root, never
      // the dark class or the cookie; reviewed exception.
      .filter((f) => !f.endsWith('AndromedaThemeSync.tsx'))
      .filter((f) => {
        const src = readFileSync(f, 'utf8')
        // Writing the class on <html>, or writing the cookie the server reads.
        // The alias pattern closes the two-line variant (`const root =
        // document.documentElement; root.classList.toggle('dark', …)`) that
        // the literal chain above cannot see.
        return /documentElement\.classList\.(add|remove|toggle)\(\s*['"`]dark/.test(src)
          || /document\.cookie\s*=\s*[`'"]theme=/.test(src)
          || /=\s*(?:window\.(?:parent\.)?)?document\.documentElement\b/.test(src)
      })
      .map((f) => f.slice(root.length + 1))

    expect(
      offenders,
      'These files write the SITE theme. Only app/components/ThemeProvider.tsx may. '
        + 'A preview owns its own [data-card-theme] wrapper and must never reach <html>.',
    ).toEqual([])
  })
})
