// Pure metadata for Andromeda components. NO Node APIs here — this file is
// safe to import from client components (sidebar, demos, etc.). The full
// registry (which reads source files via `fs`) lives in
// `andromeda-registry.ts` and imports this file as the metadata source.

import { TEMPLATE_ART_VERSION } from '../../lib/imagekit'

export type AndromedaComponentMeta = {
  slug: string
  name: string
  description: string
  sourceFile: string
  image?: string
  imageLight?: string
}

// Hero card art, one shot per theme (scripts/screenshot-andromeda-hero.mjs). Bump on a reshoot.
const HERO_VERSION = 1
const heroShot = (slug: string, theme: 'dark' | 'light') =>
  `https://ik.imagekit.io/aitoolkit/andromeda-pro/hero/${slug}-${theme}.png?v=${HERO_VERSION}`

export const ANDROMEDA_COMPONENT_META: AndromedaComponentMeta[] = [
  {
    slug: 'accordion',
    name: 'Accordion',
    description:
      'Lists questions that each open their answer below them, one at a time or several at once.',
    sourceFile: 'Accordion.tsx',
    image: heroShot('accordion', 'dark'),
    imageLight: heroShot('accordion', 'light'),
  },
  {
    slug: 'alert',
    name: 'Alert',
    description:
      'Displays a status message in the flow of the page, at a severity from note to fault.',
    sourceFile: 'Alert.tsx',
    image: heroShot('alert', 'dark'),
    imageLight: heroShot('alert', 'light'),
  },
  {
    slug: 'artifact',
    name: 'Artifact',
    description:
      'Frames something an agent produced, such as a table or a chart, under a title bar with its actions.',
    sourceFile: 'Artifact.tsx',
    image: heroShot('artifact', 'dark'),
    imageLight: heroShot('artifact', 'light'),
  },
  {
    slug: 'avatar',
    name: 'Avatar',
    description:
      'Represents a person as a square image tile that falls back to their initials.',
    sourceFile: 'Avatar.tsx',
    image: heroShot('avatar', 'dark'),
    imageLight: heroShot('avatar', 'light'),
  },
  {
    slug: 'badge',
    name: 'Badge',
    description:
      'Displays the state a row or cell reports, such as online, queued, or fault.',
    sourceFile: 'Badge.tsx',
    image: heroShot('badge', 'dark'),
    imageLight: heroShot('badge', 'light'),
  },
  {
    slug: 'bento-grid',
    name: 'Bento Grid',
    description:
      'Lays out cards on a grid where one can span several columns and cards in a row line up their parts.',
    sourceFile: 'BentoGrid.tsx',
    image: heroShot('bento-grid', 'dark'),
    imageLight: heroShot('bento-grid', 'light'),
  },
  {
    slug: 'button',
    name: 'Button',
    description:
      'Triggers an action or event, at the level of emphasis the action deserves.',
    sourceFile: 'Button.tsx',
    image: heroShot('button', 'dark'),
    imageLight: heroShot('button', 'light'),
  },
  {
    slug: 'card',
    name: 'Card',
    description:
      'Frames a region of related content with corner brackets instead of a border.',
    sourceFile: 'Card.tsx',
    image: heroShot('card', 'dark'),
    imageLight: heroShot('card', 'light'),
  },
  {
    slug: 'checkbox',
    name: 'Checkbox',
    description:
      'Selects any number of options from a set, or turns a single one on and off.',
    sourceFile: 'Checkbox.tsx',
    image: heroShot('checkbox', 'dark'),
    imageLight: heroShot('checkbox', 'light'),
  },
  {
    slug: 'choice-card',
    name: 'Choice Card',
    description:
      'Presents an option as a whole selectable card with a title and a supporting line.',
    sourceFile: 'ChoiceCard.tsx',
    image: heroShot('choice-card', 'dark'),
    imageLight: heroShot('choice-card', 'light'),
  },
  {
    slug: 'collapsible',
    name: 'Collapsible',
    description:
      'Opens and closes the section under a one-line row, for detail the reader may want.',
    sourceFile: 'Collapsible.tsx',
    image: heroShot('collapsible', 'dark'),
    imageLight: heroShot('collapsible', 'light'),
  },
  {
    slug: 'combobox',
    name: 'Combobox',
    description:
      'Finds one thing in a known set as you type, from a list that opens under the field.',
    sourceFile: 'Combobox.tsx',
    image: heroShot('combobox', 'dark'),
    imageLight: heroShot('combobox', 'light'),
  },
  {
    slug: 'corner-markers',
    name: 'Corner Markers',
    description:
      'Frames any container with the four L-shaped brackets that stand in for a border.',
    sourceFile: 'CornerMarkers.tsx',
    image: heroShot('corner-markers', 'dark'),
    imageLight: heroShot('corner-markers', 'light'),
  },
  {
    slug: 'date-range-picker',
    name: 'Date Range Picker',
    description:
      'Selects a start and an end date from a calendar popover.',
    sourceFile: 'DateRangePicker.tsx',
    image: heroShot('date-range-picker', 'dark'),
    imageLight: heroShot('date-range-picker', 'light'),
  },
  {
    slug: 'drawer',
    name: 'Drawer',
    description:
      'Displays content in a panel that slides in from the edge of the screen.',
    sourceFile: 'Drawer.tsx',
    image: heroShot('drawer', 'dark'),
    imageLight: heroShot('drawer', 'light'),
  },
  {
    slug: 'empty-state',
    name: 'Empty State',
    description:
      'Explains why a region has nothing to show, and offers the way out.',
    sourceFile: 'EmptyState.tsx',
    image: heroShot('empty-state', 'dark'),
    imageLight: heroShot('empty-state', 'light'),
  },
  {
    slug: 'footer',
    name: 'Footer',
    description:
      'Closes a page with the brand, its secondary links in titled columns, and an optional large name.',
    sourceFile: 'Footer.tsx',
    image: heroShot('footer', 'dark'),
    imageLight: heroShot('footer', 'light'),
  },
  {
    slug: 'chart-funnel',
    name: 'Chart Funnel',
    description:
      'Charts how much of a population survives each stage of a sequence.',
    sourceFile: 'FunnelChart.tsx',
    image: heroShot('chart-funnel', 'dark'),
    imageLight: heroShot('chart-funnel', 'light'),
  },
  {
    slug: 'chart-metric',
    name: 'Chart Metric',
    description:
      'Charts one measurement over time in a panel that frames itself.',
    sourceFile: 'MetricChart.tsx',
    image: heroShot('chart-metric', 'dark'),
    imageLight: heroShot('chart-metric', 'light'),
  },
  {
    slug: 'chart-radar',
    name: 'Chart Radar',
    description:
      'Compares several series across one shared set of axes.',
    sourceFile: 'RadarChart.tsx',
    image: heroShot('chart-radar', 'dark'),
    imageLight: heroShot('chart-radar', 'light'),
  },
  {
    slug: 'chart-trend',
    name: 'Chart Trend',
    description:
      'Charts several series over time as lines, areas, or bars.',
    sourceFile: 'TrendChart.tsx',
    image: heroShot('chart-trend', 'dark'),
    imageLight: heroShot('chart-trend', 'light'),
  },
  {
    slug: 'gauge',
    name: 'Gauge',
    description:
      'Displays a single bounded reading as a radial arc.',
    sourceFile: 'Gauge.tsx',
    image: heroShot('gauge', 'dark'),
    imageLight: heroShot('gauge', 'light'),
  },
  {
    slug: 'heat-grid',
    name: 'Heat Grid',
    description:
      'Displays a single bounded reading as a matrix of cells that fill as it rises.',
    sourceFile: 'HeatGrid.tsx',
    image: heroShot('heat-grid', 'dark'),
    imageLight: heroShot('heat-grid', 'light'),
  },
  {
    slug: 'icon-button',
    name: 'Icon Button',
    description:
      'Triggers an action with an icon alone, for controls whose glyph reads as the label.',
    sourceFile: 'IconButton.tsx',
    image: heroShot('icon-button', 'dark'),
    imageLight: heroShot('icon-button', 'light'),
  },
  {
    slug: 'input',
    name: 'Input',
    description:
      'Collects a single line of text.',
    sourceFile: 'Input.tsx',
    image: heroShot('input', 'dark'),
    imageLight: heroShot('input', 'light'),
  },
  {
    slug: 'item',
    name: 'Item',
    description:
      'Lays out one row of a list or a menu: a glyph, a name with a line under it, and its actions.',
    sourceFile: 'Item.tsx',
    image: heroShot('item', 'dark'),
    imageLight: heroShot('item', 'light'),
  },
  {
    slug: 'waveform',
    name: 'Waveform',
    description:
      'Displays a live signal as a moving trace, showing that a feed is running.',
    sourceFile: 'Waveform.tsx',
    image: heroShot('waveform', 'dark'),
    imageLight: heroShot('waveform', 'light'),
  },
  {
    slug: 'logo-cloud',
    name: 'Logo Cloud',
    description:
      'Shows the names or logos of customers in a slow moving band under a short line of text.',
    sourceFile: 'LogoCloud.tsx',
    image: heroShot('logo-cloud', 'dark'),
    imageLight: heroShot('logo-cloud', 'light'),
  },
  {
    slug: 'marquee',
    name: 'Marquee',
    description:
      'Loops a row of items slowly across its width, so a long list shows without taking room.',
    sourceFile: 'Marquee.tsx',
    image: heroShot('marquee', 'dark'),
    imageLight: heroShot('marquee', 'light'),
  },
  {
    slug: 'media-card',
    name: 'Media Card',
    description:
      'Presents an item on its own artwork, for content the image identifies.',
    sourceFile: 'MediaCard.tsx',
    image: heroShot('media-card', 'dark'),
    imageLight: heroShot('media-card', 'light'),
  },
  {
    slug: 'message',
    name: 'Message',
    description:
      'Shows one turn of a conversation, from the user or from the assistant, with its actions.',
    sourceFile: 'Message.tsx',
    image: heroShot('message', 'dark'),
    imageLight: heroShot('message', 'light'),
  },
  {
    slug: 'table-basic',
    name: 'Table Basic',
    description:
      'Builds a table row by row, for cells that need their own structure. On narrow screens, it scrolls sideways; use Data Table for phone layouts.',
    sourceFile: 'Table.tsx',
    image: heroShot('table-basic', 'dark'),
    imageLight: heroShot('table-basic', 'light'),
  },
  {
    slug: 'table-data',
    name: 'Table Data',
    description:
      'Renders a table from a column definition and a set of rows.',
    sourceFile: 'DataTable.tsx',
    image: heroShot('table-data', 'dark'),
    imageLight: heroShot('table-data', 'light'),
  },
  {
    slug: 'music-player',
    name: 'Music Player',
    description:
      'Controls playback in one bar: track identity, transport, and a scrub slider.',
    sourceFile: 'MusicPlayer.tsx',
    image: heroShot('music-player', 'dark'),
    imageLight: heroShot('music-player', 'light'),
  },
  {
    slug: 'navbar',
    name: 'Navbar',
    description:
      'Keeps the brand, page links and main action at the top of a page, and marks the section you are reading.',
    sourceFile: 'Navbar.tsx',
    image: heroShot('navbar', 'dark'),
    imageLight: heroShot('navbar', 'light'),
  },
  {
    slug: 'nav-item',
    name: 'Nav Item',
    description:
      'Links to one destination in a sidebar, in full or icon-only form.',
    sourceFile: 'NavItem.tsx',
    image: heroShot('nav-item', 'dark'),
    imageLight: heroShot('nav-item', 'light'),
  },
  {
    slug: 'panel-header',
    name: 'Panel Header',
    description:
      'Titles a dashboard panel and holds the actions that belong to it.',
    sourceFile: 'PanelHeader.tsx',
    image: heroShot('panel-header', 'dark'),
    imageLight: heroShot('panel-header', 'light'),
  },
  {
    slug: 'panel-menu',
    name: 'Panel Menu',
    description:
      "Collects a panel's secondary actions behind a kebab trigger.",
    sourceFile: 'PanelMenu.tsx',
    image: heroShot('panel-menu', 'dark'),
    imageLight: heroShot('panel-menu', 'light'),
  },
  {
    slug: 'payment-card',
    name: 'Payment Card',
    description:
      'Shows a payment card as the card itself, with its name, last four digits and expiry, and tilts toward the pointer.',
    sourceFile: 'PaymentCard.tsx',
    image: heroShot('payment-card', 'dark'),
    imageLight: heroShot('payment-card', 'light'),
  },
  {
    slug: 'planet',
    name: 'Planet',
    description:
      'Renders a slowly rotating particle sphere as a hero object.',
    sourceFile: 'Planet.tsx',
    image: heroShot('planet', 'dark'),
    imageLight: heroShot('planet', 'light'),
  },
  {
    slug: 'popover',
    name: 'Popover',
    description:
      'Floats a panel of mixed content off a trigger, such as a picker with a setting under it.',
    sourceFile: 'Popover.tsx',
    image: heroShot('popover', 'dark'),
    imageLight: heroShot('popover', 'light'),
  },
  {
    slug: 'pricing-card',
    name: 'Pricing Card',
    description:
      'Shows one plan with its price, what it includes and the button to choose it, lined up with the plans beside it.',
    sourceFile: 'PricingCard.tsx',
    image: heroShot('pricing-card', 'dark'),
    imageLight: heroShot('pricing-card', 'light'),
  },
  {
    slug: 'progress-bar',
    name: 'Progress Bar',
    description:
      'Displays a single bounded reading as a horizontal meter.',
    sourceFile: 'ProgressBar.tsx',
    image: heroShot('progress-bar', 'dark'),
    imageLight: heroShot('progress-bar', 'light'),
  },
  {
    slug: 'prompt-input',
    name: 'Prompt Input',
    description:
      'Collects a prompt in a growing field, with its tools and one Send that becomes Stop.',
    sourceFile: 'PromptInput.tsx',
    image: heroShot('prompt-input', 'dark'),
    imageLight: heroShot('prompt-input', 'light'),
  },
  {
    slug: 'radio',
    name: 'Radio',
    description:
      'Selects exactly one option from a small set that stays visible.',
    sourceFile: 'Radio.tsx',
    image: heroShot('radio', 'dark'),
    imageLight: heroShot('radio', 'light'),
  },
  {
    slug: 'search-field',
    name: 'Search Field',
    description:
      'Collects a search query, with room for a keyboard shortcut hint.',
    sourceFile: 'SearchField.tsx',
    image: heroShot('search-field', 'dark'),
    imageLight: heroShot('search-field', 'light'),
  },
  {
    slug: 'section-heading',
    name: 'Section Heading',
    description:
      'Opens a page section with a short label, a title and a sentence that says what the section covers.',
    sourceFile: 'SectionHeading.tsx',
    image: heroShot('section-heading', 'dark'),
    imageLight: heroShot('section-heading', 'light'),
  },
  {
    slug: 'segmented-control',
    name: 'Segmented Control',
    description:
      'Switches between a few mutually exclusive views or modes.',
    sourceFile: 'SegmentedControl.tsx',
    image: heroShot('segmented-control', 'dark'),
    imageLight: heroShot('segmented-control', 'light'),
  },
  {
    slug: 'sidebar',
    name: 'Sidebar',
    description:
      'Navigates a console from a left rail that folds between labelled rows and icons.',
    sourceFile: 'Sidebar.tsx',
    image: heroShot('sidebar', 'dark'),
    imageLight: heroShot('sidebar', 'light'),
  },
  {
    slug: 'skeleton',
    name: 'Skeleton',
    description:
      'Holds the place of text that is still loading, as bars a single light passes over.',
    sourceFile: 'Skeleton.tsx',
    image: heroShot('skeleton', 'dark'),
    imageLight: heroShot('skeleton', 'light'),
  },
  {
    slug: 'slider',
    name: 'Slider',
    description:
      'Sets one continuous value by dragging along a track.',
    sourceFile: 'Slider.tsx',
    image: heroShot('slider', 'dark'),
    imageLight: heroShot('slider', 'light'),
  },
  {
    slug: 'spinner',
    name: 'Spinner',
    description:
      'Signals that work is running when the remaining time is unknown.',
    sourceFile: 'Spinner.tsx',
    image: heroShot('spinner', 'dark'),
    imageLight: heroShot('spinner', 'light'),
  },
  {
    slug: 'stepper',
    name: 'Stepper',
    description:
      'Shows a run of steps in order, marking each one done, running or still to come.',
    sourceFile: 'Stepper.tsx',
    image: heroShot('stepper', 'dark'),
    imageLight: heroShot('stepper', 'light'),
  },
  {
    slug: 'stat-tile',
    name: 'Stat Tile',
    description:
      'Displays one headline number with its unit and its change.',
    sourceFile: 'StatTile.tsx',
    image: heroShot('stat-tile', 'dark'),
    imageLight: heroShot('stat-tile', 'light'),
  },
  {
    slug: 'strength-meter',
    name: 'Strength Meter',
    description:
      'Reports how strong a password is, in three steps and one word.',
    sourceFile: 'StrengthMeter.tsx',
    image: heroShot('strength-meter', 'dark'),
    imageLight: heroShot('strength-meter', 'light'),
  },
  {
    slug: 'suggestion',
    name: 'Suggestion',
    description:
      'Offers a proposed next move the reader can take, such as a follow-up prompt or a task lane.',
    sourceFile: 'Suggestion.tsx',
    image: heroShot('suggestion', 'dark'),
    imageLight: heroShot('suggestion', 'light'),
  },
  {
    slug: 'tabs',
    name: 'Tabs',
    description:
      'Splits content into named panels and shows one at a time, as a row of tabs or a list whose rows can each carry a sentence.',
    sourceFile: 'Tabs.tsx',
    image: heroShot('tabs', 'dark'),
    imageLight: heroShot('tabs', 'light'),
  },
  {
    slug: 'tag',
    name: 'Tag',
    description:
      'Labels content for categorizing or filtering, and can be dismissed.',
    sourceFile: 'Tag.tsx',
    image: heroShot('tag', 'dark'),
    imageLight: heroShot('tag', 'light'),
  },
  {
    slug: 'textarea',
    name: 'Textarea',
    description:
      'Collects text that runs to more than one line.',
    sourceFile: 'Textarea.tsx',
    image: heroShot('textarea', 'dark'),
    imageLight: heroShot('textarea', 'light'),
  },
  {
    slug: 'toggle',
    name: 'Toggle',
    description:
      'Switches a setting that takes effect the moment it flips.',
    sourceFile: 'Toggle.tsx',
    image: heroShot('toggle', 'dark'),
    imageLight: heroShot('toggle', 'light'),
  },
  {
    slug: 'tool',
    name: 'Tool',
    description:
      'Reports one agent step with its status and duration, and opens to show what it produced.',
    sourceFile: 'Tool.tsx',
    image: heroShot('tool', 'dark'),
    imageLight: heroShot('tool', 'light'),
  },
  {
    slug: 'tooltip',
    name: 'Tooltip',
    description:
      'Names a control that carries no text of its own, on hover or focus.',
    sourceFile: 'Tooltip.tsx',
    image: heroShot('tooltip', 'dark'),
    imageLight: heroShot('tooltip', 'light'),
  },
  {
    slug: 'top-bar',
    name: 'Top Bar',
    description:
      'Spans the top of a dashboard with the brand, the nav, and the account cluster.',
    sourceFile: 'TopBar.tsx',
    image: heroShot('top-bar', 'dark'),
    imageLight: heroShot('top-bar', 'light'),
  },
  {
    slug: 'user-card',
    name: 'User Card',
    description:
      'Opens the account menu from a row that names the signed-in user and their role.',
    sourceFile: 'UserCard.tsx',
    image: heroShot('user-card', 'dark'),
    imageLight: heroShot('user-card', 'light'),
  },
  {
    slug: 'user-menu',
    name: 'User Menu',
    description:
      "Opens the account menu from the signed-in user's avatar.",
    sourceFile: 'UserMenu.tsx',
    image: heroShot('user-menu', 'dark'),
    imageLight: heroShot('user-menu', 'light'),
  },

  // Objects — the system's sanctioned decorative class (Planet is its first
  // member, above). Monochrome, transparent ground, one per surface.
  {
    slug: 'orb',
    name: 'Orb',
    description:
      'Sweeps one circle through a full turn into a sphere of hairline loops.',
    sourceFile: 'Orb.tsx',
    image: heroShot('orb', 'dark'),
    imageLight: heroShot('orb', 'light'),
  },
  {
    slug: 'nodes',
    name: 'Nodes',
    description:
      'Spreads light across a hairline lattice, one crossing igniting the next.',
    sourceFile: 'Nodes.tsx',
    image: heroShot('nodes', 'dark'),
    imageLight: heroShot('nodes', 'light'),
  },
  {
    slug: 'burst',
    name: 'Burst',
    description:
      'Draws hundreds of hairlines converging on a single focal point.',
    sourceFile: 'Burst.tsx',
    image: heroShot('burst', 'dark'),
    imageLight: heroShot('burst', 'light'),
  },
  {
    slug: 'cube',
    name: 'Cube',
    description:
      'Turns a lattice of dots a quarter at a time, the way a puzzle cube twists.',
    sourceFile: 'Cube.tsx',
    image: heroShot('cube', 'dark'),
    imageLight: heroShot('cube', 'light'),
  },
]

