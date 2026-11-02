// Pure metadata for Andromeda components. NO Node APIs here — this file is
// safe to import from client components (sidebar, demos, etc.). The full
// registry (which reads source files via `fs`) lives in
// `andromeda-registry.ts` and imports this file as the metadata source.

import { TEMPLATE_ART_BASE, TEMPLATE_ART_VERSION } from '../../lib/imagekit'

export type AndromedaComponentMeta = {
  slug: string
  name: string
  description: string
  sourceFile: string
  image?: string
  imageLight?: string
}

// Hero card art, one shot per theme (scripts/screenshot-andromeda-hero.mjs, SYSTEM=legacy). Bump on a reshoot.
// Folder: change both with scripts/upload-andromeda-hero.mjs (FOLDER).
const HERO_VERSION = 1
const heroShot = (slug: string, theme: 'dark' | 'light') =>
  `https://ik.imagekit.io/aitoolkit/andromeda/hero/${slug}-${theme}.png?v=${HERO_VERSION}`

export const ANDROMEDA_COMPONENT_META: AndromedaComponentMeta[] = [
  {
    slug: 'alert',
    name: 'Alert',
    description:
      'Banner-style status component for inline messages. Default, accent, warning, fault — each with its own per-variant color set. Severity-aware ARIA (warning and fault announce assertively, the rest politely) and compound parts: AlertIcon, AlertContent, AlertTitle, AlertDescription.',
    sourceFile: 'Alert.tsx',
    image: heroShot('alert', 'dark'),
    imageLight: heroShot('alert', 'light'),
  },
  {
    slug: 'avatar',
    name: 'Avatar',
    description:
      'Square tile in 3 sizes. Shows an image when src is provided, with a fallback to initials; optional status bar in 4 states.',
    sourceFile: 'Avatar.tsx',
    image: heroShot('avatar', 'dark'),
    imageLight: heroShot('avatar', 'light'),
  },
  {
    slug: 'badge',
    name: 'Badge',
    description:
      '6 variants for status, metric tags, and inline labels. A leading per-variant status dot blinks on a loop to carry the signal, and holds steady when reduced motion is requested.',
    sourceFile: 'Badge.tsx',
    image: heroShot('badge', 'dark'),
    imageLight: heroShot('badge', 'light'),
  },
  {
    slug: 'button',
    name: 'Button',
    description:
      '5 variants × 3 sizes with full hover, focus, active, and disabled coverage. shadcn/ui-aligned API: variant, size, asChild.',
    sourceFile: 'Button.tsx',
    image: heroShot('button', 'dark'),
    imageLight: heroShot('button', 'light'),
  },
  {
    slug: 'card',
    name: 'Card',
    description:
      'Compound primitive: Card / Header / Content / Footer / Title / Description. Corner brackets do the framing by default, with a bordered toggle for a continuous 1px border and a glow variant that adds an accent tint.',
    sourceFile: 'Card.tsx',
    image: heroShot('card', 'dark'),
    imageLight: heroShot('card', 'light'),
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    description:
      'Square boolean control. Controlled or uncontrolled. Inline label, accent fill on checked, an accent focus ring, a press scale, a pop-in on the checkmark, and a 40px touch target on coarse pointers.',
    sourceFile: 'Checkbox.tsx',
    image: heroShot('checkbox', 'dark'),
    imageLight: heroShot('checkbox', 'light'),
  },
  {
    slug: 'corner-markers',
    name: 'Corner Markers',
    description:
      'The defining motif. 4 L-shaped brackets at the corners of the nearest position:relative ancestor.',
    sourceFile: 'CornerMarkers.tsx',
    image: heroShot('corner-markers', 'dark'),
    imageLight: heroShot('corner-markers', 'light'),
  },
  {
    slug: 'date-range-picker',
    name: 'Date Range Picker',
    description:
      'Trigger chip + drop-down calendar panel. Anchor-then-confirm range selection with hover preview, Monday-first grid, ESC and click-outside to close.',
    sourceFile: 'DateRangePicker.tsx',
    image: heroShot('date-range-picker', 'dark'),
    imageLight: heroShot('date-range-picker', 'light'),
  },
  {
    slug: 'drawer',
    name: 'Drawer',
    description:
      'Slide-in panel on any side (left, right, top, or bottom), with focus trap and a size prop. Backdrop, ESC to close, body scroll lock, and the bracket motif. Portaled.',
    sourceFile: 'Drawer.tsx',
    image: heroShot('drawer', 'dark'),
    imageLight: heroShot('drawer', 'light'),
  },
  {
    slug: 'empty-state',
    name: 'Empty State',
    description:
      'Centered icon + uppercase mono title + sans description + optional action. Built on Card so it inherits brackets.',
    sourceFile: 'EmptyState.tsx',
    image: heroShot('empty-state', 'dark'),
    imageLight: heroShot('empty-state', 'light'),
  },
  {
    slug: 'gauge',
    name: 'Gauge',
    description:
      'Radial percentage gauge. A single measurement arc over a subtle track with a centered mono readout, in 3 sizes and 3 semantic color variants; the arc sweeps in and the value counts up in sync on first view.',
    sourceFile: 'Gauge.tsx',
    image: heroShot('gauge', 'dark'),
    imageLight: heroShot('gauge', 'light'),
  },
  {
    slug: 'heat-grid',
    name: 'Heat Grid',
    description:
      'A 2-D matrix fill gauge — the cousin of ProgressBar. Cells fill from the bottom-centre outward in a widening pyramid as the value rises, with a dim-to-bright accent ramp toward the wave front. Scroll-gated fill, optional percentage readout.',
    sourceFile: 'HeatGrid.tsx',
    image: heroShot('heat-grid', 'dark'),
    imageLight: heroShot('heat-grid', 'light'),
  },
  {
    slug: 'icon-button',
    name: 'Icon Button',
    description:
      'Square label-less companion to Button. Same variant + size vocabulary so it lines up with Button on the same baseline.',
    sourceFile: 'IconButton.tsx',
    image: heroShot('icon-button', 'dark'),
    imageLight: heroShot('icon-button', 'light'),
  },
  {
    slug: 'input',
    name: 'Input',
    description:
      'Optional uppercase mono label, optional left icon, default + error states. Border transitions on focus.',
    sourceFile: 'Input.tsx',
    image: heroShot('input', 'dark'),
    imageLight: heroShot('input', 'light'),
  },
  {
    slug: 'metric-chart',
    name: 'Metric Chart',
    description:
      'Self-framed single-series telemetry panel: corner brackets, kicker and title header, and a status badge around one fitted-domain area chart. The fitted y-domain keeps non-zero-floor readings like altitude or latency filling the plot instead of flattening into a sliver.',
    sourceFile: 'MetricChart.tsx',
    image: heroShot('metric-chart', 'dark'),
    imageLight: heroShot('metric-chart', 'light'),
  },
  {
    slug: 'waveform',
    name: 'Waveform',
    description:
      'Live signal waveform. A fluid SVG of a morphing polyline over mirrored level bars and a dashed centreline, animating to signal an active feed and holding a static frame when paused or reduced-motion. One primary series ink; colour only when the wave itself is the live measurement.',
    sourceFile: 'Waveform.tsx',
    image: heroShot('waveform', 'dark'),
    imageLight: heroShot('waveform', 'light'),
  },
  {
    slug: 'media-card',
    name: 'Media Card',
    description:
      'Image-backed content tile. A full-bleed photo under a soft bottom scrim, a mono code tag, title and meta, and one corner action — Play, a CTA, or none. Composes the Card frame with markers off, so the image carries the card identity.',
    sourceFile: 'MediaCard.tsx',
    image: heroShot('media-card', 'dark'),
    imageLight: heroShot('media-card', 'light'),
  },
  {
    slug: 'data-table',
    name: 'Data Table',
    description:
      'Configuration-driven data grid. Pass columns and rows to get hairline inset dividers, row hover, a selected-row accent edge, and a mobile column-priority fold that tucks low-priority columns behind a per-row info tooltip instead of a horizontal scrollbar.',
    sourceFile: 'DataTable.tsx',
    image: heroShot('data-table', 'dark'),
    imageLight: heroShot('data-table', 'light'),
  },
  {
    slug: 'music-player',
    name: 'Music Player',
    description:
      'Block-scale transport bar. Track identity, the full transport cluster, a scrub slider with elapsed and remaining readouts, and like, lyrics, and volume controls — assembled from Andromeda primitives, driven by props with a live demo fallback.',
    sourceFile: 'MusicPlayer.tsx',
    image: heroShot('music-player', 'dark'),
    imageLight: heroShot('music-player', 'light'),
  },
  {
    slug: 'nav-item',
    name: 'Nav Item',
    description:
      'Sidebar item with icon, active state, right-edge indicator dot. Mono label by default; sans available.',
    sourceFile: 'NavItem.tsx',
    image: heroShot('nav-item', 'dark'),
    imageLight: heroShot('nav-item', 'light'),
  },
  {
    slug: 'panel-header',
    name: 'Panel Header',
    description:
      'Title row for top-level dashboard panels. Sentence-case mono title on the left, optional actions slot on the right (PanelMenu, IconButton, Button). Inset bottom divider.',
    sourceFile: 'PanelHeader.tsx',
    image: heroShot('panel-header', 'dark'),
    imageLight: heroShot('panel-header', 'light'),
  },
  {
    slug: 'panel-menu',
    name: 'Panel Menu',
    description:
      'Kebab-trigger overflow menu for panel headers. Items can have icons, separators, and a single level of right-flyout submenu. Closes on outside click and Escape.',
    sourceFile: 'PanelMenu.tsx',
    image: heroShot('panel-menu', 'dark'),
    imageLight: heroShot('panel-menu', 'light'),
  },
  {
    slug: 'planet',
    name: 'Planet',
    description:
      'A slowly rotating 3D particle sphere built with Three.js, lit from one side, with every particle colored from the Andromeda accent ramp so it follows the system palette. The canvas is transparent, so drop it inside a Card and the void shows through.',
    sourceFile: 'Planet.tsx',
    image: heroShot('planet', 'dark'),
    imageLight: heroShot('planet', 'light'),
  },
  {
    slug: 'progress-bar',
    name: 'Progress Bar',
    description:
      '3 status variants. 30 skewed segments fill left to right with a scroll-gated staggered cascade.',
    sourceFile: 'ProgressBar.tsx',
    image: heroShot('progress-bar', 'dark'),
    imageLight: heroShot('progress-bar', 'light'),
  },
  {
    slug: 'radar-chart',
    name: 'Radar Chart',
    description:
      'Polygon spider chart for multi-axis system diagnostics. Single or multiple overlapping series.',
    sourceFile: 'RadarChart.tsx',
    image: heroShot('radar-chart', 'dark'),
    imageLight: heroShot('radar-chart', 'light'),
  },
  {
    slug: 'radio',
    name: 'Radio',
    description:
      'Mutually-exclusive square radio. Standalone or inside a RadioGroup wiring up name, value, onValueChange.',
    sourceFile: 'Radio.tsx',
    image: heroShot('radio', 'dark'),
    imageLight: heroShot('radio', 'light'),
  },
  {
    slug: 'search-field',
    name: 'Search Field',
    description:
      'Command-bar-style search input with optional ⌘-K shortcut chip. Five states — idle, hover, focus, text-inactive (placeholder), text-active (typed). Controlled or uncontrolled.',
    sourceFile: 'SearchField.tsx',
    image: heroShot('search-field', 'dark'),
    imageLight: heroShot('search-field', 'light'),
  },
  {
    slug: 'segmented-control',
    name: 'Segmented Control',
    description:
      'Row of icon-or-label buttons that share a single border. The active background slides between segments on selection. Sized sm/md/lg to match the row baseline.',
    sourceFile: 'SegmentedControl.tsx',
    image: heroShot('segmented-control', 'dark'),
    imageLight: heroShot('segmented-control', 'light'),
  },
  {
    slug: 'slider',
    name: 'Slider',
    description:
      'Custom horizontal range. Pointer drag + full keyboard support. ARIA-compliant.',
    sourceFile: 'Slider.tsx',
    image: heroShot('slider', 'dark'),
    imageLight: heroShot('slider', 'light'),
  },
  {
    slug: 'spinner',
    name: 'Spinner',
    description:
      'A 3x3 pixel grid with a snake-game trail cycling via a single CSS keyframe, running on the compositor. 4 color variants and 3 sizes.',
    sourceFile: 'Spinner.tsx',
    image: heroShot('spinner', 'dark'),
    imageLight: heroShot('spinner', 'light'),
  },
  {
    slug: 'stat-tile',
    name: 'Stat Tile',
    description:
      'Stat readout built on Card. Big numeric value, optional unit, optional ▲/▼ delta whose glyph carries the direction and whose color carries the judgment: set polarity to lower-is-better and a falling response time reads as the improvement it is, or none for a reading with no good/bad sense. Scroll-aware count-up on first view, a live mode that snaps to new values, a per-digit odometer roll (liveRoll), and a top-right code identifier prop.',
    sourceFile: 'StatTile.tsx',
    image: heroShot('stat-tile', 'dark'),
    imageLight: heroShot('stat-tile', 'light'),
  },
  {
    slug: 'tag',
    name: 'Tag',
    description:
      'Compact uppercase mono label. 4 variants. Optional dismiss button when onClose is provided.',
    sourceFile: 'Tag.tsx',
    image: heroShot('tag', 'dark'),
    imageLight: heroShot('tag', 'light'),
  },
  {
    slug: 'textarea',
    name: 'Textarea',
    description:
      'Multi-line counterpart to Input. Same border / focus / error behavior, vertical resize.',
    sourceFile: 'Textarea.tsx',
    image: heroShot('textarea', 'dark'),
    imageLight: heroShot('textarea', 'light'),
  },
  {
    slug: 'toggle',
    name: 'Toggle',
    description:
      'Sharp rectangular track + sliding rectangular thumb. Same vocabulary as Checkbox, but feels like a hardware switch.',
    sourceFile: 'Toggle.tsx',
    image: heroShot('toggle', 'dark'),
    imageLight: heroShot('toggle', 'light'),
  },
  {
    slug: 'table',
    name: 'Table',
    description:
      'Compound data-table primitive: Table / TableHead / TableBody / TableRow / TableHeader / TableCell. Sortable column headers, row hover highlight, selected-row accent edge. Render TableStyles once on the page to enable the hover styling. On narrow screens, it scrolls sideways; use DataTable for phone layouts.',
    sourceFile: 'Table.tsx',
    image: heroShot('table', 'dark'),
    imageLight: heroShot('table', 'light'),
  },
  {
    slug: 'tooltip',
    name: 'Tooltip',
    description:
      'Hover label for icon-only controls. Wraps any child, floats above or below, sharp corners, mono uppercase text. Shows on keyboard focus too, carries role="tooltip", and clamps itself away from the viewport edges.',
    sourceFile: 'Tooltip.tsx',
    image: heroShot('tooltip', 'dark'),
    imageLight: heroShot('tooltip', 'light'),
  },
  {
    slug: 'trend-chart',
    name: 'Trend Chart',
    description:
      'The canonical multi-series time-series chart. One configurable component that renders as line, area, or bar with a built-in mode toggle, custom tooltip, and toggleable legend. Series colour follows the multi-series hierarchy (baseline / live / context / threshold). Scroll-gated reveal.',
    sourceFile: 'TrendChart.tsx',
    image: heroShot('trend-chart', 'dark'),
    imageLight: heroShot('trend-chart', 'light'),
  },
  {
    slug: 'user-card',
    name: 'User Card',
    description:
      'Wider user trigger that shows avatar, name, and role alongside the chevron, the canonical bottom-of-sidebar identity card. Same popover as User Menu, with menu rows supplied by the caller via an `items` prop; opens upward by default and stretches to the card width.',
    sourceFile: 'UserCard.tsx',
    image: heroShot('user-card', 'dark'),
    imageLight: heroShot('user-card', 'light'),
  },
  {
    slug: 'user-menu',
    name: 'User Menu',
    description:
      'Avatar-trigger popover whose menu rows are supplied by the caller via an `items` prop. Designed for top-bar slots where space is tight. Opens downward and right-aligned by default; closes on outside-click and Escape.',
    sourceFile: 'UserMenu.tsx',
    image: heroShot('user-menu', 'dark'),
    imageLight: heroShot('user-menu', 'light'),
  },
]

