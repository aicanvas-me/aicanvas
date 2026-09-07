// ============================================================
// SHARED UTILITIES
// shadcn/ui-style helpers used by all Andromeda components.
// ============================================================

import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { tokens, light } from '../../tokens';

/**
 * themed — wrap a color value in the theme channel.
 *
 * Andromeda paints from inline custom properties, and an inline
 * value is the end of the cascade: no ancestor can talk it out of a
 * baked literal. So every color leaves as
 * `var(--andromeda-theme-<name>, <literal>)` instead. With nothing
 * defined the fallback renders, pixel for pixel, the dark system that
 * was always there. An ancestor that defines the --andromeda-theme-*
 * set (see andromedaLightVars) flips that whole subtree instead.
 *
 * Colors only. Sizes, motion and geometry carry no theme.
 *
 * @param {string} name channel name, e.g. 'surface-base'
 * @param {string} value the dark literal to fall back to
 * @returns {string}
 */
export function themed(name: string, value: string) {
  return `var(--andromeda-theme-${name}, ${value})`;
}

/**
 * cn — class name merger.
 * Combines clsx (conditional class joining) with tailwind-merge
 * (conflict resolution for Tailwind utilities).
 *
 * @param {...(string | undefined | null | false | Record<string, boolean>)} inputs
 * @returns {string}
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * easingArray — parse a tokens.motion.easing cubic-bezier() string into the
 * 4-number array framer-motion needs. Framer cannot read CSS vars, so JS
 * animations MUST cross the var boundary — but they should derive from the
 * token string here, never hand-copy the numbers (copies drift silently).
 *
 * @param {string} cssBezier e.g. tokens.motion.easing.out
 * @returns {[number, number, number, number]}
 */
export function easingArray(cssBezier: string): [number, number, number, number] {
  const m = String(cssBezier).match(/[\d.]+/g);
  return m && m.length === 4
    ? (m.map(Number) as [number, number, number, number])
    : [0.4, 0, 0.2, 1];
}

/**
 * themeColor — tokens.color, every leaf already wrapped in the theme channel.
 *
 * Use this anywhere a color reaches a CSS sink from JS: inline `style`
 * objects, template strings for `border` / `boxShadow` / gradients,
 * `<style>` blocks. `themeColor.surface.raised` renders the dark literal
 * until a theme is applied and follows it afterwards, where a bare
 * `tokens.color.surface.raised` would stay dark forever.
 *
 * The two places it does NOT work, because they never resolve var():
 * SVG presentation ATTRIBUTES (`stroke=`, `fill=`, `stopColor=`; put the
 * color in `style` instead, where the CSS property does resolve), and
 * anything crossing into JS or the GPU (three.js, canvas 2d, framer color
 * animation, recharts props that land as attributes). Those read the
 * resolved value at runtime; see components/lib/theme.ts.
 */
