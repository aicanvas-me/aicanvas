// Pure metadata for Andromeda components. NO Node APIs here — this file is
// safe to import from client components (sidebar, demos, etc.). The full
// registry (which reads source files via `fs`) lives in
// `andromeda-registry.ts` and imports this file as the metadata source.

export type AndromedaComponentMeta = {
  slug: string
  name: string
  description: string
  sourceFile: string
  image?: string
}

export const ANDROMEDA_COMPONENT_META: AndromedaComponentMeta[] = [
  {
    slug: 'alert',
    name: 'Alert',
    description:
      'Displays a status message in the flow of the page, at a severity from note to fault.',
    sourceFile: 'Alert.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/alert.png?v=5',
  },
  {
    slug: 'avatar',
    name: 'Avatar',
    description:
      'Represents a person as a square image tile that falls back to their initials.',
    sourceFile: 'Avatar.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/avatar.png?v=3',
  },
  {
    slug: 'badge',
    name: 'Badge',
    description:
      'Displays the state a row or cell reports, such as online, queued, or fault.',
    sourceFile: 'Badge.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/badge.png?v=3',
  },
  {
    slug: 'button',
    name: 'Button',
    description:
      'Triggers an action or event, at the level of emphasis the action deserves.',
    sourceFile: 'Button.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/button.png?v=4',
  },
  {
    slug: 'card',
    name: 'Card',
    description:
      'Frames a region of related content with corner brackets instead of a border.',
    sourceFile: 'Card.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/card.png?v=4',
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    description:
      'Selects any number of options from a set, or turns a single one on and off.',
    sourceFile: 'Checkbox.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/checkbox.png?v=3',
  },
  {
    slug: 'choice-card',
    name: 'Choice Card',
    description:
      'Presents an option as a whole selectable card with a title and a supporting line.',
    sourceFile: 'ChoiceCard.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda-pro/choice-card.png?v=1',
  },
  {
    slug: 'corner-markers',
    name: 'Corner Markers',
    description:
      'Frames any container with the four L-shaped brackets that stand in for a border.',
    sourceFile: 'CornerMarkers.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/corner-markers.png?v=3',
  },
  {
    slug: 'date-range-picker',
    name: 'Date Range Picker',
    description:
      'Selects a start and an end date from a calendar popover.',
    sourceFile: 'DateRangePicker.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/date-range-picker.png?v=4',
  },
  {
    slug: 'drawer',
    name: 'Drawer',
    description:
      'Displays content in a panel that slides in from the edge of the screen.',
    sourceFile: 'Drawer.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/drawer.png?v=3',
  },
  {
    slug: 'empty-state',
    name: 'Empty State',
    description:
      'Explains why a region has nothing to show, and offers the way out.',
    sourceFile: 'EmptyState.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/empty-state.png?v=3',
  },
  {
    slug: 'chart-funnel',
    name: 'Chart Funnel',
    description:
      'Charts how much of a population survives each stage of a sequence.',
    sourceFile: 'FunnelChart.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda-pro/chart-funnel.png?v=1',
  },
  {
    slug: 'chart-metric',
    name: 'Chart Metric',
    description:
      'Charts one measurement over time in a panel that frames itself.',
    sourceFile: 'MetricChart.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/metric-chart.png?v=1',
  },
  {
    slug: 'chart-radar',
    name: 'Chart Radar',
    description:
      'Compares several series across one shared set of axes.',
    sourceFile: 'RadarChart.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/radar-chart.png?v=3',
  },
  {
    slug: 'chart-trend',
    name: 'Chart Trend',
    description:
      'Charts several series over time as lines, areas, or bars.',
    sourceFile: 'TrendChart.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/trend-chart.png?v=3',
  },
  {
    slug: 'gauge',
    name: 'Gauge',
    description:
      'Displays a single bounded reading as a radial arc.',
    sourceFile: 'Gauge.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/gauge.png?v=1',
  },
  {
    slug: 'heat-grid',
    name: 'Heat Grid',
    description:
      'Displays a single bounded reading as a matrix of cells that fill as it rises.',
    sourceFile: 'HeatGrid.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/heat-grid.png?v=4',
  },
  {
    slug: 'icon-button',
    name: 'Icon Button',
    description:
      'Triggers an action with an icon alone, for controls whose glyph reads as the label.',
    sourceFile: 'IconButton.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/icon-button.png?v=3',
  },
  {
    slug: 'input',
    name: 'Input',
    description:
      'Collects a single line of text.',
    sourceFile: 'Input.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/input.png?v=4',
  },
  {
    slug: 'waveform',
    name: 'Waveform',
    description:
      'Displays a live signal as a moving trace, showing that a feed is running.',
    sourceFile: 'Waveform.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/waveform.png?v=1',
  },
  {
    slug: 'media-card',
    name: 'Media Card',
    description:
      'Presents an item on its own artwork, for content the image identifies.',
    sourceFile: 'MediaCard.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/media-card.png?v=1',
  },
  {
    slug: 'table-basic',
    name: 'Table Basic',
    description:
      'Builds a table row by row, for cells that need their own structure.',
    sourceFile: 'Table.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/table.png?v=3',
  },
  {
    slug: 'table-data',
    name: 'Table Data',
    description:
      'Renders a table from a column definition and a set of rows.',
    sourceFile: 'DataTable.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/data-table.png?v=2',
  },
  {
    slug: 'music-player',
    name: 'Music Player',
    description:
      'Controls playback in one bar: track identity, transport, and a scrub slider.',
    sourceFile: 'MusicPlayer.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/music-player.png?v=2',
  },
  {
    slug: 'nav-item',
    name: 'Nav Item',
    description:
      'Links to one destination in a sidebar, in full or icon-only form.',
    sourceFile: 'NavItem.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/nav-item.png?v=4',
  },
  {
    slug: 'panel-header',
    name: 'Panel Header',
    description:
      'Titles a dashboard panel and holds the actions that belong to it.',
    sourceFile: 'PanelHeader.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/panel-header.png?v=3',
  },
  {
    slug: 'panel-menu',
    name: 'Panel Menu',
    description:
      "Collects a panel's secondary actions behind a kebab trigger.",
    sourceFile: 'PanelMenu.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/panel-menu.png?v=4',
  },
  {
    slug: 'planet',
    name: 'Planet',
    description:
      'Renders a slowly rotating particle sphere as a hero object.',
    sourceFile: 'Planet.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/planet.png?v=1',
  },
  {
    slug: 'progress-bar',
    name: 'Progress Bar',
    description:
      'Displays a single bounded reading as a horizontal meter.',
    sourceFile: 'ProgressBar.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/progress-bar.png?v=4',
  },
  {
    slug: 'radio',
    name: 'Radio',
    description:
      'Selects exactly one option from a small set that stays visible.',
    sourceFile: 'Radio.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/radio.png?v=3',
  },
  {
    slug: 'search-field',
    name: 'Search Field',
    description:
      'Collects a search query, with room for a keyboard shortcut hint.',
    sourceFile: 'SearchField.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/search-field.png?v=4',
  },
  {
    slug: 'segmented-control',
    name: 'Segmented Control',
    description:
      'Switches between a few mutually exclusive views or modes.',
    sourceFile: 'SegmentedControl.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/segmented-control.png?v=3',
  },
  {
    slug: 'sidebar',
    name: 'Sidebar',
    description:
      'Navigates a console from a left rail that folds between labelled rows and icons.',
    sourceFile: 'Sidebar.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda-pro/sidebar.png?v=1',
  },
  {
    slug: 'slider',
    name: 'Slider',
    description:
      'Sets one continuous value by dragging along a track.',
    sourceFile: 'Slider.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/slider.png?v=4',
  },
  {
    slug: 'spinner',
    name: 'Spinner',
    description:
      'Signals that work is running when the remaining time is unknown.',
    sourceFile: 'Spinner.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/spinner.png?v=3',
  },
  {
    slug: 'stat-tile',
    name: 'Stat Tile',
    description:
      'Displays one headline number with its unit and its change.',
    sourceFile: 'StatTile.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/stat-tile.png?v=3',
  },
  {
    slug: 'tag',
    name: 'Tag',
    description:
      'Labels content for categorizing or filtering, and can be dismissed.',
    sourceFile: 'Tag.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/tag.png?v=3',
  },
  {
    slug: 'textarea',
    name: 'Textarea',
    description:
      'Collects text that runs to more than one line.',
    sourceFile: 'Textarea.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/textarea.png?v=3',
  },
  {
    slug: 'toggle',
    name: 'Toggle',
    description:
      'Switches a setting that takes effect the moment it flips.',
    sourceFile: 'Toggle.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/toggle.png?v=3',
  },
  {
    slug: 'tooltip',
    name: 'Tooltip',
    description:
      'Names a control that carries no text of its own, on hover or focus.',
    sourceFile: 'Tooltip.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/tooltip.png?v=4',
  },
  {
    slug: 'top-bar',
    name: 'Top Bar',
    description:
      'Spans the top of a dashboard with the brand, the nav, and the account cluster.',
    sourceFile: 'TopBar.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda-pro/top-bar.png?v=1',
  },
  {
    slug: 'user-card',
    name: 'User Card',
    description:
      'Opens the account menu from a row that names the signed-in user and their role.',
    sourceFile: 'UserCard.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/user-card.png?v=3',
  },
  {
    slug: 'user-menu',
    name: 'User Menu',
    description:
      "Opens the account menu from the signed-in user's avatar.",
    sourceFile: 'UserMenu.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda/user-menu.png?v=3',
  },

  // Objects — the system's sanctioned decorative class (Planet is its first
  // member, above). Monochrome, transparent ground, one per surface.
  {
    slug: 'orb',
    name: 'Orb',
    description:
      'Sweeps one circle through a full turn into a sphere of hairline loops.',
    sourceFile: 'Orb.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda-pro/orb.png?v=1',
  },
  {
    slug: 'nodes',
    name: 'Nodes',
    description:
      'Spreads light across a hairline lattice, one crossing igniting the next.',
    sourceFile: 'Nodes.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda-pro/nodes.png?v=1',
  },
  {
    slug: 'burst',
    name: 'Burst',
    description:
      'Draws hundreds of hairlines converging on a single focal point.',
    sourceFile: 'Burst.tsx',
    image: 'https://ik.imagekit.io/aitoolkit/andromeda-pro/burst.png?v=1',
  },
]

