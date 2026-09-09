// The per-section copy from the system page. Titles and kickers are still the
// hand-written ones from the collapse of 2026-08-09; the descriptions are the
// one-line form, kept identical to the same slug's entry in andromeda-meta.ts
// so this preview and the public component pages never say different things.
// The sections themselves are a loop over the matrix declarations, so this is
// the only thing that stays hand-authored about them.
//
// allowOverflow mirrors the spec's own `overflow` flag and is derived from it
// at render time, not repeated here.
export type SectionCopy = { title: string; kicker?: string; description: string }

export const SECTION_COPY: Record<string, SectionCopy> = {
  'button': {
    title: "Button",
    description: "Triggers an action or event, at the level of emphasis the action deserves.",
  },
  'icon-button': {
    title: "Icon Button",
    description: "Triggers an action with an icon alone, for controls whose glyph reads as the label.",
  },
  'panel-header': {
    title: "Panel Header",
    description: "Titles a dashboard panel and holds the actions that belong to it.",
  },
  'panel-menu': {
    title: "Panel Menu",
    description: "Collects a panel's secondary actions behind a kebab trigger.",
  },
  'badge': {
    title: "Badge",
    description: "Displays the state a row or cell reports, such as online, queued, or fault.",
  },
  'avatar': {
    title: "Avatar",
    description: "Represents a person as a square image tile that falls back to their initials.",
  },
  'card': {
    title: "Card",
    description: "Frames a region of related content with corner brackets instead of a border.",
  },
  'corner-markers': {
    title: "Corner Markers",
    description: "Frames any container with the four L-shaped brackets that stand in for a border.",
  },
  'input': {
    title: "Input",
    description: "Collects a single line of text.",
  },
  'search-field': {
    title: "Search Field",
    description: "Collects a search query, with room for a keyboard shortcut hint.",
  },
  'nav-item': {
    title: "Nav Item",
    description: "Links to one destination in a sidebar, in full or icon-only form.",
  },
  'progress-bar': {
    title: "Progress Bar",
    description: "Displays a single bounded reading as a horizontal meter.",
  },
  'heat-grid': {
    title: "Heat Grid",
    description: "Displays a single bounded reading as a matrix of cells that fill as it rises.",
  },
  'stat-tile': {
    title: "Stat Tile",
    description: "Displays one headline number with its unit and its change.",
  },
  'tag': {
    title: "Tag",
    description: "Labels content for categorizing or filtering, and can be dismissed.",
  },
  'checkbox': {
    title: "Checkbox",
    description: "Selects any number of options from a set, or turns a single one on and off.",
  },
  'choice-card': {
    title: "Choice Card",
    description: "Presents an option as a whole selectable card with a title and a supporting line.",
  },
  'radio': {
    title: "Radio \u00b7 Choicebox",
    description: "Selects exactly one option from a small set that stays visible.",
  },
  'toggle': {
    title: "Toggle \u00b7 Switch",
    description: "Switches a setting that takes effect the moment it flips.",
  },
  'segmented-control': {
    title: "Segmented Control",
    description: "Switches between a few mutually exclusive views or modes.",
  },
  'date-range-picker': {
    title: "Date Range Picker",
    description: "Selects a start and an end date from a calendar popover.",
  },
  'spinner': {
    title: "Spinner",
    description: "Signals that work is running when the remaining time is unknown.",
  },
  'slider': {
    title: "Slider",
    description: "Sets one continuous value by dragging along a track.",
  },
  'textarea': {
    title: "Textarea",
    description: "Collects text that runs to more than one line.",
  },
  'alert': {
    title: "Alert",
    kicker: "Component \u00b7 Error",
    description: "Displays a status message in the flow of the page, at a severity from note to fault.",
  },
  'empty-state': {
    title: "Empty State",
    description: "Explains why a region has nothing to show, and offers the way out.",
  },
  'chart-metric': {
    title: "Chart Metric",
    kicker: "Component \u00b7 Charts",
    description: "Charts one measurement over time in a panel that frames itself.",
  },
  'chart-radar': {
    title: "Chart Radar",
    kicker: "Component \u00b7 Charts",
    description: "Compares several series across one shared set of axes.",
  },
  'chart-trend': {
    title: "Chart Trend",
    kicker: "Component \u00b7 Charts",
    description: "Charts several series over time as lines, areas, or bars.",
  },
  'chart-funnel': {
    title: "Chart Funnel",
    kicker: "Component \u00b7 Charts",
    description: "Charts how much of a population survives each stage of a sequence.",
  },
  'gauge': {
    title: "Gauge",
    kicker: "Component \u00b7 Charts",
    description: "Displays a single bounded reading as a radial arc.",
  },
  'waveform': {
    title: "Waveform",
    kicker: "Component \u00b7 Charts",
    description: "Displays a live signal as a moving trace, showing that a feed is running.",
  },
  'media-card': {
    title: "Media Card",
    kicker: "Component \u00b7 Surfaces",
    description: "Presents an item on its own artwork, for content the image identifies.",
  },
  'table-data': {
    title: "Table Data",
    kicker: "Component \u00b7 Data",
    description: "Renders a table from a column definition and a set of rows.",
  },
  'music-player': {
    title: "Music Player",
    kicker: "Component \u00b7 Composites",
    description: "Controls playback in one bar: track identity, transport, and a scrub slider.",
  },
  'planet': {
    title: "Planet",
    kicker: "Component \u00b7 Objects",
    description: "Renders a slowly rotating particle sphere as a hero object.",
  },
  'table-basic': {
    title: "Table Basic",
    description: "Builds a table row by row, for cells that need their own structure.",
  },
  'tooltip': {
    title: "Tooltip",
    description: "Names a control that carries no text of its own, on hover or focus.",
  },
  'drawer': {
    title: "Drawer",
    description: "Displays content in a panel that slides in from the edge of the screen.",
  },
  'user-menu': {
    title: "User Menu",
    description: "Opens the account menu from the signed-in user's avatar.",
  },
  'user-card': {
    title: "User Card",
    description: "Opens the account menu from a row that names the signed-in user and their role.",
  },
}
