import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// ─── Color scales, read from the live token source ──────────────────────────
// Hex values come from app/globals.css (@theme) at build time, so this internal
// reference can never drift from what the site actually renders. Only the usage
// notes below are editorial. This is why the page is a server component.

type Swatch = { token: string; hex: string; usage: string }

function readScale(prefix: string): { token: string; hex: string }[] {
  const css = readFileSync(join(process.cwd(), 'app', 'globals.css'), 'utf8')
  const re = new RegExp(`--color-${prefix}-(\\d+):\\s*(#[0-9A-Fa-f]{3,8})`, 'g')
  const out: { token: string; hex: string }[] = []
  for (let m = re.exec(css); m; m = re.exec(css)) {
    out.push({ token: `${prefix}-${m[1]}`, hex: m[2].toUpperCase() })
  }
  return out.sort((a, b) => Number(a.token.split('-')[1]) - Number(b.token.split('-')[1]))
}

const SAND_USAGE: Record<string, string> = {
  'sand-50': 'Page background (light)',
  'sand-100': 'Card background (light), input fills',
  'sand-200': 'Code and install slabs (light)',
  'sand-300': 'Borders (light), dividers',
  'sand-400': 'Muted borders, placeholder icons',
  'sand-500': 'Secondary text (light)',
  'sand-600': 'Body text (light)',
  'sand-700': 'UI labels, buttons (light)',
  'sand-800': 'Card background (dark)',
  'sand-900': 'Page background (dark)',
  'sand-950': 'Deepest dark, preview background',
}

const OLIVE_USAGE: Record<string, string> = {
  'olive-400': 'Hover accent, gradient end',
  'olive-500': 'Primary accent: buttons, badges, logo',
  'olive-600': 'Light-mode accent text, pressed state',
  'olive-700': 'Selection highlight',
  'olive-800': 'Light-mode accent hover',
}

const EMBER_USAGE: Record<string, string> = {
  'ember-400': 'Hover / lighter state',
  'ember-500': 'Secondary accent: attention, rhythm',
  'ember-600': 'Pressed or darker state',
}

const CYAN_USAGE: Record<string, string> = {
  'cyan-400': 'Light stop — dark-mode text',
  'cyan-500': 'Complementary accent, used sparingly (e.g. the Updated badge)',
  'cyan-600': 'Dark stop — light-mode text',
}

const withUsage = (
  scale: { token: string; hex: string }[],
  usage: Record<string, string>,
): Swatch[] => scale.map((c) => ({ ...c, usage: usage[c.token] ?? '' }))

const SAND_SCALE = withUsage(readScale('sand'), SAND_USAGE)
const OLIVE_SCALE = withUsage(readScale('olive'), OLIVE_USAGE)
const EMBER_SCALE = withUsage(readScale('ember'), EMBER_USAGE)
const CYAN_SCALE = withUsage(readScale('cyan'), CYAN_USAGE)

// ─── Typography ──────────────────────────────────────────────────────────────

const TYPOGRAPHY = [
  { weight: 800, name: 'Extra Bold', usage: 'Hero h1', sample: 'AI Canvas' },
  { weight: 700, name: 'Bold', usage: 'Section headings', sample: 'Components' },
  { weight: 600, name: 'Semi Bold', usage: 'UI labels, buttons', sample: 'View Component' },
  { weight: 400, name: 'Regular', usage: 'Body text, descriptions', sample: 'Beautiful animated components with AI prompts.' },
]

// ─── Semantic mappings ───────────────────────────────────────────────────────

const SEMANTIC_ROLES = [
  { role: 'Page background', light: 'bg-sand-50', dark: 'bg-sand-950' },
  { role: 'Card / surface', light: 'bg-sand-100', dark: 'bg-sand-900' },
  { role: 'Elevated (navbar)', light: 'bg-sand-50/90', dark: 'bg-sand-950/90' },
  { role: 'Primary text', light: 'text-sand-900', dark: 'text-sand-50' },
  { role: 'Body text', light: 'text-sand-700', dark: 'text-sand-300' },
  { role: 'Secondary text', light: 'text-sand-600', dark: 'text-sand-400' },
  { role: 'Border default', light: 'border-sand-200', dark: 'border-sand-800' },
  { role: 'Border hover', light: 'border-sand-300', dark: 'border-sand-700' },
  { role: 'Accent', light: 'text-olive-600', dark: 'text-olive-400' },
  { role: 'Accent hover', light: 'text-olive-800', dark: 'text-olive-300' },
  { role: 'Secondary accent', light: 'text-ember-500', dark: 'text-ember-400' },
  { role: 'Highlight (occasional)', light: 'text-cyan-600', dark: 'text-cyan-400' },
]

// ─── Spacing scale ───────────────────────────────────────────────────────────

const SPACING = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64]