export const themeColor = {
  text: {
    primary:   themed('text-primary',   tokens.color.text.primary),
    secondary: themed('text-secondary', tokens.color.text.secondary),
    muted:     themed('text-muted',     tokens.color.text.muted),
    faint:     themed('text-faint',     tokens.color.text.faint),
  },
  surface: {
    base:    themed('surface-base',    tokens.color.surface.base),
    raised:  themed('surface-raised',  tokens.color.surface.raised),
    overlay: themed('surface-overlay', tokens.color.surface.overlay),
    hover:   themed('surface-hover',   tokens.color.surface.hover),
    active:  themed('surface-active',  tokens.color.surface.active),
    alpha:   themed('surface-alpha',   tokens.color.surface.alpha),
  },
  border: {
    subtle: themed('border-subtle', tokens.color.border.subtle),
    base:   themed('border-base',   tokens.color.border.base),
    bright: themed('border-bright', tokens.color.border.bright),
    strong: themed('border-strong', tokens.color.border.strong),
    alpha:  themed('border-alpha',  tokens.color.border.alpha),
  },
  accent: {
    100:   themed('accent-100',   tokens.color.accent[100]),
    200:   themed('accent-200',   tokens.color.accent[200]),
    300:   themed('accent-300',   tokens.color.accent[300]),
    400:   themed('accent-400',   tokens.color.accent[400]),
    500:   themed('accent-500',   tokens.color.accent[500]),
    alpha: themed('accent-alpha', tokens.color.accent.alpha),
    on:    themed('accent-on',    tokens.color.accent.on),
  },
  red: {
    100:   themed('red-100',   tokens.color.red[100]),
    200:   themed('red-200',   tokens.color.red[200]),
    300:   themed('red-300',   tokens.color.red[300]),
    400:   themed('red-400',   tokens.color.red[400]),
    500:   themed('red-500',   tokens.color.red[500]),
    alpha: themed('red-alpha', tokens.color.red.alpha),
    on:    themed('red-on',    tokens.color.red.on),
  },
  orange: {
    100:   themed('orange-100',   tokens.color.orange[100]),
    200:   themed('orange-200',   tokens.color.orange[200]),
    300:   themed('orange-300',   tokens.color.orange[300]),
    400:   themed('orange-400',   tokens.color.orange[400]),
    500:   themed('orange-500',   tokens.color.orange[500]),
    alpha: themed('orange-alpha', tokens.color.orange.alpha),
    on:    themed('orange-on',    tokens.color.orange.on),
  },
  gradient: {
    accentFade:  themed('gradient-accent-fade',  tokens.color.gradient.accentFade),
    accentSweep: themed('gradient-accent-sweep', tokens.color.gradient.accentSweep),
    surfaceSoft: themed('gradient-surface-soft', tokens.color.gradient.surfaceSoft),
  },
};

/**
 * andromedaVars — emits Andromeda tokens as CSS custom properties.
 *
 * Tailwind v4 cannot reach JS-defined token values directly. By
 * spreading this object onto a component's root `style` prop we
 * cascade every token down to that subtree, where cva variants
 * can reference them via `[color:var(--andromeda-…)]` arbitrary
 * classes — including in `hover:` / `focus-visible:` state
 * variants. Every value below traces back to `tokens.ts` exactly.
 *
 * @returns {Record<string, string>}
 */
