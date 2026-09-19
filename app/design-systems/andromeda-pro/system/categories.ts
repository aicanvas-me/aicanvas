// Gallery taxonomy. Andromeda's component metadata carries no category (Lumen's
// registry does), so the grouping lives here rather than being invented at
// render time. Sections sort by size, so a category with more components leads.
//
// A new component must be added here or it lands in "Other" — visible, never
// dropped.
export const CATEGORY: Record<string, string> = {
  // Forms
  input: 'Forms',
  textarea: 'Forms',
  'search-field': 'Forms',
  checkbox: 'Forms',
  radio: 'Forms',
  toggle: 'Forms',
  'choice-card': 'Forms',
  slider: 'Forms',
  'segmented-control': 'Forms',
  'date-range-picker': 'Forms',

  // Data display
  'table-basic': 'Data display',
  'table-data': 'Data display',
  'stat-tile': 'Data display',
  'progress-bar': 'Data display',
  'heat-grid': 'Data display',
  badge: 'Data display',
  tag: 'Data display',
  avatar: 'Data display',

  // Charts
  'chart-trend': 'Charts',
  'chart-metric': 'Charts',
  'chart-radar': 'Charts',
  'chart-funnel': 'Charts',
  gauge: 'Charts',
  waveform: 'Charts',

  // Overlays
  'panel-menu': 'Overlays',
  'user-menu': 'Overlays',
  'user-card': 'Overlays',
  drawer: 'Overlays',
  tooltip: 'Overlays',

  // Feedback
  alert: 'Feedback',
  'empty-state': 'Feedback',
  spinner: 'Feedback',

  // Actions
  button: 'Actions',
  'icon-button': 'Actions',

  // Navigation
  'nav-item': 'Navigation',
  'panel-header': 'Navigation',
  sidebar: 'Navigation',
  'top-bar': 'Navigation',

  // Surfaces
  card: 'Surfaces',
  'corner-markers': 'Surfaces',

  // Media
  'media-card': 'Media',
  'music-player': 'Media',

  // Objects — the sanctioned decorative class (motion.md#motion-philosophy).
  // Planet moved here from "Visualization": it was
  // never a visualization, it was the class's first member.
  planet: 'Objects',
  orb: 'Objects',
  nodes: 'Objects',
  burst: 'Objects',
}
