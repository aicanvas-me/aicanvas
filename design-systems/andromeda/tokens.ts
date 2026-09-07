//
// Andromeda: free and open source (MIT). These components and tokens are
// free to use, forever. Andromeda Pro, the expanded premium system, lives
// at https://aicanvas.me/andromeda.
//
// ============================================================
// ANDROMEDA DESIGN TOKENS
// Sci-fi / blueprint aesthetic. Solid surfaces by default — every
// hue palette (accent, red, orange) ships as a 5-stop scale (100
// lightest → 500 darkest). One alpha token is allowed per family
// (color, border, surface) for cases that genuinely need layering.
// ============================================================

export const tokens = {
  color: {
    // Text — solid greys. No alpha. Tuned for WCAG AA on surface.base:
    // primary 17.7:1, secondary 8.3:1, muted 6.9:1, faint 3.5:1 (AA-large).
    text: {
      primary:   '#F5F5F5',
      secondary: '#A3A3A3',
      muted:     '#9A9A9A',
      faint:     '#6E6E6E',
    },
    // Surfaces — solid colors. `base` is the page void; nothing
    // else is transparent. `alpha` is the one allowed alpha
    // surface (modal scrim / drawer backdrop).
    surface: {
      base:    '#0E0E0F',
      raised:  '#141415',
      overlay: '#19191A',
      hover:   '#1C1C1D',
      active:  '#232325',
      alpha:   'rgba(0, 0, 0, 0.65)',
    },
    // Borders — solid greys + one alpha border for glassy edges.
    border: {
      subtle: '#212122',
      base:   '#3E3E3F',
      bright: '#5B5B5C',
      strong: '#939393',
      alpha:  'rgba(255, 255, 255, 0.18)',
    },
    // Accent — turquoise. 5 stops + 1 alpha (translucent overlay
    // derived from the 300 base, 0.25). The 100 stop pairs with
    // the 500 stop for body text (≥6:1 ratio).
    accent: {
      100:   '#BAF8EC',
      200:   '#56F0D6',
      300:   '#0FCFB2',
      400:   '#109380',
      500:   '#126059',
      alpha: 'rgba(15, 207, 178, 0.25)',
      // Text/icon ON an accent-filled surface. The one guaranteed-contrast
      // pairing token — every accent fill takes its foreground from here so
      // a theme retuning the family keeps labels legible. Defaults to the
      // 100 stop (documented ≥6:1 on the 500 stop).
      on:    '#BAF8EC',
    },
    // Red — 5 stops + 1 alpha. Use 100 for body text on 500 (≥7:1).
    red: {
      100:   '#FFCFCF',
      200:   '#FF8B8B',
      300:   '#FF3939',
      400:   '#B82424',
      500:   '#5A1818',
      alpha: 'rgba(255, 57, 57, 0.25)',
      on:    '#FFCFCF',
    },
    // Orange — 5 stops + 1 alpha. Use 100 for body text on 500 (≥8:1).
    orange: {
      100:   '#FFE5B5',
      200:   '#FFC466',
      300:   '#FFA000',
      400:   '#B57009',
      500:   '#4D3712',
      alpha: 'rgba(255, 160, 0, 0.25)',
      on:    '#FFE5B5',
    },
    // Gradients fade to solid colors (no transparent stops).
    gradient: {
      accentFade:  'linear-gradient(180deg, #0A2422 0%, #0E0E0F 100%)',
      // Soft accent spotlight — a barely-visible accent tint blooms from
      // the top-left corner and fades smoothly back to surface.raised.
      // Used by Card variant="glow" to draw the eye without painting a
      // colored card.
      accentSweep: 'radial-gradient(ellipse 80% 70% at 0% 0%, #1B2C29 0%, #172321 25%, #141415 65%)',
      surfaceSoft: 'linear-gradient(180deg, #181819 0%, #111111 100%)',
    },
  },
  typography: {
    // JetBrains Mono is the only font in the Andromeda design system.
    // In the AI Canvas app, --font-jetbrains-mono is provided by next/font (see
    // app/design-systems/andromeda/layout.tsx). Installed projects don't have it,
    // so the var carries an INNER fallback ('JetBrains Mono Variable'). Without an
    // inner fallback, an undefined var invalidates the WHOLE declaration (invalid
    // at computed-value time) and the named fallbacks below never apply — the font
    // collapses to the page's inherited font. The registry self-loads
    // 'JetBrains Mono Variable' via @fontsource-variable so the fallback resolves.
    // Both fontSans and fontMono resolve to the same family — the sans/mono
    // distinction is kept only so existing component references work unchanged.
    fontSans: "var(--font-jetbrains-mono, 'JetBrains Mono Variable'), 'JetBrains Mono', 'IBM Plex Mono', Menlo, Monaco, Consolas, monospace",
    fontMono: "var(--font-jetbrains-mono, 'JetBrains Mono Variable'), 'JetBrains Mono', 'IBM Plex Mono', Menlo, Monaco, Consolas, monospace",
    size: {
      xs:   '10px',
      sm:   '12px',
      md:   '14px',
      lg:   '15px',
      xl:   '18px',
      '2xl':'22px',
      '3xl':'28px',
      '4xl':'36px',
      '5xl':'48px',
    },
    weight: {
      thin:     200,
      regular:  400,
      medium:   500,
      semibold: 600,
      bold:     700,
    },
    lineHeight: {
      none:    1,
      tight:   1.1,
      snug:    1.25,
      normal:  1.5,
      relaxed: 1.6,
    },
    tracking: {
      // Wide letter-spacing on monospace labels
      tight:  '0',
      normal: '0.02em',
      wide:   '0.08em',
      wider:  '0.14em',
      widest: '0.22em',
    },
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10:'40px',
    12:'48px',
  },
  radius: {
    // Sharp by default — square corners are part of the look
    none: '0',
    sm:   '2px',
    md:   '3px',
    // The one radius every framed surface consumes (cards, buttons, inputs,
    // menus, tiles). 0 = the square identity. Same var-with-fallback pattern
    // as border.thin below, so INLINE styles consuming tokens.radius.frame
    // are theme-tunable too; andromedaVars() emits the raw 0px default for
    // --andromeda-radius-frame (it must not self-reference this string).
    // `none` stays a true constant zero for explicit square declarations.
    frame: 'var(--andromeda-radius-frame, 0px)',
  },
  opacity: {
    // Disabled controls. One system-wide constant so every primitive and
    // input dims identically. Exposed as --andromeda-opacity-disabled.
    disabled: 0.4,
  },
  // Icon glyph sizes (numbers — Phosphor `size` props and SVG boxes need
  // numerics). One authoritative scale instead of per-component px.
  iconSize: {
    xs: 12,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22,
  },
  // Effects — frosted-glass blur radii and the accent hover/focus glow
  // radius. Exposed as --andromeda-blur-sm/-lg and --andromeda-glow.
  effect: {
    blurSm: '2px',
    blurLg: '8px',
    glow:   '8px',
    // Drop-shadow system. Four PRIMITIVES a theme can tune (color, x, y,
    // blur), then three SIZE TIERS composed from them. The tiers scale the
    // offset + blur so a large panel casts a deeper shadow than a small chip
    // — one control set retunes every tier at once. Components pick the tier
    // that matches their footprint (chips → sm, menus/popovers → md, drawers
    // / big panels → lg). Default is a soft near-black elevation, close to
    // the ad-hoc shadows components used before.
    shadowColor: 'rgba(0, 0, 0, 0.45)',
    shadowX:     '0px',
    shadowY:     '10px',
    shadowBlur:  '24px',
    // Tier strings reference the primitive vars (with the token defaults as
    // fallbacks) so tuning any primitive reflows all three tiers live. The
    // color slot carries a SECOND fallback, --andromeda-theme-shadow-color, so
    // a tier used outside an andromedaVars() subtree still follows the theme
    // instead of dropping straight to the dark ink.
    shadowSm: 'var(--andromeda-shadow-x, 0px) calc(var(--andromeda-shadow-y, 10px) * 0.4) calc(var(--andromeda-shadow-blur, 24px) * 0.4) var(--andromeda-shadow-color, var(--andromeda-theme-shadow-color, rgba(0, 0, 0, 0.45)))',
    shadowMd: 'var(--andromeda-shadow-x, 0px) calc(var(--andromeda-shadow-y, 10px) * 0.8) calc(var(--andromeda-shadow-blur, 24px) * 0.9) var(--andromeda-shadow-color, var(--andromeda-theme-shadow-color, rgba(0, 0, 0, 0.45)))',
    shadowLg: 'var(--andromeda-shadow-x, 0px) var(--andromeda-shadow-y, 10px) var(--andromeda-shadow-blur, 24px) var(--andromeda-shadow-color, var(--andromeda-theme-shadow-color, rgba(0, 0, 0, 0.45)))',
  },
  // Chart constants shared by TrendChart / MetricChart / RadarChart / Gauge.
  // lineWidth/dash are recharts sinks (numbers/strings, var-incapable — keep
  // RAW); fillOpacity + swatch are CSS sinks, exposed as vars.
  chart: {
    fillOpacity:      0.12,
    fillOpacityFaint: 0.06,
    lineWidth:        1.5,
    dash:             '2 4',
    swatch:           '8px',
  },
  border: {
    // System hairline width. 1px IS the identity; the var indirection (same
    // pattern as fontSans above) lets a theme widen every border at once.
    // The inner fallback keeps installed projects correct without any var.
    width: '1px',
    thin: 'var(--andromeda-border-width, 1px) solid',
  },
  marker: {
    // Corner marker geometry — L-shaped brackets that hug each corner.
    size:        12,    // px square the bracket lives inside
    offset:      0,     // px inset from the corner (0 = flush)
    borderWidth: 1,     // px stroke thickness of the L; rendered through
                        // --andromeda-marker-width so themes can thicken it
  },
  layout: {
    sidebarWidth: '224px',
    headerHeight: '60px',
  },
  // Breakpoints — max-width thresholds. Andromeda is DESKTOP-FIRST: the
  // default (unqualified) styles are the desktop layout and these step
  // DOWN from there. `md` (768px) is the primary stack threshold — at/below
  // it, dense bento grids collapse to a single column and the sidebar
  // becomes a Drawer. `sm` is for phone-only fine-tuning (display-type
  // step-down, tighter insets); `lg` is the tablet ceiling where the full
  // desktop grid is still guaranteed to fit. Media queries can't read a
  // CSS var(), so the `mq` helper (components/lib/responsive.ts)
  // interpolates these literals — tokens.ts stays the single source.
  // See the Andromeda responsive rules for the mechanism + faithful-stack rules.
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
  },
  // Motion — durations, easings, and stagger presets that encode the
  // Andromeda tempo. Movement signals data movement or interaction
  // acknowledgement; never decoration. See the Andromeda motion rules for the
  // philosophy and approved/forbidden patterns.
  motion: {
    duration: {
      // Click acknowledgement (active flash, focus ring, button press).
      // Brief enough that the user reads it as feedback, not animation.
      fast:    '80ms',
      // Default state transitions: hover, popover caret rotation, anything
      // where the user changed their mind and wants to see the new state.
      normal:  '140ms',
      // Stateful trigger reveals (drawer slide, menu open). The motion
      // IS the visual answer to the click — slow enough to track, fast
      // enough not to feel laggy.
      slow:    '200ms',
      // Cascade entrances (ProgressBar segment fill, dashboard section
      // slide-in). Each element's own motion duration; stagger between
      // siblings is `motion.stagger.cascade`. 500ms is the calm read —
      // each element clearly arrives, the cascade doesn't feel hurried.
      cascade: '500ms',
      // Row reveals inside a table or log when its container scrolls
      // into view. Tighter than the section cascade because rows are
      // smaller visual elements; a 500ms reveal per row drags.
      row:     '350ms',
      // StatTile count-up. Long enough that the eye reads the value as
      // animating in, short enough that the final number is what the
      // user remembers.
      countup: '1800ms',
    },
    easing: {
      // Material standard — accelerate then decelerate. Default for
      // anything that doesn't have a more specific reason.
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      // Ease-out — fast start, soft landing. Use for entrances (cascade,
      // hover-in) where the motion settles into a final state.
      out:      'cubic-bezier(0, 0, 0.2, 1)',
      // Ease-in — slow start, fast end. Use for exits (drawer close,
      // hover-out) where the motion is leaving the field.
      in:       'cubic-bezier(0.4, 0, 1, 1)',
      // Ease-in-out — symmetrical. Use for state-flip transitions where
      // start and end deserve the same weight.
      sharp:    'cubic-bezier(0.4, 0, 0.6, 1)',
    },
    stagger: {
      // Cascade between siblings on entrance (top-to-bottom dashboard
      // load, list reveal). 60ms reads as a deliberate sequence, not
      // a cascade so fast it feels like a single event.
      cascade:     '60ms',
      // Row stagger inside a table or log. Tighter than section cascade
      // — long tables would otherwise feel like they take forever to
      // reveal. 40ms is fast enough to keep the user moving, slow
      // enough that the eye registers the cascade.
      row:         '40ms',
      // ProgressBar segment fill cascade. Tighter than entrance because
      // segments are visually adjacent — looser would read as choppy.
      progressBar: '120ms',
    },
  },
};

