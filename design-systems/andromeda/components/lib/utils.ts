import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { tokens, light } from '../../tokens';

export function themed(name: string, value: string) {
  return `var(--andromeda-theme-${name}, ${value})`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Falls back to easing.standard when the string is not a 4-number cubic-bezier().
export function easingArray(cssBezier: string): [number, number, number, number] {
  const m = String(cssBezier).match(/[\d.]+/g);
  return m && m.length === 4
    ? (m.map(Number) as [number, number, number, number])
    : [0.4, 0, 0.2, 1];
}

// Inline-style colours go through these: a bare tokens.color stays dark on light pages.
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

export function andromedaVars() {
  const t = tokens;
  // Colours only through themeColor or themed(); a literal here ignores the light theme.
  const c = themeColor;
  return {
    '--andromeda-text-primary':   c.text.primary,
    '--andromeda-text-secondary': c.text.secondary,
    '--andromeda-text-muted':     c.text.muted,
    '--andromeda-text-faint':     c.text.faint,
    '--andromeda-surface-base':    c.surface.base,
    '--andromeda-surface-raised':  c.surface.raised,
    '--andromeda-surface-overlay': c.surface.overlay,
    '--andromeda-surface-hover':   c.surface.hover,
    '--andromeda-surface-active':  c.surface.active,
    '--andromeda-surface-alpha':   c.surface.alpha,
    '--andromeda-border-subtle': c.border.subtle,
    '--andromeda-border-base':   c.border.base,
    '--andromeda-border-bright': c.border.bright,
    '--andromeda-border-strong': c.border.strong,
    '--andromeda-border-alpha':  c.border.alpha,
    '--andromeda-accent-100':   c.accent[100],
    '--andromeda-accent-200':   c.accent[200],
    '--andromeda-accent-300':   c.accent[300],
    '--andromeda-accent-400':   c.accent[400],
    '--andromeda-accent-500':   c.accent[500],
    '--andromeda-accent-alpha': c.accent.alpha,
    '--andromeda-accent-on':    c.accent.on,
    '--andromeda-red-100':   c.red[100],
    '--andromeda-red-200':   c.red[200],
    '--andromeda-red-300':   c.red[300],
    '--andromeda-red-400':   c.red[400],
    '--andromeda-red-500':   c.red[500],
    '--andromeda-red-alpha': c.red.alpha,
    '--andromeda-red-on':    c.red.on,
    '--andromeda-orange-100':   c.orange[100],
    '--andromeda-orange-200':   c.orange[200],
    '--andromeda-orange-300':   c.orange[300],
    '--andromeda-orange-400':   c.orange[400],
    '--andromeda-orange-500':   c.orange[500],
    '--andromeda-orange-alpha': c.orange.alpha,
    '--andromeda-orange-on':    c.orange.on,
    '--andromeda-gradient-accent-fade':  c.gradient.accentFade,
    '--andromeda-gradient-accent-sweep': c.gradient.accentSweep,
    '--andromeda-gradient-surface-soft': c.gradient.surfaceSoft,
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
    '--andromeda-1':  t.spacing[1],
    '--andromeda-2':  t.spacing[2],
    '--andromeda-3':  t.spacing[3],
    '--andromeda-4':  t.spacing[4],
    '--andromeda-5':  t.spacing[5],
    '--andromeda-6':  t.spacing[6],
    '--andromeda-8':  t.spacing[8],
    '--andromeda-10': t.spacing[10],
    '--andromeda-12': t.spacing[12],
    '--andromeda-radius-none':  t.radius.none,
    '--andromeda-radius-sm':    t.radius.sm,
    '--andromeda-radius-md':    t.radius.md,
    // Not t.radius.frame: it reads this var (a cycle). Keep 0px equal to its fallback.
    '--andromeda-radius-frame': '0px',
    '--andromeda-border-width': t.border.width,
    '--andromeda-marker-width': `${t.marker.borderWidth}px`,
    '--andromeda-opacity-disabled': String(t.opacity.disabled),
    '--andromeda-icon-xs': `${t.iconSize.xs}px`,
    '--andromeda-icon-sm': `${t.iconSize.sm}px`,
    '--andromeda-icon-md': `${t.iconSize.md}px`,
    '--andromeda-icon-lg': `${t.iconSize.lg}px`,
    '--andromeda-icon-xl': `${t.iconSize.xl}px`,
    '--andromeda-blur-sm': t.effect.blurSm,
    '--andromeda-blur-lg': t.effect.blurLg,
    '--andromeda-glow':    t.effect.glow,
    '--andromeda-shadow-color': themed('shadow-color', t.effect.shadowColor),
    '--andromeda-shadow-x':     t.effect.shadowX,
    '--andromeda-shadow-y':     t.effect.shadowY,
    '--andromeda-shadow-blur':  t.effect.shadowBlur,
    '--andromeda-shadow-sm':    t.effect.shadowSm,
    '--andromeda-shadow-md':    t.effect.shadowMd,
    '--andromeda-shadow-lg':    t.effect.shadowLg,
    '--andromeda-chart-fill-opacity':       String(t.chart.fillOpacity),
    '--andromeda-chart-fill-opacity-faint': String(t.chart.fillOpacityFaint),
    '--andromeda-swatch':                   t.chart.swatch,
    // Not usable in @media (it cannot read var()); media queries use mq in ./responsive.
    '--andromeda-bp-sm': t.breakpoints.sm,
    '--andromeda-bp-md': t.breakpoints.md,
    '--andromeda-bp-lg': t.breakpoints.lg,
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

export function andromedaLightVars() {
  const c = light.color;
  return {
    '--andromeda-theme-text-primary':   c.text.primary,
    '--andromeda-theme-text-secondary': c.text.secondary,
    '--andromeda-theme-text-muted':     c.text.muted,
    '--andromeda-theme-text-faint':     c.text.faint,
    '--andromeda-theme-surface-base':    c.surface.base,
    '--andromeda-theme-surface-raised':  c.surface.raised,
    '--andromeda-theme-surface-overlay': c.surface.overlay,
    '--andromeda-theme-surface-hover':   c.surface.hover,
    '--andromeda-theme-surface-active':  c.surface.active,
    '--andromeda-theme-surface-alpha':   c.surface.alpha,
    '--andromeda-theme-border-subtle': c.border.subtle,
    '--andromeda-theme-border-base':   c.border.base,
    '--andromeda-theme-border-bright': c.border.bright,
    '--andromeda-theme-border-strong': c.border.strong,
    '--andromeda-theme-border-alpha':  c.border.alpha,
    '--andromeda-theme-accent-100':   c.accent[100],
    '--andromeda-theme-accent-200':   c.accent[200],
    '--andromeda-theme-accent-300':   c.accent[300],
    '--andromeda-theme-accent-400':   c.accent[400],
    '--andromeda-theme-accent-500':   c.accent[500],
    '--andromeda-theme-accent-alpha': c.accent.alpha,
    '--andromeda-theme-accent-on':    c.accent.on,
    '--andromeda-theme-red-100':   c.red[100],
    '--andromeda-theme-red-200':   c.red[200],
    '--andromeda-theme-red-300':   c.red[300],
    '--andromeda-theme-red-400':   c.red[400],
    '--andromeda-theme-red-500':   c.red[500],
    '--andromeda-theme-red-alpha': c.red.alpha,
    '--andromeda-theme-red-on':    c.red.on,
    '--andromeda-theme-orange-100':   c.orange[100],
    '--andromeda-theme-orange-200':   c.orange[200],
    '--andromeda-theme-orange-300':   c.orange[300],
    '--andromeda-theme-orange-400':   c.orange[400],
    '--andromeda-theme-orange-500':   c.orange[500],
    '--andromeda-theme-orange-alpha': c.orange.alpha,
    '--andromeda-theme-orange-on':    c.orange.on,
    '--andromeda-theme-gradient-accent-fade':  c.gradient.accentFade,
    '--andromeda-theme-gradient-accent-sweep': c.gradient.accentSweep,
    '--andromeda-theme-gradient-surface-soft': c.gradient.surfaceSoft,
    '--andromeda-theme-shadow-color': light.effect.shadowColor,
  };
}
