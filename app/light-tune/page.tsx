'use client'

import { useMemo, useState } from 'react'

/**
 * Light-theme tuner. Dev only.
 *
 * The light half of the site is a set of ROLES (page, card, border, text,
 * accent) each pinned to one step of the sand or olive ramp. Every role below
 * is a slider over the real ramp, the mock repaints live, and the contrast
 * column says whether the combination is actually readable rather than merely
 * plausible. Pick a mapping here and it gets applied across the chrome in one
 * pass; nothing on this page ships.
 */

const SAND = [
  ['50', '#F4F4FA'], ['100', '#EEEEF3'], ['200', '#DFDFE3'], ['300', '#CACACD'],
  ['400', '#9B9B9E'], ['500', '#7B7B7D'], ['600', '#575759'], ['700', '#373738'],
  ['800', '#2D2D2E'], ['900', '#1B1B1C'], ['950', '#0E0E0F'],
] as const

const OLIVE = [['400', '#DAE4A0'], ['500', '#A8B94D'], ['600', '#869631'], ['700', '#56631F'], ['800', '#4A551A']] as const

type Roles = {
  page: number; card: number; raised: number; border: number; borderStrong: number
  textPrimary: number; textBody: number; textMuted: number; accent: number
}

// Change-isolating presets. "Airy" is what the chrome actually ships, so opening
// this page shows the live palette. "Declared" is what CLAUDE.md claimed the
// light theme was for months; it is kept only as the failing baseline to
// compare against.
const PRESETS: Record<string, Roles> = {
  Declared:  { page: 2, card: 1, raised: 0, border: 3, borderStrong: 4, textPrimary: 9, textBody: 6, textMuted: 5, accent: 1 },
  Airy:      { page: 1, card: 0, raised: 0, border: 2, borderStrong: 3, textPrimary: 9, textBody: 7, textMuted: 6, accent: 3 },
  Paper:     { page: 0, card: 0, raised: 0, border: 2, borderStrong: 3, textPrimary: 9, textBody: 6, textMuted: 5, accent: 3 },
  Contrast:  { page: 1, card: 0, raised: 0, border: 3, borderStrong: 4, textPrimary: 10, textBody: 7, textMuted: 6, accent: 4 },
}

