// ============================================================
// SELFCHECK: theme contrast
//
// Andromeda ships two palettes from one contract, so every pairing
// has to clear WCAG AA on BOTH of them. This walks the pairings the
// components actually paint and prints the ratio for each.
//
//   node --import ./design-systems/andromeda/_tools/ts-resolve.mjs \
//        design-systems/andromeda/_tools/light-contrast.selfcheck.mjs
//   (or: npm run andromeda:contrast)
//
// No dependencies, and no build step: Node strips the types out of
// tokens.ts on import; ts-resolve.mjs follows the extensionless
// imports inside components/lib. Exits 1 on failure so it can sit in
// front of any palette change. Also guards app/globals.css: the
// Andromeda light channel block there must match andromedaLightVars()
// declaration for declaration.
// ============================================================

import { tokens, light } from '../tokens.ts';

// ── Color math ───────────────────────────────────────────────────
// Everything reduces to sRGB channels 0..255 plus an alpha, so hex
// and rgb()/rgba() can be compared against each other directly.
function parse(css) {
  const s = String(css).trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].replace(/./g, (d) => d + d) : hex[1];
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
  }
  const rgb = /^rgba?\(([^)]+)\)$/i.exec(s);
  if (rgb) {
    const p = rgb[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  throw new Error(`cannot parse color: ${css}`);
}

// Source-over compositing. A translucent token is never seen on its
// own, so it is flattened onto the ground it is painted over before
// anything is measured against it.
function over(top, ground) {
  const t = parse(top);
  const g = parse(ground);
  if (t.a >= 1) return t;
  const a = t.a;
  return {
    r: t.r * a + g.r * (1 - a),
    g: t.g * a + g.g * (1 - a),
    b: t.b * a + g.b * (1 - a),
    a: 1,
  };
}

function luminance(c) {
  const ch = (v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
}

function contrast(fg, bg) {
  const a = luminance(typeof fg === 'string' ? parse(fg) : fg);
  const b = luminance(typeof bg === 'string' ? parse(bg) : bg);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

// ── The pairings ─────────────────────────────────────────────────
// AA body text is 4.5. The 3.0 floor is AA for large text and for
// non-text boundaries (a border is an outline, not a word).
const BODY = 4.5;
const LARGE = 3.0;
const FAMILIES = ['accent', 'red', 'orange'];
const GROUNDS = ['base', 'raised', 'overlay'];

function pairsFor(color) {
  const out = [];

  // Text on every ground a panel can sit on.
  for (const ground of GROUNDS) {
    for (const key of ['primary', 'secondary', 'muted', 'faint']) {
      out.push({
        what: `text.${key} on surface.${ground}`,
        ratio: contrast(color.text[key], color.surface[ground]),
        min: key === 'faint' ? LARGE : BODY,
      });
    }
  }

  for (const family of FAMILIES) {
    // The two stops components use as colored text on the page ground.
    for (const stop of [200, 300]) {
      out.push({
        what: `${family}.${stop} text on surface.base`,
        ratio: contrast(color[family][stop], color.surface.base),
        min: BODY,
      });
    }
    // The pairing token: every filled badge, tag and alert takes its
    // foreground from `on`, so this is the one that must never slip.
    out.push({
      what: `${family}.on over ${family}.500 fill`,
      ratio: contrast(color[family].on, color[family][500]),
      min: BODY,
    });
    // Tinted rows (order books, heat rows) put ordinary text over an
    // alpha wash, so the wash is flattened onto the ground first.
    const tint = over(color[family].alpha, color.surface.base);
    for (const key of ['primary', 'secondary']) {
      out.push({
        what: `text.${key} over ${family}.alpha on surface.base`,
        ratio: contrast(color.text[key], tint),
        min: BODY,
      });
    }
  }

  // The heaviest border weight has to stay visible as an outline.
  out.push({
    what: 'border.strong vs surface.base',
    ratio: contrast(color.border.strong, color.surface.base),
    min: LARGE,
  });
  // Same for the glassy edge, which is alpha over the ground.
  out.push({
    what: 'border.alpha vs surface.base',
    ratio: contrast(over(color.border.alpha, color.surface.base), color.surface.base),
    min: 1.2,
  });

  return out;
}

// ── Run ──────────────────────────────────────────────────────────
const themes = [
  ['dark', tokens.color],
  ['light', light.color],
];

let failed = 0;
const failures = [];

for (const [name, color] of themes) {
  const rows = pairsFor(color);
  const width = Math.max(...rows.map((r) => r.what.length));
  console.log(`\n${name.toUpperCase()}`);
  for (const row of rows) {
    const ok = row.ratio >= row.min;
    if (!ok) {
      failed++;
      failures.push(`${name}: ${row.what} is ${row.ratio.toFixed(2)}:1, needs ${row.min.toFixed(1)}:1`);
    }
    console.log(
      `  ${ok ? 'pass' : 'FAIL'}  ${row.what.padEnd(width)}  ${row.ratio.toFixed(2)}:1  (min ${row.min.toFixed(1)})`,
    );
  }
}

if (failed) {
  console.error(`\n${failed} pairing${failed === 1 ? '' : 's'} below the floor:`);
  for (const line of failures) console.error(`  ${line}`);
  process.exit(1);
}

// ── globals.css drift guard ─────────────────────────────────────────
// The zero-flash CSS block must stay a byte-faithful projection of
// andromedaLightVars(); a palette edit that forgets to regenerate it
// ships a light theme that disagrees with the tokens.
{
  const { andromedaLightVars } = await import('../components/lib/utils.ts');
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const here = dirname(fileURLToPath(import.meta.url));
  const css = readFileSync(join(here, '..', '..', '..', 'app', 'globals.css'), 'utf8');
  const selector = 'html:not(.dark):not([data-frame]) .andromeda-theme-scope {';
  const start = css.indexOf(selector);
  if (start === -1) {
    console.error('\nglobals.css: the Andromeda light channel block is missing.');
    process.exit(1);
  }
  const body = css.slice(start + selector.length, css.indexOf('}', start));
  const inCss = new Map(
    body.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('--'))
      .map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).replace(/;$/, '').trim()]),
  );
  const expected = andromedaLightVars();
  const drift = [];
  for (const [name, value] of Object.entries(expected)) {
    if (!inCss.has(name)) drift.push(`missing in css: ${name}`);
    else if (inCss.get(name) !== String(value)) drift.push(`differs: ${name}  css=${inCss.get(name)}  tokens=${value}`);
  }
  for (const name of inCss.keys()) {
    if (!(name in expected)) drift.push(`stray in css: ${name}`);
  }
  if (drift.length) {
    console.error(`\nglobals.css light channel drifted from the tokens (${drift.length}):`);
    for (const line of drift) console.error(`  ${line}`);
    process.exit(1);
  }
  console.log(`globals.css light channel matches andromedaLightVars() (${Object.keys(expected).length} declarations).`);
}

console.log(`\nAll pairings clear on both themes.`);