export function andromedaVars() {
  const t = tokens;
  // Every color goes out through the theme channel (see `themed`); everything
  // else is a constant of the system and ships as its literal.
  const c = themeColor;
  return {
    // Text
    '--andromeda-text-primary':   c.text.primary,
    '--andromeda-text-secondary': c.text.secondary,
    '--andromeda-text-muted':     c.text.muted,
    '--andromeda-text-faint':     c.text.faint,
    // Surfaces — solid + one alpha (scrim/backdrop)
    '--andromeda-surface-base':    c.surface.base,
    '--andromeda-surface-raised':  c.surface.raised,
    '--andromeda-surface-overlay': c.surface.overlay,
    '--andromeda-surface-hover':   c.surface.hover,
    '--andromeda-surface-active':  c.surface.active,
    '--andromeda-surface-alpha':   c.surface.alpha,
    // Borders — solid + one alpha (glassy edge)
    '--andromeda-border-subtle': c.border.subtle,
    '--andromeda-border-base':   c.border.base,
    '--andromeda-border-bright': c.border.bright,
    '--andromeda-border-strong': c.border.strong,
    '--andromeda-border-alpha':  c.border.alpha,
    // Accent (turquoise) — 5 stops + 1 alpha + on-fill foreground
    '--andromeda-accent-100':   c.accent[100],
    '--andromeda-accent-200':   c.accent[200],
    '--andromeda-accent-300':   c.accent[300],
    '--andromeda-accent-400':   c.accent[400],
    '--andromeda-accent-500':   c.accent[500],
    '--andromeda-accent-alpha': c.accent.alpha,
    '--andromeda-accent-on':    c.accent.on,
    // Red — 5 stops + 1 alpha + on-fill foreground
    '--andromeda-red-100':   c.red[100],
    '--andromeda-red-200':   c.red[200],
    '--andromeda-red-300':   c.red[300],
    '--andromeda-red-400':   c.red[400],
    '--andromeda-red-500':   c.red[500],
    '--andromeda-red-alpha': c.red.alpha,
    '--andromeda-red-on':    c.red.on,
    // Orange — 5 stops + 1 alpha + on-fill foreground
    '--andromeda-orange-100':   c.orange[100],
    '--andromeda-orange-200':   c.orange[200],
    '--andromeda-orange-300':   c.orange[300],
    '--andromeda-orange-400':   c.orange[400],
    '--andromeda-orange-500':   c.orange[500],
    '--andromeda-orange-alpha': c.orange.alpha,
    '--andromeda-orange-on':    c.orange.on,
    // Gradients
    '--andromeda-gradient-accent-fade':  c.gradient.accentFade,
    '--andromeda-gradient-accent-sweep': c.gradient.accentSweep,
    '--andromeda-gradient-surface-soft': c.gradient.surfaceSoft,
    // Typography
    '--andromeda-font-sans': t.typography.fontSans,
    '--andromeda-font-mono': t.typography.fontMono,
    '--andromeda-text-xs':   t.typography.size.xs,
    '--andromeda-text-sm':   t.typography.size.sm,
    '--andromeda-text-md':   t.typography.size.md,
    '--andromeda-text-lg':   t.typography.size.lg,
    '--andromeda-text-xl':   t.typography.size.xl,
    '--andromeda-text-2xl':  t.typography.size['2xl'],
    '--andromeda-text-3xl':  t.typography.size['3xl'],
    '--andromeda-text-4xl':  t.typography.size['4xl'],
    '--andromeda-text-5xl':  t.typography.size['5xl'],
    '--andromeda-weight-thin':     String(t.typography.weight.thin),
    '--andromeda-weight-regular':  String(t.typography.weight.regular),
    '--andromeda-weight-medium':   String(t.typography.weight.medium),
    '--andromeda-weight-semibold': String(t.typography.weight.semibold),
    '--andromeda-weight-bold':     String(t.typography.weight.bold),
    '--andromeda-leading-none':    String(t.typography.lineHeight.none),
    '--andromeda-leading-tight':   String(t.typography.lineHeight.tight),
    '--andromeda-leading-snug':    String(t.typography.lineHeight.snug),
    '--andromeda-leading-normal':  String(t.typography.lineHeight.normal),
    '--andromeda-leading-relaxed': String(t.typography.lineHeight.relaxed),
    '--andromeda-tracking-tight':  t.typography.tracking.tight,
    '--andromeda-tracking-normal': t.typography.tracking.normal,
    '--andromeda-tracking-wide':   t.typography.tracking.wide,
    '--andromeda-tracking-wider':  t.typography.tracking.wider,
    '--andromeda-tracking-widest': t.typography.tracking.widest,
    // Spacing
    '--andromeda-1':  t.spacing[1],
    '--andromeda-2':  t.spacing[2],
    '--andromeda-3':  t.spacing[3],
    '--andromeda-4':  t.spacing[4],
    '--andromeda-5':  t.spacing[5],
    '--andromeda-6':  t.spacing[6],
    '--andromeda-8':  t.spacing[8],
    '--andromeda-10': t.spacing[10],
    '--andromeda-12': t.spacing[12],
    // Radius
    '--andromeda-radius-none':  t.radius.none,
    '--andromeda-radius-sm':    t.radius.sm,
    '--andromeda-radius-md':    t.radius.md,
    // Raw default, NOT t.radius.frame — that string embeds var(--andromeda-
    // radius-frame,…) and would self-reference. Keep in sync with tokens.ts.
    '--andromeda-radius-frame': '0px',
    // Border + marker stroke widths (1px hairline identity, theme-tunable)
    '--andromeda-border-width': t.border.width,
    '--andromeda-marker-width': `${t.marker.borderWidth}px`,
    // Opacity — disabled-control constant (unitless; used via opacity-[var(--andromeda-opacity-disabled)])
    '--andromeda-opacity-disabled': String(t.opacity.disabled),
    // Icon glyph scale (px units for CSS boxes; Phosphor size props use the numbers)
    '--andromeda-icon-xs': `${t.iconSize.xs}px`,
    '--andromeda-icon-sm': `${t.iconSize.sm}px`,
    '--andromeda-icon-md': `${t.iconSize.md}px`,
    '--andromeda-icon-lg': `${t.iconSize.lg}px`,
    '--andromeda-icon-xl': `${t.iconSize.xl}px`,
    // Effects — glass blur + accent glow radius
    '--andromeda-blur-sm': t.effect.blurSm,
    '--andromeda-blur-lg': t.effect.blurLg,
    '--andromeda-glow':    t.effect.glow,
    // Drop-shadow — primitives (theme-tunable) + composed size tiers
    '--andromeda-shadow-color': themed('shadow-color', t.effect.shadowColor),
    '--andromeda-shadow-x':     t.effect.shadowX,
    '--andromeda-shadow-y':     t.effect.shadowY,
    '--andromeda-shadow-blur':  t.effect.shadowBlur,
    '--andromeda-shadow-sm':    t.effect.shadowSm,
    '--andromeda-shadow-md':    t.effect.shadowMd,
    '--andromeda-shadow-lg':    t.effect.shadowLg,
    // Chart constants (CSS sinks only; recharts numeric sinks stay RAW)
    '--andromeda-chart-fill-opacity':       String(t.chart.fillOpacity),
    '--andromeda-chart-fill-opacity-faint': String(t.chart.fillOpacityFaint),
    '--andromeda-swatch':                   t.chart.swatch,
    // Breakpoints — exposed for clamp()/calc() expressions that want the
    // same thresholds (e.g. fluid type). NOTE: a CSS @media condition
    // CANNOT read var(), so reflow media queries use the `mq` helper
    // (components/lib/responsive.ts), which interpolates the literal token.
    '--andromeda-bp-sm': t.breakpoints.sm,
    '--andromeda-bp-md': t.breakpoints.md,
    '--andromeda-bp-lg': t.breakpoints.lg,
    // Motion — every duration, easing, and stagger from tokens.motion.
    // Components and templates reference these as `var(--andromeda-duration-*)`
    // and `var(--andromeda-easing-*)` instead of hardcoding ms / cubic-bezier.
    '--andromeda-duration-fast':       t.motion.duration.fast,
    '--andromeda-duration-normal':     t.motion.duration.normal,
    '--andromeda-duration-slow':       t.motion.duration.slow,
    '--andromeda-duration-cascade':    t.motion.duration.cascade,
    '--andromeda-duration-row':        t.motion.duration.row,
    '--andromeda-duration-countup':    t.motion.duration.countup,
    '--andromeda-easing-standard':     t.motion.easing.standard,
    '--andromeda-easing-out':          t.motion.easing.out,
    '--andromeda-easing-in':           t.motion.easing.in,
    '--andromeda-easing-sharp':        t.motion.easing.sharp,
    '--andromeda-stagger-cascade':     t.motion.stagger.cascade,
    '--andromeda-stagger-row':         t.motion.stagger.row,
    '--andromeda-stagger-progressbar': t.motion.stagger.progressBar,
  };
}