// ─── Radius ──────────────────────────────────────────────────────────────────

const RADII = [
  { name: 'sm', value: '6px' },
  { name: 'md', value: '8px' },
  { name: 'lg', value: '12px' },
  { name: 'xl', value: '16px' },
  { name: '2xl', value: '24px' },
  { name: '3xl', value: '32px' },
  { name: 'full', value: '9999px' },
]

// ─── Component ───────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 text-2xl font-bold text-sand-900 dark:text-sand-50">
      {children}
    </h2>
  )
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-lg font-semibold text-sand-700 dark:text-sand-300">
      {children}
    </h3>
  )
}

function ColorSwatch({ hex, token, usage }: Swatch) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="h-12 w-12 shrink-0 rounded-xl border border-sand-200 dark:border-sand-700"
        style={{ background: hex }}
      />
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm font-semibold text-sand-900 dark:text-sand-100">{token}</span>
          <span className="font-mono text-xs text-sand-600 dark:text-sand-500">{hex}</span>
        </div>
        <p className="text-xs text-sand-600 dark:text-sand-400">{usage}</p>
      </div>
    </div>
  )
}

export default function DesignSystemPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8">
      {/* Header */}
      <div className="mb-16">
        <h1 className="mb-3 text-4xl font-extrabold text-sand-900 dark:text-sand-50">
          Design System
        </h1>
        <p className="max-w-2xl text-lg text-sand-600 dark:text-sand-400">
          AI Canvas global design tokens: colors, typography, spacing, and semantic mappings used across the entire website. Hex values are read live from <code className="rounded bg-sand-100 px-1.5 py-0.5 font-mono text-sm dark:bg-sand-800">app/globals.css</code>, so they always match the site.
        </p>
      </div>

      {/* ── Colors ── */}
      <section className="mb-16">
        <SectionTitle>Colors</SectionTitle>

        <SubTitle>Sand scale (neutral cool gray)</SubTitle>
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SAND_SCALE.map((c) => (
            <ColorSwatch key={c.token} {...c} />
          ))}
        </div>

        <SubTitle>Olive scale (muted green accent)</SubTitle>
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OLIVE_SCALE.map((c) => (
            <ColorSwatch key={c.token} {...c} />
          ))}
        </div>

        <SubTitle>Ember scale (secondary accent)</SubTitle>
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EMBER_SCALE.map((c) => (
            <ColorSwatch key={c.token} {...c} />
          ))}
        </div>

        <SubTitle>Cyan scale (complementary accent)</SubTitle>
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CYAN_SCALE.map((c) => (
            <ColorSwatch key={c.token} {...c} />
          ))}
        </div>

        {/* Full palette strip */}
        <SubTitle>Full palette</SubTitle>
        <div className="flex overflow-hidden rounded-2xl">
          {SAND_SCALE.map((c) => (
            <div
              key={c.token}
              className="h-16 flex-1"
              style={{ background: c.hex }}
              title={`${c.token} ${c.hex}`}
            />
          ))}
          {OLIVE_SCALE.map((c) => (
            <div
              key={c.token}
              className="h-16 flex-1"
              style={{ background: c.hex }}
              title={`${c.token} ${c.hex}`}
            />
          ))}
          {EMBER_SCALE.map((c) => (
            <div
              key={c.token}
              className="h-16 flex-1"
              style={{ background: c.hex }}
              title={`${c.token} ${c.hex}`}
            />
          ))}
          {CYAN_SCALE.map((c) => (
            <div
              key={c.token}
              className="h-16 flex-1"
              style={{ background: c.hex }}
              title={`${c.token} ${c.hex}`}
            />
          ))}
        </div>
      </section>

      {/* ── Semantic Mappings ── */}
      <section className="mb-16">
        <SectionTitle>Semantic Mappings</SectionTitle>
        <div className="overflow-hidden rounded-2xl border border-sand-200 dark:border-sand-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-sand-100 dark:bg-sand-900">
                <th className="px-4 py-3 text-left font-semibold text-sand-700 dark:text-sand-300">Role</th>
                <th className="px-4 py-3 text-left font-semibold text-sand-700 dark:text-sand-300">Light</th>
                <th className="px-4 py-3 text-left font-semibold text-sand-700 dark:text-sand-300">Dark</th>
              </tr>
            </thead>
            <tbody>
              {SEMANTIC_ROLES.map((row, i) => (
                <tr
                  key={row.role}
                  className={i % 2 === 0 ? 'bg-sand-100 dark:bg-sand-950' : 'bg-sand-50 dark:bg-sand-900'}
                >
                  <td className="px-4 py-3 text-sand-900 dark:text-sand-100">{row.role}</td>
                  <td className="px-4 py-3 font-mono text-xs text-sand-600 dark:text-sand-400">{row.light}</td>
                  <td className="px-4 py-3 font-mono text-xs text-sand-600 dark:text-sand-400">{row.dark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Typography ── */}
      <section className="mb-16">
        <SectionTitle>Typography</SectionTitle>
        <p className="mb-6 text-sm text-sand-600 dark:text-sand-400">
          Font: <span className="font-semibold text-sand-700 dark:text-sand-200">Manrope</span>, loaded via next/font/google and registered as <code className="rounded bg-sand-100 px-1.5 py-0.5 font-mono text-xs dark:bg-sand-800">--font-sans</code>
        </p>
        <div className="flex flex-col gap-6">
          {TYPOGRAPHY.map((t) => (
            <div
              key={t.weight}
              className="rounded-2xl border border-sand-200 p-6 dark:border-sand-800"
            >
              <div className="mb-2 flex items-baseline gap-3">
                <span className="font-mono text-xs text-olive-600 dark:text-olive-500">{t.weight}</span>
                <span className="text-sm font-semibold text-sand-700 dark:text-sand-300">{t.name}</span>
                <span className="text-xs text-sand-600 dark:text-sand-500">{t.usage}</span>
              </div>
              <p
                className="text-sand-900 dark:text-sand-50"
                style={{ fontWeight: t.weight, fontSize: t.weight >= 700 ? 28 : t.weight >= 600 ? 18 : 16 }}
              >
                {t.sample}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Spacing ── */}
      <section className="mb-16">
        <SectionTitle>Spacing</SectionTitle>
        <div className="flex flex-wrap items-end gap-4">
          {SPACING.map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div
                className="rounded-lg bg-olive-500"
                style={{ width: s, height: s }}
              />
              <span className="font-mono text-[10px] text-sand-600 dark:text-sand-500">{s}px</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Border Radius ── */}
      <section className="mb-16">
        <SectionTitle>Border Radius</SectionTitle>
        <div className="flex flex-wrap items-end gap-6">
          {RADII.map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-2">
              <div
                className="h-16 w-16 border-2 border-olive-500 bg-olive-500/10"
                style={{ borderRadius: r.value }}
              />
              <span className="font-mono text-xs font-semibold text-sand-700 dark:text-sand-300">{r.name}</span>
              <span className="font-mono text-[10px] text-sand-600 dark:text-sand-500">{r.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Brand Assets ── */}
      <section className="mb-16">
        <SectionTitle>Brand Assets</SectionTitle>
        <p className="mb-6 text-sm text-sand-600 dark:text-sand-400">
          Download the AI Canvas logo and icon. SVG scales cleanly for any size; PNG is ready to drop in. Please keep the proportions and do not recolor the mark.
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[
            { name: 'Logo', svg: '/ai-canvas-logo.svg', png: '/ai-canvas-logo.png', height: 'h-10' },
            { name: 'Icon', svg: '/ai-canvas-icon.svg', png: '/ai-canvas-icon.png', height: 'h-16' },
          ].map((asset) => (
            <div
              key={asset.name}
              className="overflow-hidden rounded-2xl border border-sand-200 dark:border-sand-800"
            >
              <div className="flex h-44 items-center justify-center bg-sand-100 dark:bg-sand-100">
                <img
                  src={asset.svg}
                  alt={`AI Canvas ${asset.name}`}
                  className={`${asset.height} w-auto`}
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-sand-200 px-5 py-4 dark:border-sand-800">
                <span className="text-sm font-semibold text-sand-900 dark:text-sand-100">{asset.name}</span>
                <div className="flex gap-2">
                  <a
                    href={asset.svg}
                    download
                    className="rounded-lg bg-olive-500 px-3.5 py-1.5 text-xs font-semibold text-sand-950 transition-colors hover:bg-olive-400"
                  >
                    SVG
                  </a>
                  <a
                    href={asset.png}
                    download
                    className="rounded-lg border border-sand-200 px-3.5 py-1.5 text-xs font-semibold text-sand-700 transition-colors hover:bg-sand-100 dark:border-sand-700 dark:text-sand-300 dark:hover:bg-sand-800"
                  >
                    PNG
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="mb-16">
        <SectionTitle>Tech Stack</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Next.js 16', detail: 'App Router' },
            { name: 'TypeScript', detail: 'Strict mode' },
            { name: 'Tailwind CSS v4', detail: '@theme inline' },
            { name: 'Motion', detail: 'All animations' },
            { name: 'Phosphor Icons', detail: 'weight="regular"' },
            { name: 'Manrope', detail: 'Primary font' },
          ].map((tech) => (
            <div
              key={tech.name}
              className="rounded-2xl border border-sand-200 px-5 py-4 dark:border-sand-800"
            >
              <p className="text-sm font-semibold text-sand-900 dark:text-sand-100">{tech.name}</p>
              <p className="text-xs text-sand-600 dark:text-sand-400">{tech.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
