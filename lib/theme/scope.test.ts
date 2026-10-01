import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// The site theme and a component preview's theme are LINKED:
// flipping the site moves every preview, and flipping a preview moves the site,
// as the template pages always did. What must stay true is that there is ONE
// writer. The first site toggle shipped in 5b4ef1a and was deleted in 12a8897
// because it and the per-component toggles each wrote the `dark` class on
// <html> themselves; the link now runs through ThemeProvider.setTheme instead.
//
// Nothing about that is enforced by types, and it is one careless line away
// from coming back. These are the lines that would let it.

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
      .filter((f) => {
        const src = readFileSync(f, 'utf8')
        // Two reviewed files hold <html> in a variable to set theme VARS on it,
        // so they are exempt from the alias pattern ONLY; the class and cookie
        // patterns still apply to them, because the Pro wrap now hands
        // ThemeProvider's setTheme to every Pro toggle and a direct write there
        // would be the two-writers bug again.
        // - AndromedaThemeSync: the frame mirror sets [data-frame-light] on the
        //   frame document's root.
        // - AndromedaThemeWrap: writes Andromeda Pro's `--at-*` custom properties
        //   on the root (sand chrome reads no --at- var). The root is where they
        //   have to land: the canvas components (Burst, Cube, Orb, Nodes, Planet, the
        //   city map) and useResolvedVars re-resolve their ink by observing the
        //   root, and the Drawer, PanelMenu and Tooltip portal to <body>, which
        //   inherits from the root and not from a mid-tree wrapper. Scoping the
        //   set to the wrapper was tried and reverted: it left every portalled
        //   surface resolving the dark fallback in light theme.
        const aliasExempt = /(AndromedaThemeSync|AndromedaThemeWrap)\.tsx$/.test(f)
        // Writing the class on <html>, or writing the cookie the server reads.
        // The alias pattern closes the two-line variant (`const root =
        // document.documentElement; root.classList.toggle('dark', …)`) that
        // the literal chain above cannot see.
        return /documentElement\.classList\.(add|remove|toggle)\(\s*['"`]dark/.test(src)
          || /document\.cookie\s*=\s*[`'"]theme=/.test(src)
          || (!aliasExempt && /=\s*(?:window\.(?:parent\.)?)?document\.documentElement\b/.test(src))
          // The two exempt files hold <html> in a variable, so the literal chain
          // above cannot see a class write through it. Match any receiver there.
          || (aliasExempt && /\.classList\.(add|remove|toggle)\(\s*['"`]dark/.test(src))
      })
      .map((f) => f.slice(root.length + 1))

    expect(
      offenders,
      'These files write the SITE theme. Only app/components/ThemeProvider.tsx may. '
        + 'A preview toggle calls ThemeProvider.setTheme and must never reach <html> itself.',
    ).toEqual([])
  })

  it('preview toggles move the site theme through ThemeProvider, not local state', () => {
    const view = readFileSync(join(root, 'app', 'components', '[slug]', 'ComponentPageView.tsx'), 'utf8')
    expect(view).toMatch(/setTheme: setSiteTheme \} = useTheme\(\)/)
    expect(view).not.toContain('themeOverride')

    const wrap = readFileSync(
      join(root, 'app', 'design-systems', 'andromeda-pro', 'AndromedaThemeWrap.tsx'),
      'utf8',
    )
    expect(wrap).toMatch(/theme: siteTheme, setTheme \} = useTheme\(\)/)
    expect(wrap).not.toMatch(/useState<AndromedaTheme>\(/)
  })

  it('a live-canvas preview opts out of the root cross-fade the wrap would trigger', () => {
    // A preview toggle now runs ThemeProvider.setTheme, whose view transition
    // double-images animating canvases. The Pro wrap has no [data-card-theme],
    // so it marks itself, and ThemeProvider has to look for that mark.
    const provider = readFileSync(join(root, 'app', 'components', 'ThemeProvider.tsx'), 'utf8')
    const wrap = readFileSync(
      join(root, 'app', 'design-systems', 'andromeda-pro', 'AndromedaThemeWrap.tsx'),
      'utf8',
    )
    expect(provider).toContain('[data-theme-instant]')
    expect(wrap).toContain('data-theme-instant')
  })
})