// ============================================================
// LIGHT THEME
// The same color contract as tokens.color, retuned for a light
// ground. Every stop keeps its contrast DISTANCE from the ground
// rather than its absolute lightness, so the scale reads the same
// way it always did and simply runs the other direction: the 100
// stops become the deep inks, 400/500 become the pale washes, `on`
// stays the 100 stop (the guaranteed foreground for a 500 fill),
// and each alpha tint derives from the light 300. surface.alpha is
// the exception: a scrim is dark ink on both themes, because its
// job is to bury the page behind a modal, not to match it.
//
// Applied by handing andromedaLightVars() (components/lib/utils.ts)
// to any ancestor: it defines the --andromeda-theme-* channel that
// andromedaVars() reads through, so one element flips a whole
// subtree. Nothing defined = the dark values above.
// ============================================================

export const light = {
  color: {
    // Contrast on light surface.base: primary 15.8:1, secondary 8.0:1,
    // muted 6.3:1, faint 3.2:1 (AA-large), the dark ladder mirrored.
    text: {
      primary:   '#1A1A1C',
      secondary: '#4A4A4D',
      muted:     '#5A5A5E',
      faint:     '#89898D',
    },
    // Surfaces run the other way: base is the lightest page ground a
    // panel can sit on, and raised/overlay lift toward white. hover and
    // active step DOWN instead of up, which is how depth reads on light.
    surface: {
      base:    '#F4F4F5',
      raised:  '#FAFAFB',
      overlay: '#FFFFFF',
      hover:   '#ECECEE',
      active:  '#E3E3E5',
      alpha:   'rgba(0, 0, 0, 0.45)',
    },
    // Borders: the same four weights, darkening toward `strong`.
    border: {
      subtle: '#E5E5E7',
      base:   '#C8C8CB',
      bright: '#A5A5A9',
      strong: '#6F6F73',
      alpha:  'rgba(0, 0, 0, 0.14)',
    },
    // Accent, turquoise, inked. 100 is the deepest (text on a 500 fill),
    // 300 stays the base you draw with, 400 is the visible mid green
    // (heat steps, marked borders, the online dot), 500 is the pale
    // tinted fill.
    accent: {
      100:   '#0D4239',
      200:   '#0D5D51',
      300:   '#0B7A6A',
      400:   '#3DBA9C',
      500:   '#D7F7EF',
      alpha: 'rgba(11, 122, 106, 0.22)',
      on:    '#0D4239',
    },
    red: {
      100:   '#5C1414',
      200:   '#9A2121',
      300:   '#C22B2B',
      400:   '#F5A3A3',
      500:   '#FBDADA',
      alpha: 'rgba(194, 43, 43, 0.22)',
      on:    '#5C1414',
    },
    orange: {
      100:   '#4A3410',
      200:   '#7A5310',
      300:   '#8F6000',
      400:   '#F3C878',
      500:   '#FBE8C7',
      alpha: 'rgba(143, 96, 0, 0.22)',
      on:    '#4A3410',
    },
    // Same three gradients, same shapes, fading to the light grounds.
    gradient: {
      accentFade:  'linear-gradient(180deg, #E3F4F0 0%, #F4F4F5 100%)',
      accentSweep: 'radial-gradient(ellipse 80% 70% at 0% 0%, #DDF2EC 0%, #E9F5F1 25%, #FAFAFB 65%)',
      surfaceSoft: 'linear-gradient(180deg, #FFFFFF 0%, #F1F1F2 100%)',
    },
  },
  effect: {
    // Elevation on light is a soft grey cast, not the near-black the dark
    // theme uses: the same offsets read far heavier over a pale ground.
    shadowColor: 'rgba(17, 17, 20, 0.16)',
  },
};