/**
 * inheritedThemeVars — the theme channel as it resolves on `el`, for portals.
 *
 * A menu or drawer that portals to <body> leaves the ancestor that defines
 * the --andromeda-theme-* channel behind and would fall back to dark on a
 * light page. Read the channel off the element that opened it and spread the
 * result on the portaled root, before andromedaVars(): the overlay then paints
 * exactly as the surface it came from, in either theme. Empty when the
 * channel is not defined (dark) or there is no DOM.
 *
 * @param {Element | null} el
 * @returns {Record<string, string>}
 */
export function inheritedThemeVars(el: Element | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!el || typeof getComputedStyle === 'undefined') return out;
  const cs = getComputedStyle(el);
  for (const name of Object.keys(andromedaLightVars())) {
    const value = cs.getPropertyValue(name).trim();
    if (value) out[name] = value;
  }
  return out;
}

/**
 * andromedaLightVars — the light theme, as the channel andromedaVars() reads.
 *
 * Put these on any ancestor (`style` prop, or setProperty on an element) and
 * every Andromeda component beneath it turns light; remove them and the whole
 * subtree falls back to the dark literals. Colors only: the light theme
 * changes nothing about size, spacing, motion or geometry.
 *
 * @returns {Record<string, string>}
 */
export function andromedaLightVars() {
  const c = light.color;
  return {
    // Text
    '--andromeda-theme-text-primary':   c.text.primary,
    '--andromeda-theme-text-secondary': c.text.secondary,
    '--andromeda-theme-text-muted':     c.text.muted,
    '--andromeda-theme-text-faint':     c.text.faint,
    // Surfaces
    '--andromeda-theme-surface-base':    c.surface.base,
    '--andromeda-theme-surface-raised':  c.surface.raised,
    '--andromeda-theme-surface-overlay': c.surface.overlay,
    '--andromeda-theme-surface-hover':   c.surface.hover,
    '--andromeda-theme-surface-active':  c.surface.active,
    '--andromeda-theme-surface-alpha':   c.surface.alpha,
    // Borders
    '--andromeda-theme-border-subtle': c.border.subtle,
    '--andromeda-theme-border-base':   c.border.base,
    '--andromeda-theme-border-bright': c.border.bright,
    '--andromeda-theme-border-strong': c.border.strong,
    '--andromeda-theme-border-alpha':  c.border.alpha,
    // Accent
    '--andromeda-theme-accent-100':   c.accent[100],
    '--andromeda-theme-accent-200':   c.accent[200],
    '--andromeda-theme-accent-300':   c.accent[300],
    '--andromeda-theme-accent-400':   c.accent[400],
    '--andromeda-theme-accent-500':   c.accent[500],
    '--andromeda-theme-accent-alpha': c.accent.alpha,
    '--andromeda-theme-accent-on':    c.accent.on,
    // Red
    '--andromeda-theme-red-100':   c.red[100],
    '--andromeda-theme-red-200':   c.red[200],
    '--andromeda-theme-red-300':   c.red[300],
    '--andromeda-theme-red-400':   c.red[400],
    '--andromeda-theme-red-500':   c.red[500],
    '--andromeda-theme-red-alpha': c.red.alpha,
    '--andromeda-theme-red-on':    c.red.on,
    // Orange
    '--andromeda-theme-orange-100':   c.orange[100],
    '--andromeda-theme-orange-200':   c.orange[200],
    '--andromeda-theme-orange-300':   c.orange[300],
    '--andromeda-theme-orange-400':   c.orange[400],
    '--andromeda-theme-orange-500':   c.orange[500],
    '--andromeda-theme-orange-alpha': c.orange.alpha,
    '--andromeda-theme-orange-on':    c.orange.on,
    // Gradients
    '--andromeda-theme-gradient-accent-fade':  c.gradient.accentFade,
    '--andromeda-theme-gradient-accent-sweep': c.gradient.accentSweep,
    '--andromeda-theme-gradient-surface-soft': c.gradient.surfaceSoft,
    // Elevation ink
    '--andromeda-theme-shadow-color': light.effect.shadowColor,
  };
}
