//
// Andromeda: free and open source (MIT). These components and tokens are
// free to use, forever. Andromeda Pro, the expanded premium system, lives
// at https://aicanvas.me/andromeda.
//

export const tokens = {
  color: {
    // On surface.base: primary, secondary and muted keep 4.5:1 or more, faint 3:1 (large text).
    text: {
      primary:   '#F5F5F5',
      secondary: '#A3A3A3',
      muted:     '#9A9A9A',
      faint:     '#6E6E6E',
    },
    surface: {
      base:    '#0E0E0F',
      raised:  '#141415',
      overlay: '#19191A',
      hover:   '#1C1C1D',
      active:  '#232325',
      alpha:   'rgba(0, 0, 0, 0.65)',
    },
    border: {
      subtle: '#212122',
      base:   '#3E3E3F',
      bright: '#5B5B5C',
      strong: '#939393',
      alpha:  'rgba(255, 255, 255, 0.18)',
    },
    accent: {
      100:   '#BAF8EC',
      200:   '#56F0D6',
      300:   '#0FCFB2',
      400:   '#109380',
      500:   '#126059',
      alpha: 'rgba(15, 207, 178, 0.25)',
      // Foreground on 500 fills: keep 4.5:1 or more against the 500 stop when retuning.
      on:    '#BAF8EC',
    },
    red: {
      100:   '#FFCFCF',
      200:   '#FF8B8B',
      300:   '#FF3939',
      400:   '#B82424',
      500:   '#5A1818',
      alpha: 'rgba(255, 57, 57, 0.25)',
      on:    '#FFCFCF',
    },
    orange: {
      100:   '#FFE5B5',
      200:   '#FFC466',
      300:   '#FFA000',
      400:   '#B57009',
      500:   '#4D3712',
      alpha: 'rgba(255, 160, 0, 0.25)',
      on:    '#FFE5B5',
    },
    gradient: {
      accentFade:  'linear-gradient(180deg, #0A2422 0%, #0E0E0F 100%)',
      accentSweep: 'radial-gradient(ellipse 80% 70% at 0% 0%, #1B2C29 0%, #172321 25%, #141415 65%)',
      surfaceSoft: 'linear-gradient(180deg, #181819 0%, #111111 100%)',
    },
  },
  typography: {
    // Keep the fallback inside var(): an undefined var without one voids the whole font list.
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
    none: '0',
    sm:   '2px',
    md:   '3px',
    // The 0px fallback must match the default andromedaVars() emits for this var.
    frame: 'var(--andromeda-radius-frame, 0px)',
  },
  opacity: {
    disabled: 0.4,
  },
  iconSize: {
    xs: 12,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22,
  },
  effect: {
    blurSm: '2px',
    blurLg: '8px',
    glow:   '8px',
    shadowColor: 'rgba(0, 0, 0, 0.45)',
    shadowX:     '0px',
    shadowY:     '10px',
    shadowBlur:  '24px',
    // The tier fallbacks repeat the four primitives above; change them together.
    shadowSm: 'var(--andromeda-shadow-x, 0px) calc(var(--andromeda-shadow-y, 10px) * 0.4) calc(var(--andromeda-shadow-blur, 24px) * 0.4) var(--andromeda-shadow-color, var(--andromeda-theme-shadow-color, rgba(0, 0, 0, 0.45)))',
    shadowMd: 'var(--andromeda-shadow-x, 0px) calc(var(--andromeda-shadow-y, 10px) * 0.8) calc(var(--andromeda-shadow-blur, 24px) * 0.9) var(--andromeda-shadow-color, var(--andromeda-theme-shadow-color, rgba(0, 0, 0, 0.45)))',
    shadowLg: 'var(--andromeda-shadow-x, 0px) var(--andromeda-shadow-y, 10px) var(--andromeda-shadow-blur, 24px) var(--andromeda-shadow-color, var(--andromeda-theme-shadow-color, rgba(0, 0, 0, 0.45)))',
  },
  chart: {
    fillOpacity:      0.12,
    fillOpacityFaint: 0.06,
    lineWidth:        1.5,
    dash:             '2 4',
    swatch:           '8px',
  },
  border: {
    // thin's 1px fallback mirrors width; change both.
    width: '1px',
    thin: 'var(--andromeda-border-width, 1px) solid',
  },
  marker: {
    size:        12,
    offset:      0,
    borderWidth: 1,
  },
  layout: {
    sidebarWidth: '224px',
    headerHeight: '60px',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
  },
  motion: {
    duration: {
      fast:    '80ms',
      normal:  '140ms',
      slow:    '200ms',
      cascade: '500ms',
      row:     '350ms',
      countup: '1800ms',
    },
    easing: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      out:      'cubic-bezier(0, 0, 0.2, 1)',
      in:       'cubic-bezier(0.4, 0, 1, 1)',
      sharp:    'cubic-bezier(0.4, 0, 0.6, 1)',
    },
    stagger: {
      cascade:     '60ms',
      row:         '40ms',
      progressBar: '120ms',
    },
  },
};

export const light = {
  color: {
    // On surface.base: primary, secondary and muted keep 4.5:1 or more, faint 3:1 (large text).
    text: {
      primary:   '#1A1A1C',
      secondary: '#4A4A4D',
      muted:     '#5A5A5E',
      faint:     '#89898D',
    },
    surface: {
      base:    '#F4F4F5',
      raised:  '#FAFAFB',
      overlay: '#FFFFFF',
      hover:   '#ECECEE',
      active:  '#E3E3E5',
      alpha:   'rgba(0, 0, 0, 0.45)',
    },
    border: {
      subtle: '#E5E5E7',
      base:   '#C8C8CB',
      bright: '#A5A5A9',
      strong: '#6F6F73',
      alpha:  'rgba(0, 0, 0, 0.14)',
    },
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
    gradient: {
      accentFade:  'linear-gradient(180deg, #E3F4F0 0%, #F4F4F5 100%)',
      accentSweep: 'radial-gradient(ellipse 80% 70% at 0% 0%, #DDF2EC 0%, #E9F5F1 25%, #FAFAFB 65%)',
      surfaceSoft: 'linear-gradient(180deg, #FFFFFF 0%, #F1F1F2 100%)',
    },
  },
  effect: {
    shadowColor: 'rgba(17, 17, 20, 0.16)',
  },
};
