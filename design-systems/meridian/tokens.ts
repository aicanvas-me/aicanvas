// ============================================================
// MERIDIAN DESIGN TOKENS — Fluent 2 Inspired
// ============================================================

export const tokens = {
  color: {
    // Primary — Fluent blue
    primary: {
      10: '#EFF6FC',
      20: '#DEECF9',
      30: '#C7E0F4',
      40: '#2B88D8',
      50: '#0078D4',
      60: '#106EBE',
      70: '#005A9E',
      80: '#004578',
    },
    // Neutral warm-gray ramp (#FAF9F8 → #201F1E)
    neutral: {
      0:   '#FFFFFF',
      20:  '#FAF9F8',
      30:  '#F3F2F1',
      40:  '#EDEBE9',
      50:  '#E1DFDD',
      60:  '#C8C6C4',
      70:  '#A19F9D',
      80:  '#605E5C',
      90:  '#3B3A39',
      100: '#201F1E',
    },
    // Semantic
    success: {
      10: '#DFF6DD',
      50: '#107C10',
      60: '#0E6B0E',
    },
    warning: {
      10: '#FFF4CE',
      50: '#CA5010',
      60: '#B83200',
    },
    error: {
      10: '#FDE7E9',
      50: '#A4262C',
      60: '#8E1619',
    },
    purple: {
      10: '#F4F0FF',
      50: '#6B2FB6',
      60: '#5D2CA8',
    },
    teal: {
      10: '#DFF6F4',
      50: '#00848C',
      60: '#006E73',
    },
    info: {
      10: '#EFF6FC',
      50: '#0078D4',
    },
  },
  typography: {
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    size: {
      xs:   '11px',
      sm:   '12px',
      md:   '14px',
      lg:   '16px',
      xl:   '20px',
      '2xl':'24px',
      '3xl':'32px',
      '4xl':'40px',
    },
    weight: {
      regular:  400,
      medium:   500,
      semibold: 600,
      bold:     700,
    },
    lineHeight: {
      tight:   1.2,
      normal:  1.4,
      relaxed: 1.6,
    },
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    6: '24px',
    8: '32px',
  },
  radius: {
    sm:  '2px',
    md:  '4px',
    lg:  '6px',
    xl:  '8px',
    // Numeric for recharts and other non-CSS APIs
    px: { sm: 2, md: 4, lg: 6, xl: 8 },
  },
  shadow: {
    1:  '0 1px 2px rgba(0,0,0,0.08)',
    2:  '0 2px 4px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.08)',
    4:  '0 4px 8px rgba(0,0,0,0.10), 0 0 1px rgba(0,0,0,0.08)',
    8:  '0 8px 16px rgba(0,0,0,0.12), 0 0 2px rgba(0,0,0,0.08)',
    16: '0 16px 32px rgba(0,0,0,0.14), 0 0 2px rgba(0,0,0,0.08)',
  },
  layout: {
    sidebarWidth: '220px',
    headerHeight: '56px',
  },
};
