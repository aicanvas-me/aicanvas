// The curated per-section copy from the system page, preserved VERBATIM in
// the collapse of 2026-08-09: every title, kicker and description below was
// hand-written against the real component and ends in true counts. The
// sections themselves are now a loop over the matrix declarations, so this
// is the only thing that stayed hand-authored about them.
//
// allowOverflow mirrors the spec's own `overflow` flag and is derived from it
// at render time, not repeated here.
export type SectionCopy = { title: string; kicker?: string; description: string }

export const SECTION_COPY: Record<string, SectionCopy> = {
  'button': {
    title: "Button",
    description: "Action primitive with a mono uppercase label, a hover lift, a press scale, and a focus ring. Pass `asChild` to render a real link and `icon` for a leading glyph; when the action needs no text label, use IconButton. 5 variants \u00d7 3 sizes.",
  },
  'icon-button': {
    title: "Icon Button",
    description: "Icon-only companion to `Button` for actions whose glyph reads as the label: close, refresh, settings, expand. It runs the same size ladder as `Button` so the two align in a toolbar row, and it needs an `aria-label` since there is no visible text; an icon-only sidebar entry stays a `NavItem` with `collapsed`. 4 variants \u00d7 3 sizes.",
  },
  'panel-header': {
    title: "Panel Header",
    description: "Title row for a top-level dashboard panel: sentence-case title on the left, an optional `actions` slot on the right, and an inset divider below. Use it for page-level panels and `CardHeader` for regions nested inside a `Card`. 3 sizes.",
  },
  'panel-menu': {
    title: "Panel Menu",
    description: "Kebab overflow menu for the `actions` slot of a panel header: items carry icons, separators, `selected` and `destructive` states, and one level of right-flyout submenu. The panel portals to the body and flips above the trigger when a downward menu would not fit, a submenu flips to the left when the right side would overflow, and the menu closes on outside click or Escape. 3 trigger sizes.",
  },
  'badge': {
    title: "Badge",
    description: "Read-only status label for the state a row or cell reports: online, queued, fault. The leading dot carries the signal rather than the text, and Badge never responds to a click, so use Tag when the label has to be dismissible. 6 variants \u00d7 3 sizes.",
  },
  'avatar': {
    title: "Avatar",
    description: "Square initials chip that stands for a person in a row, table cell, or assignee slot. Pass `src` to show an image, which falls back to initials if the image fails to load, and `status` to add the edge bar: online, caution, fault, or offline. 3 sizes.",
  },
  'card': {
    title: "Card",
    description: "Compound panel primitive: `Card` with `CardHeader`, `CardContent`, `CardFooter`, `CardTitle` and `CardDescription`, framed by corner brackets rather than a perimeter stroke. `bordered` swaps the brackets for a continuous 1px border and the `glow` variant tints the surface for the one panel that should be read first; use `CardHeader` for a region inside a card, `PanelHeader` for a top level panel. 2 variants x 2 frame modes.",
  },
  'corner-markers': {
    title: "Corner Markers",
    description: "The defining Andromeda motif: 4 L-shaped brackets pinned to the corners of the nearest `position: relative` ancestor, framing it in place of a perimeter border. `Card` renders them for you, so reach for this directly only in a bespoke container. `size`, `offset` and `borderWidth` override the `tokens.marker` geometry and `radius` overrides the frame radius; the brackets stay `border.bright` grey, because color is reserved for measurement.",
  },
  'input': {
    title: "Input",
    description: "Single-line text field for free text in a form row, with an optional mono uppercase label and an optional left icon. Pass `error` and the border, focus ring, and helper message switch to fault with `aria-invalid` wired in; a command bar with a shortcut chip is `SearchField`, and a date is `DateRangePicker`. 2 states \u00d7 3 sizes.",
  },
  'search-field': {
    title: "Search Field",
    description: "Command bar style search input: leading icon, mono text, and an optional \u2318 K chip you drop by passing `null` to `shortcut`. Use `Input` for a labelled form field, and `IconButton` when you only need a trigger that opens a search overlay. 3 sizes.",
  },
  'nav-item': {
    title: "Nav Item",
    description: "Sidebar navigation row: optional icon, label, and an active state carried by accent text plus a small square on the right edge, never a background fill. `collapsed` is the icon-rail form, which drops that square and lets the accent glyph carry active, so pair it with a Tooltip for the visible name; an icon-only row that is still a destination belongs here rather than in IconButton. 3 boolean axes, no sizes: `active`, `mono` (uppercase mono label by default, sans when false), `collapsed`.",
  },
  'progress-bar': {
    title: "Progress Bar",
    description: "A bounded 0 to 100 meter for one reading such as capacity, load, or completion: 30 skewed segments fill left to right in a scroll-gated cascade, with an optional `label` and percent readout above. Set `variant` to escalate a reading past a threshold; for a series over time use `TrendChart`, for a matrix of readings use `HeatGrid`. 3 variants.",
  },
  'heat-grid': {
    title: "Heat Grid",
    description: "A 2-D matrix fill gauge for a single level: risk, capacity, saturation. Cells fill from the bottom centre outward as `value` rises, dim at the base and bright at the frontier, and the gauge stays live after the first fill so later `value` changes crossfade in place. Use `ProgressBar` when levels sit in list rows or need comparing side by side.",
  },
  'stat-tile': {
    title: "Stat Tile",
    description: "A single headline metric framed as a `Card`: big value, optional `unit`, and a signed delta whose arrow gives the direction while the colour gives the judgment. Set `polarity` to `lower-is-better` for latency or error rate so a drop reads as good, or to `none` for a reading with no good side. The value counts up once when the tile scrolls into view; `live` snaps later updates and `liveRoll` rolls them digit by digit.",
  },
  'tag': {
    title: "Tag",
    description: "Compact labels for metadata, filters, and multi-select inputs. Like Badge, but dismissible: pass `onClose` and it grows a dismiss button. 4 variants \u00d7 3 sizes.",
  },
  'checkbox': {
    title: "Checkbox",
    description: "Square boolean control for multi-select sets: filters, table row selection, single opt-ins. Controlled with `checked` and `onCheckedChange`, or uncontrolled with `defaultChecked`; use Radio for one choice out of several and Toggle for a setting that applies with no submit step. 2 states \u00d7 3 sizes, plus a disabled form of each.",
  },
  'choice-card': {
    title: "Choice Card",
    description: "Whole-surface selection control for options that need a title and supporting line. Use `control=\"radio\"` inside `ChoiceCardGroup` for one selected value with arrow-key roving focus, or use independent checkbox and toggle cards for boolean choices; a short inline label stays a bare `Radio`, `Checkbox`, or `Toggle`. Cards support `checked`, `defaultChecked`, and `onCheckedChange`; the group uses `value`, `defaultValue`, and `onValueChange`.",
  },
  'radio': {
    title: "Radio \u00b7 Choicebox",
    description: "Square radio for one mutually exclusive choice from a small set that stays visible, such as a mode or a filter. Wrap the options in `RadioGroup` to share a `name` and drive selection through `value` and `onValueChange`; use `Checkbox` when more than one option can be picked at once. 2 states x 3 sizes.",
  },
  'toggle': {
    title: "Toggle \u00b7 Switch",
    description: "Binary switch for a setting that takes effect the moment it flips: live mode, notifications, autopilot. Use `Checkbox` when the choice belongs to a form that submits later; here `checked` and `onCheckedChange` drive it, or `defaultChecked` leaves it uncontrolled. 2 states x 3 sizes.",
  },
  'segmented-control': {
    title: "Segmented Control",
    description: "Fixed height strip of mutually exclusive segments for switching a view or mode, a chart range or a unit picker, with a grey fill that slides to the active segment. It holds no state, so drive it with `value` and `onChange`; reach for `Button` or `IconButton` when the choices are independent actions. 3 sizes.",
  },
  'date-range-picker': {
    title: "Date Range Picker",
    description: "Trigger chip that opens a calendar popover for picking a start and end date: report windows, telemetry spans, filter bands. Controlled only, drive `value` as a start and end pair and commit through `onChange`, where the first click sets the anchor and the second confirms. Accent fills the two endpoints and outlines the days between, so colour marks the selection and nothing else.",
  },
  'spinner': {
    title: "Spinner",
    description: "Indeterminate busy indicator: a 3x3 pixel grid whose 8 perimeter cells run a snake trail off one shared keyframe, with the center cell held statically dim. Use `ProgressBar` instead when the percentage is known. 4 variants x 3 sizes.",
  },
  'slider': {
    title: "Slider",
    description: "Single-value horizontal range control: drag the thumb, or use the arrows, PageUp and PageDown, Home and End to set one continuous number. The accent fill is the reading, so reach for `ProgressBar` when the level is read-only and cannot be dragged. 2 sizes: the ladder starts at md here, since an sm thumb is too small a drag target.",
  },
  'textarea': {
    title: "Textarea",
    description: "Multi-line text entry for notes, descriptions, and log input. Use `Input` when the value fits on one line; here the starting height comes from `rows`, the field resizes vertically only, and passing `error` turns the border red and announces the message. 2 states x 3 sizes.",
  },
  'alert': {
    title: "Alert",
    kicker: "Component \u00b7 Error",
    description: "Banner-style status message that stays in the document flow, composed from `AlertIcon`, `AlertContent`, `AlertTitle` and `AlertDescription`. The `variant` prop sets severity: warning and fault announce assertively, default and accent politely; for a labeled block with no severity, use Card. 4 variants.",
  },
  'empty-state': {
    title: "Empty State",
    description: "Placeholder for a region that resolved to nothing: a table with zero rows, a first-run panel, a filter that matched nothing. Built on `Card`, so it brings its own corner-marker frame; compose it from `EmptyStateIcon`, `EmptyStateTitle`, `EmptyStateDescription` and `EmptyStateAction`. It states absence, not failure or loading, so the icon and text stay grey and the action slot holds one or two buttons at most.",
  },
  'chart-metric': {
    title: "Chart Metric",
    kicker: "Component \u00b7 Charts",
    description: "Self-framed panel for one live measurement over time: altitude, latency, a bounded percentage. It carries its own corner markers, header and status badge, and fits the y-domain to the data, so a non-zero floor is not crushed into a sliver; reach for `TrendChart` when you need more than one series, or a plot inside a panel you compose yourself. 3 variants, and they color the status badge only: chart ink stays neutral.",
  },
  'chart-radar': {
    title: "Chart Radar",
    kicker: "Component \u00b7 Charts",
    description: "Radial spider chart for comparing up to four series across one shared set of axes, such as a ship systems diagnostic. Choose it when every series is measured on the same multi-axis profile; for values over time or over a category axis use `TrendChart`. It frames itself with a header, plot, and legend, so never wrap it in a `Card`.",
  },
  'chart-trend': {
    title: "Chart Trend",
    kicker: "Component \u00b7 Charts",
    description: "Multi-series time-series chart, up to four series, drawn as line, area, or bar from the built-in mode toggle; each series takes a `role` that sets its colour: `baseline` white, `live` accent, `context` faint, `threshold` red dashed. It renders content only, so wrap it in a `Card` or a corner-marked surface, and reach for `MetricChart` when a single series needs a panel with its own frame. 3 modes x 4 series roles.",
  },
  'chart-funnel': {
    title: "Chart Funnel",
    kicker: "Component \u00b7 Charts",
    description: "Stage-to-stage conversion where each stage is a subset of the one before it, and the taper between bands is the loss you read. Ordered categories that are independent of one another belong in `TrendChart` bar mode instead. Bands rest in neutral ink; `tone` says how healthy a stage is and has to be derived from the data, never one hue per stage. 5 tones \u00d7 2 percentage bases.",
  },
  'gauge': {
    title: "Gauge",
    kicker: "Component \u00b7 Charts",
    description: "Radial readout for one bounded measurement: utilization, health, signal strength. The arc carries the reading, so its color escalates from accent to warning to danger over a neutral track, and `ProgressBar` covers the same job when a level reads better as a linear bar. 3 variants \u00d7 3 sizes.",
  },
  'waveform': {
    title: "Waveform",
    kicker: "Component \u00b7 Charts",
    description: "Live signal line for audio or telemetry: a morphing polyline over mirrored level bars and a dashed centre reference, drawn in a fluid SVG. `paused` and reduced motion hold a static frame instead of blanking it, and setting `showBars` or `showCenterline` to false removes the reference layers. Use `MetricChart` or `TrendChart` when the numbers have to be read; `Waveform` only shows that a feed is alive.",
  },
  'media-card': {
    title: "Media Card",
    kicker: "Component \u00b7 Surfaces",
    description: "Image-backed content tile for mixes, channels, and featured items whose artwork is the recognition cue. It composes `Card` with `markers` off, adds a bottom scrim, a mono code tag, title and meta, and one corner control; the whole card is the hit target unless `action` is `none`, and the image zooms on hover while the frame and text hold still. 3 `action` modes: `play`, `cta`, `none`.",
  },
  'table-data': {
    title: "Table Data",
    kicker: "Component \u00b7 Data",
    description: "Configuration-driven data grid: pass `columns` and `rows` to get dense mono cells, inset hairline dividers, row hover, and an accent left edge on the row named by `selectedRowKey`. Reach for Table Basic instead when cells need bespoke structure that no shared column model can describe. Below the md breakpoint a `hideBelow` column folds into the per-row info tooltip or the primary column's sub-line, so the grid never grows a horizontal scrollbar.",
  },
  'music-player': {
    title: "Music Player",
    kicker: "Component \u00b7 Composites",
    description: "Block-scale transport bar: track identity, the transport cluster, a scrub slider with elapsed and remaining readouts, and like, lyrics and volume controls. Play is the one accent-filled action, everything else is ghost, and the bar stacks into three rows on its own container width rather than the viewport. Pass `playing`, `elapsed` and the matching callbacks to drive it, or omit them and it runs the live demo below.",
  },
  'planet': {
    title: "Planet",
    kicker: "Component \u00b7 Objects",
    description: "Particle sphere rendered in Three.js on a transparent canvas, lit from one side and slowly rotating: a hero set piece for an active body or a next destination. It shows no value, so use `ProgressBar` or `HeatGrid` when a measurement is the point. Every particle takes its color from the accent ramp read at mount, so a themed page renders a themed planet, and reduced motion holds the sphere still.",
  },
  'table-basic': {
    title: "Table Basic",
    description: "Compound primitive for dense tabular data: `Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeader`, `TableCell`. Headers take `sort` for the caret and `aria-sort`, rows take `selected` for the accent left edge, and a wide table scrolls inside its panel instead of reflowing into cards. Reach for `DataTable` when a column config describes the records, and for this one when cells need bespoke structure; mount one `TableStyles` per page.",
  },
  'tooltip': {
    title: "Tooltip",
    description: "Hover and focus label for a control that carries no text of its own, most often an `IconButton`. It never eats a click and shifts away from a viewport edge instead of pushing the page sideways; set `position` to `left` or `right` on an icon rail, where a label above a row would cover its neighbour. 4 positions.",
  },
  'drawer': {
    title: "Drawer",
    description: "Modal panel that slides in from a screen edge: settings, filters, and detail views that need to take over focus. Portal-rendered with a scrim, focus trap, focus return, ESC to close and a body scroll lock, composed from `DrawerHeader`, `DrawerTitle`, `DrawerDescription`, `DrawerBody` and `DrawerFooter`. Left or right edge, and `size` sets the panel width in px, clamped to the viewport.",
  },
  'user-menu': {
    title: "User Menu",
    description: "Avatar trigger that opens a popover of account actions, with rows supplied by the `items` prop, including separators and destructive entries. Pick `UserCard` when the trigger has room to spell out name and role; `UserMenu` is the compact top-bar form. 3 sizes.",
  },
  'user-card': {
    title: "User Card",
    description: "Wide identity trigger for the foot of a sidebar: avatar, name, role, and a caret that opens the same popover as `UserMenu`, with rows from the `items` prop. Choose it when there is room to name the user and `UserMenu` when the slot is a tight top bar; it opens upward and stretches to the trigger width by default. 2 sizes: the ladder stops at md, since a sidebar rail never has room for an lg card.",
  },
}