// Per-file registry-slug overrides. Button's natural slug (andromeda-button)
// is owned by the free standalone in components-workspace/andromeda-button/,
// so the design-system Button gets its own slug. Source of truth:
// scripts/lib/design-systems.config.mjs `slugOverrides` — mirrored here (typed,
// Node-free) for use by the component page (forward) and the Saved list
// (reverse, to resolve a saved registry slug back to its page + display name).
const ANDROMEDA_REGISTRY_SLUG_OVERRIDES: Record<string, string> = {
  // Andromeda Pro owns the `andromeda-pro-` namespace, so Button needs no
  // override here: nothing collides with the free standalone that owns
  // `andromeda-button`. What DOES still need overriding is every page slug that
  // diverges from its source FILENAME, because the generator derives the
  // registry slug from the filename. Pointing these at `andromeda-*` handed
  // buyers an install command for Andromeda Legacy's free MIT component.
  //
  // The two tables were renamed for the docs site so they read as a
  // pair; the vault filenames did not move.
  'table-basic': 'andromeda-pro-table',
  'table-data': 'andromeda-pro-data-table',
  // Same for the charts, renamed so the family reads together.
  'chart-funnel': 'andromeda-pro-funnel-chart',
  'chart-metric': 'andromeda-pro-metric-chart',
  'chart-radar': 'andromeda-pro-radar-chart',
  'chart-trend': 'andromeda-pro-trend-chart',
}