// Per-file registry-slug overrides. Legacy's Button ships as
// andromeda-button-system (the old free standalone slug andromeda-button is
// retired and its URLs redirect there). Source of truth:
// scripts/lib/design-systems.config.mjs `slugOverrides` — mirrored here (typed,
// Node-free) for use by the component page (forward) and the Saved list
// (reverse, to resolve a saved registry slug back to its page + display name).
const ANDROMEDA_REGISTRY_SLUG_OVERRIDES: Record<string, string> = {
  // Andromeda Pro owns the `andromeda-pro-` namespace, so Button needs no
  // override here: nothing collides with Legacy's
  // `andromeda-button-system`. What DOES still need overriding is every page slug that
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

// ImageKit template art for the home browse grid. Underscored, because
// ImageKit rewrites a space in an uploaded filename to an underscore.
//
// The home grid serves the DARK poster in both themes, the same way every
// component card on that grid does. It is not a mirror of the overview page,
// which carries a light poster too. The four shared templates deliberately
// point at the LEGACY art here, as they always have.
const TEMPLATE_ART: Record<string, string> = {
  'mission-control': 'Mission_control_dark.png',
  'service-order': 'Service_order_dark.png',
  'resource-planning': 'Resource_planning_dark.png',
  'signal-room': 'Signal_Room_dark.png',
  // City Operations is Pro-only, so it has no free-Andromeda poster to pair
  // with and points straight at the Pro file the overview also serves.
  'city-operations': 'City_operations_pro_dark.png',
  // Sign In is Pro-only for the same reason: no Legacy counterpart to pair with.
  'sign-in': 'Sign_in_pro_dark.png',
  // Sign Up is Pro-only for the same reason.
  'sign-up': 'Sign_up_pro_dark.png',
  // Fintech Landing is Pro-only too: no Legacy counterpart to pair with.
  'fintech-landing': 'Fintech_landing_pro_dark.png',
  // AI Chat is Pro-only too: no Legacy counterpart to pair with.
  'ai-chat': 'Ai_chat_pro_dark.png',
}
const templateArt = (folder: string) => {
  const file = TEMPLATE_ART[folder] ?? ''
  if (!file) return ''
  return `https://ik.imagekit.io/aitoolkit/andromeda/templates/${encodeURIComponent(
    file,
  )}?v=${TEMPLATE_ART_VERSION}`
}

// Static mirror of the andromeda `templates` in
// scripts/lib/design-systems.config.mjs (folder = registry slug minus the
// "andromeda-" prefix, matching the route dirs). Kept here rather than derived
// from the .mjs config so this stays a typed, Node-free, client-safe module.
// Blurbs are the same copy the overview (overview-b/overview-data.ts) shows on its template cards.
// Keep the two in sync (fixed set, changes rarely).
export const ANDROMEDA_TEMPLATE_META: AndromedaTemplateMeta[] = [
  // Same order as the overview bento, the template switcher and the left menu.
  {
    folder: 'city-operations',
    name: 'City Operations',
    description:
      'A city operations centre: a live incident map, air and traffic readings, an alert queue, and response trends.',
    image: templateArt('city-operations'),
  },
  {
    folder: 'ai-chat',
    name: 'AI Chat',
    description:
      'A revenue desk that works by conversation: an agent scores the Q3 pipeline, shows its steps, and hands back a live risk artifact.',
    image: templateArt('ai-chat'),
  },
  {
    folder: 'sign-in',
    name: 'Sign In',
    description:
      'A whole authentication flow: create an account, sign in, recover a password and set a new one.',
    image: templateArt('sign-in'),
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
  {
    folder: 'sign-up',
    name: 'Sign Up',
    description:
      'The same authentication flow with no columns: a hairline lattice is the ground and the form floats on it.',
    image: templateArt('sign-up'),
  },
  {
    folder: 'fintech-landing',
    name: 'Fintech Landing',
    description:
      'A landing page for a money app: a product hero, use cases on tabs, live cards, security, plans and a journal, every section built from the system.',
    image: templateArt('fintech-landing'),
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