function lin(c: number) { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
function lum(hex: string) {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
function ratio(a: string, b: string) {
  const [x, y] = [lum(a), lum(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

function Row({
  label, value, onChange, ramp, hint,
}: { label: string; value: number; onChange: (n: number) => void; ramp: readonly (readonly [string, string])[]; hint: string }) {
  const [step, hex] = ramp[value]
  return (
    <label style={{ display: 'grid', gap: 4, padding: '10px 0', borderBottom: '1px solid #2D2D2E' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
        <span style={{ width: 14, height: 14, borderRadius: 3, background: hex, border: '1px solid #57575980', flex: 'none' }} />
        {label}
        <code style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.7 }}>
          {ramp === SAND ? 'sand' : 'olive'}-{step} {hex}
        </code>
      </span>
      <input
        type="range" min={0} max={ramp.length - 1} step={1} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: '#A8B94D' }}
      />
      <span style={{ fontSize: 11, opacity: 0.55 }}>{hint}</span>
    </label>
  )
}

export default function LightTunePage() {
  const [r, setR] = useState<Roles>(PRESETS.Airy)
  const set = (k: keyof Roles) => (n: number) => setR((prev) => ({ ...prev, [k]: n }))

  const c = useMemo(() => ({
    page: SAND[r.page][1], card: SAND[r.card][1], raised: SAND[r.raised][1],
    border: SAND[r.border][1], borderStrong: SAND[r.borderStrong][1],
    textPrimary: SAND[r.textPrimary][1], textBody: SAND[r.textBody][1],
    textMuted: SAND[r.textMuted][1], accent: OLIVE[r.accent][1],
  }), [r])

  // Every pairing that has to hold for the theme to be usable. 4.5 is the body
  // text bar, 3.0 the bar for large text and for anything that is a control
  // rather than decoration.
  const checks: [string, number, number][] = [
    ['primary text on page', ratio(c.textPrimary, c.page), 4.5],
    ['primary text on card', ratio(c.textPrimary, c.card), 4.5],
    ['body text on page', ratio(c.textBody, c.page), 4.5],
    ['body text on card', ratio(c.textBody, c.card), 4.5],
    ['muted text on card', ratio(c.textMuted, c.card), 3],
    ['accent text on page', ratio(c.accent, c.page), 4.5],
    ['accent text on card', ratio(c.accent, c.card), 4.5],
    ['card against page', ratio(c.card, c.page), 1.1],
    ['border against page', ratio(c.border, c.page), 1.3],
    ['olive fill vs its own label', ratio('#A8B94D', '#0E0E0F'), 4.5],
  ]
  const failing = checks.filter(([, v, min]) => v < min).length

  const mapping = [
    `page background   bg-sand-${SAND[r.page][0]}`,
    `card surface      bg-sand-${SAND[r.card][0]}`,
    `raised surface    bg-sand-${SAND[r.raised][0]}`,
    `border            border-sand-${SAND[r.border][0]}`,
    `border strong     border-sand-${SAND[r.borderStrong][0]}`,
    `primary text      text-sand-${SAND[r.textPrimary][0]}`,
    `body text         text-sand-${SAND[r.textBody][0]}`,
    `muted text        text-sand-${SAND[r.textMuted][0]}`,
    `accent text       text-olive-${OLIVE[r.accent][0]}`,
  ].join('\n')

  return (
    <div style={{ display: 'flex', minHeight: '100%', fontFamily: 'var(--font-manrope), sans-serif' }}>
      {/* ── The mock. Everything here paints from the roles above, so moving a
             slider shows the real consequence instead of a swatch. ── */}
      <div style={{ flex: 1, background: c.page, color: c.textBody, padding: 32, display: 'grid', gap: 24, alignContent: 'start' }}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          <nav style={{ width: 190, flex: 'none', background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: 10, display: 'grid', gap: 2 }}>
            {['Components', 'Design Systems', 'Pricing', 'About', 'FAQ'].map((n, i) => (
              <span key={n} style={{
                padding: '7px 9px', borderRadius: 7, fontSize: 13, fontWeight: 600,
                background: i === 0 ? c.raised : 'transparent',
                color: i === 0 ? c.textPrimary : c.textBody,
              }}>{n}</span>
            ))}
          </nav>

          <div style={{ flex: 1, display: 'grid', gap: 18 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, color: c.textPrimary, letterSpacing: '-0.02em' }}>
                Components that ship with their prompt
              </h1>
              <p style={{ margin: '8px 0 0', fontSize: 15, color: c.textBody, maxWidth: 560 }}>
                Body copy at the size it actually runs. If this row is hard to read on the
                surface behind it, the mapping is wrong no matter how the swatches look.
              </p>
              <p style={{ margin: '10px 0 0', fontSize: 13, color: c.textMuted }}>
                Muted line: metadata, counts, timestamps, helper text under a field.
              </p>
              <p style={{ margin: '10px 0 0', fontSize: 15 }}>
                A sentence with <a style={{ color: c.accent, fontWeight: 700 }}>an accent link inside it</a> — the
                pairing that fails hardest when the accent is too pale for the page.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button style={{ background: '#A8B94D', color: '#0E0E0F', border: 0, borderRadius: 9, padding: '9px 15px', fontSize: 14, fontWeight: 600 }}>
                Get the prompt
              </button>
              <button style={{ background: 'transparent', color: c.textPrimary, border: `1px solid ${c.borderStrong}`, borderRadius: 9, padding: '9px 15px', fontSize: 14, fontWeight: 600 }}>
                Browse all
              </button>
              <span style={{ border: `1px solid ${c.border}`, color: c.textBody, borderRadius: 999, padding: '4px 11px', fontSize: 12, fontWeight: 600 }}>
                Free
              </span>
              <span style={{ background: '#A8B94D', color: '#0E0E0F', borderRadius: 999, padding: '4px 11px', fontSize: 12, fontWeight: 700 }}>
                Premium
              </span>
              <input
                placeholder="Search components"
                style={{ background: c.raised, color: c.textPrimary, border: `1px solid ${c.border}`, borderRadius: 9, padding: '9px 12px', fontSize: 14, minWidth: 200 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 14 }}>
              {['Fluid hero', 'Diamond grid', 'Task cards'].map((n) => (
                <div key={n} style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, overflow: 'hidden' }}>
                  {/* The preview stage stays sand-950 in both themes. It is the
                      one surface that must NOT follow the page. */}
                  <div style={{ height: 96, background: '#0E0E0F' }} />
                  <div style={{ padding: 11 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c.textPrimary }}>{n}</div>
                    <div style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>Hero · React</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Code slabs stay dark in both themes, so this is here to check the
                seam where a dark slab meets the light page, not to be tuned. */}
            <div style={{ background: '#0E0E0F', border: `1px solid ${c.border}`, borderRadius: 12, padding: 14, fontFamily: 'var(--font-geist-mono), monospace', fontSize: 13, color: '#E3E3E8' }}>
              <span style={{ color: '#7B7B7D' }}>$</span> npx aicanvas add fluid-hero
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <aside style={{ width: 340, flex: 'none', background: '#0E0E0F', color: '#E3E3E8', padding: 20, overflowY: 'auto', borderLeft: '1px solid #2D2D2E' }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>Light theme tuner</h2>
        <p style={{ margin: '0 0 14px', fontSize: 12, opacity: 0.6 }}>Dev only. Nothing here ships.</p>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {Object.keys(PRESETS).map((k) => (
            <button key={k} onClick={() => setR(PRESETS[k])}
              style={{ background: '#1B1B1C', color: '#E3E3E8', border: '1px solid #373738', borderRadius: 7, padding: '5px 10px', fontSize: 12, fontWeight: 600 }}>
              {k}
            </button>
          ))}
        </div>

        <Row label="Page background" value={r.page} onChange={set('page')} ramp={SAND} hint="The surface everything else sits on" />
        <Row label="Card surface" value={r.card} onChange={set('card')} ramp={SAND} hint="Component cards, panels, the nav rail" />
        <Row label="Raised surface" value={r.raised} onChange={set('raised')} ramp={SAND} hint="Menus, inputs, the active nav row" />
        <Row label="Border" value={r.border} onChange={set('border')} ramp={SAND} hint="Hairlines and dividers" />
        <Row label="Border strong" value={r.borderStrong} onChange={set('borderStrong')} ramp={SAND} hint="Outline buttons, hover borders" />
        <Row label="Primary text" value={r.textPrimary} onChange={set('textPrimary')} ramp={SAND} hint="Headings and anything that must be read first" />
        <Row label="Body text" value={r.textBody} onChange={set('textBody')} ramp={SAND} hint="Paragraphs, descriptions" />
        <Row label="Muted text" value={r.textMuted} onChange={set('textMuted')} ramp={SAND} hint="Metadata, helper lines" />
        <Row label="Accent text" value={r.accent} onChange={set('accent')} ramp={OLIVE} hint="Links and highlights. The fill stays olive-500 either way" />

        <h3 style={{ margin: '18px 0 6px', fontSize: 13, fontWeight: 700 }}>
          Contrast {failing === 0 ? '· all clear' : `· ${failing} failing`}
        </h3>
        <div style={{ display: 'grid', gap: 3, fontSize: 11.5 }}>
          {checks.map(([label, v, min]) => (
            <div key={label} style={{ display: 'flex', gap: 8, color: v >= min ? '#A8B94D' : '#FFB574' }}>
              <span style={{ flex: 1, opacity: 0.85 }}>{label}</span>
              <code>{v.toFixed(2)}</code>
              <span style={{ width: 34, textAlign: 'right', opacity: 0.7 }}>{v >= min ? 'pass' : `<${min}`}</span>
            </div>
          ))}
        </div>

        <h3 style={{ margin: '18px 0 6px', fontSize: 13, fontWeight: 700 }}>Mapping</h3>
        <pre style={{ margin: 0, background: '#1B1B1C', border: '1px solid #2D2D2E', borderRadius: 8, padding: 10, fontSize: 11, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {mapping}
        </pre>
        <button
          onClick={() => navigator.clipboard.writeText(mapping)}
          style={{ marginTop: 8, width: '100%', background: '#A8B94D', color: '#0E0E0F', border: 0, borderRadius: 8, padding: '8px 0', fontSize: 13, fontWeight: 700 }}>
          Copy mapping
        </button>
      </aside>
    </div>
  )
}