// Per-file registry-slug overrides. The design-system Button ships as
// andromeda-button-system: that slug is what Saved rows and install commands
// already hold, and the retired andromeda-button install URL redirects to it. Source of truth:
// scripts/lib/design-systems.config.mjs `slugOverrides` — mirrored here (typed,
// Node-free) for use by the component page (forward) and the Saved list
// (reverse, to resolve a saved registry slug back to its page + display name).
const ANDROMEDA_REGISTRY_SLUG_OVERRIDES: Record<string, string> = { button: 'andromeda-button-system' }

export function andromedaRegistrySlug(pageSlug: string): string {
  return ANDROMEDA_REGISTRY_SLUG_OVERRIDES[pageSlug] ?? `andromeda-${pageSlug}`
}

export function andromedaPageSlug(registrySlug: string): string {
  const override = Object.entries(ANDROMEDA_REGISTRY_SLUG_OVERRIDES).find(([, v]) => v === registrySlug)
  return override ? override[0] : registrySlug.replace(/^andromeda-/, '')
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

// ImageKit template art for the home browse grid. Underscored, because
// ImageKit rewrites a space in an uploaded filename to an underscore.
//
// The home grid serves the DARK poster in both themes, the same way every
// component card on that grid does. It is not a mirror of the overview page,
// which carries a light poster too.
const TEMPLATE_ART: Record<string, string> = {
  'mission-control': 'Mission_control_dark.png',
  'service-order': 'Service_order_dark.png',
  'resource-planning': 'Resource_planning_dark.png',
  'signal-room': 'Signal_Room_dark.png',
}
const templateArt = (folder: string) =>
  `${TEMPLATE_ART_BASE}${encodeURIComponent(
    TEMPLATE_ART[folder] ?? '',
  )}?v=${TEMPLATE_ART_VERSION}`

// Static 4-entry mirror of the andromeda `templates` in
// scripts/lib/design-systems.config.mjs (folder = registry slug minus the
// "andromeda-" prefix, matching the route dirs). Kept here rather than derived
// from the .mjs config so this stays a typed, Node-free, client-safe module.
// Blurbs are the same copy AndromedaOverview.tsx shows on its template cards.
// Keep the two in sync (fixed set, changes rarely).
export const ANDROMEDA_TEMPLATE_META: AndromedaTemplateMeta[] = [
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
  {
    folder: 'signal-room',
    name: 'Signal Room',
    description:
      'A broadcast control room: now-transmitting, channel levels, mixes, and a transport bar.',
    image: templateArt('signal-room'),
  },
]

export const ANDROMEDA_META = {
  name: 'Andromeda Legacy',
  tagline: 'Sci-fi blueprint design system',
  description:
    'One typeface. Transparent surfaces over a void background. 1px corner brackets instead of card borders. Turquoise accent. A domain-agnostic visual language — works for fintech, crypto, AI, ops, dev tools, and anywhere an editorial, technical, high-density feel fits.',
  font: 'JetBrains Mono',
  accent: '#2DD4BF',
  void: '#0E0E0F',
} as const