export function andromedaRegistrySlug(pageSlug: string): string {
  return ANDROMEDA_REGISTRY_SLUG_OVERRIDES[pageSlug] ?? `andromeda-pro-${pageSlug}`
}

export function andromedaPageSlug(registrySlug: string): string {
  const override = Object.entries(ANDROMEDA_REGISTRY_SLUG_OVERRIDES).find(([, v]) => v === registrySlug)
  return override ? override[0] : registrySlug.replace(/^andromeda-pro-/, '')
}

export function getAndromedaComponentMeta(registrySlug: string): AndromedaComponentMeta | undefined {
  const pageSlug = andromedaPageSlug(registrySlug)
  return ANDROMEDA_COMPONENT_META.find((c) => c.slug === pageSlug)
}

export type AndromedaTemplateMeta = {
  /** Route folder under /design-systems/andromeda/templates/ */
  folder: string
  name: string
  description: string
  /** ImageKit card art (base URL; consumers add their own tr= transform). */
  image: string
}

// ImageKit template art — filenames kept exactly as uploaded (capitalized, with
// spaces), so they're URL-encoded when building the src. Mirror of the same map
// in overview-b/overview-data.ts.
const TEMPLATE_ART: Record<string, string> = {
  'mission-control': 'Mission control.png',
  'service-order': 'Service order.png',
  'resource-planning': 'Resource planning.png',
  'signal-room': 'Signal Room.png',
  // City Operations is Pro-only, so it has no free-Andromeda poster to pair
  // with and points straight at the Pro file the overview also serves.
  'city-operations': 'City_operations_pro.png',
}
const templateArt = (folder: string) =>
  `https://ik.imagekit.io/aitoolkit/andromeda/templates/${encodeURIComponent(TEMPLATE_ART[folder] ?? '')}`

// Static 5-entry mirror of the andromeda `templates` in
// scripts/lib/design-systems.config.mjs (folder = registry slug minus the
// "andromeda-" prefix, matching the route dirs). Kept here rather than derived
// from the .mjs config so this stays a typed, Node-free, client-safe module.
// Blurbs are the same copy the overview (overview-b/overview-data.ts) shows on its template cards.
// Keep the two in sync (fixed set, changes rarely).
export const ANDROMEDA_TEMPLATE_META: AndromedaTemplateMeta[] = [
  {
    folder: 'city-operations',
    name: 'City Operations',
    description:
      'A city operations centre: a live incident map, air and traffic readings, an alert queue, and response trends.',
    image: templateArt('city-operations'),
  },
  {
    folder: 'signal-room',
    name: 'Signal Room',
    description:
      'A broadcast control room: now-transmitting, channel levels, mixes, and a transport bar.',
    image: templateArt('signal-room'),
  },
  {
    folder: 'mission-control',
    name: 'Mission Control',
    description:
      'Spacecraft telemetry: live altitude, vehicle roster, comms log, and a system-status readout in one mission view.',
    image: templateArt('mission-control'),
  },
  {
    folder: 'service-order',
    name: 'Service Order',
    description: 'A field-service work order: an SLA gauge, line items, and order metadata.',
    image: templateArt('service-order'),
  },
  {
    folder: 'resource-planning',
    name: 'Resource Planning',
    description:
      'Capacity, allocation trend, and request triage across teams on one planning board.',
    image: templateArt('resource-planning'),
  },
]

export const ANDROMEDA_META = {
  name: 'Andromeda Pro',
  tagline: 'Sci-fi blueprint design system',
  description:
    'One typeface. Transparent surfaces over a void background. 1px corner brackets instead of card borders. Blue accent. A domain-agnostic visual language — works for fintech, crypto, AI, ops, dev tools, and anywhere an editorial, technical, high-density feel fits.',
  font: 'JetBrains Mono',
  accent: '#2DD4BF',
  void: '#0E0E0F',
} as const
