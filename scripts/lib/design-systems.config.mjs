/**
 * Design-system declarations, the source of truth for both the registry
 * generator and the website. Kept in `.mjs` so the build script and Next.js can
 * both import it without parsing TS or duplicating the data.
 *
 * Registry items of type `registry:block` keep that name in the JSON because
 * shadcn's CLI only recognises a fixed set of `type` values; everything
 * user-facing says "template".
 */

/**
 * First line of the placeholder inject-premium writes for a free-lane
 * design-system component that was EXPECTED but NOT injected. It exists only so
 * static imports resolve without crashing the build; the generators treat any
 * file starting with this sentinel as absent, so a placeholder is never
 * registered or installed. Writer and readers MUST agree, hence one source.
 */
export const FREE_DS_PLACEHOLDER_SENTINEL = '// @aicanvas-inject-degraded-placeholder'

/**
 * @typedef {Object} DesignSystemTemplate
 * @property {string} slug         Registry slug, e.g. 'andromeda-mission-control'
 * @property {string} name         Human label for the template widget
 * @property {string} [domain]     Short domain tag (e.g. 'Sci-Fi', 'Finance')
 * @property {string} entryPath    Entry file relative to the system's `rootDir`. The
 *                                 generator walks transitive imports from here and
 *                                 ships every file inside `rootDir` it reaches.
 */

/**
 * @typedef {Object} DesignSystem
 * @property {'andromeda'} slug
 * @property {string} name
 * @property {string} rootDir         Path from repo root. Layout is preserved verbatim
 *                                    so internal relative imports keep resolving.
 * @property {string[]} tokenEntries  Foundation files, shipped as the `<slug>-tokens`
 *                                    item; every other item depends on it.
 * @property {string[]} systemEntries Component files, shipped as the `<slug>` item,
 *                                    which depends on `<slug>-tokens` so the foundation
 *                                    isn't duplicated. Walked transitively.
 * @property {string[]} [optionalSystemEntries] Component files injected at build time by
 *                                    scripts/inject-premium.mjs. Emitted exactly like
 *                                    systemEntries when present; skipped with a warning
 *                                    when absent, never a build failure.
 * @property {DesignSystemTemplate[]} templates
 */

/** @type {DesignSystem[]} */
export const DESIGN_SYSTEMS = [
  {
    slug: 'andromeda',
    name: 'Andromeda',
    rootDir: 'design-systems/andromeda',
    tokenEntries: [
      'tokens.ts',
      'components/lib/utils.ts',
      'AndromedaIcon.tsx',
    ],
    systemEntries: [
      'components/Alert.tsx',
      'components/Avatar.tsx',
      'components/Badge.tsx',
      'components/Button.tsx',
      'components/Card.tsx',
      'components/Checkbox.tsx',
      'components/CornerMarkers.tsx',
      'components/DateRangePicker.tsx',
      'components/Drawer.tsx',
      'components/EmptyState.tsx',
      'components/HeatGrid.tsx',
      'components/IconButton.tsx',
      'components/Input.tsx',
      'components/NavItem.tsx',
      'components/PanelHeader.tsx',
      'components/PanelMenu.tsx',
      'components/Planet.tsx',
      'components/ProgressBar.tsx',
      'components/RadarChart.tsx',
      'components/Radio.tsx',
      'components/SearchField.tsx',
      'components/SegmentedControl.tsx',
      'components/Slider.tsx',
      'components/Spinner.tsx',
      'components/StatTile.tsx',
      'components/Table.tsx',
      'components/Tag.tsx',
      'components/Textarea.tsx',
      'components/Toggle.tsx',
      'components/Tooltip.tsx',
      'components/TrendChart.tsx',
      'components/UserCard.tsx',
      'components/UserMenu.tsx',
    ],
    // v2 components, authored in the private vault and injected at build time by
    // scripts/inject-premium.mjs. FREE single-component installs exactly like the
    // v1 entries above. Absent files are skipped with a warning, never a failure.
    optionalSystemEntries: [
      'components/MetricChart.tsx',
      'components/Gauge.tsx',
      'components/Waveform.tsx',
      'components/MediaCard.tsx',
      'components/DataTable.tsx',
      'components/MusicPlayer.tsx',
    ],
    // Button.tsx's natural slug (andromeda-button) is owned by the standalone in
    // components-workspace/andromeda-button/, so the design-system Button ships
    // under its own slug, fully separate from that standalone.
    slugOverrides: {
      'components/Button.tsx': 'andromeda-button-system',
    },
    // The app provides --font-jetbrains-mono via next/font, but installed projects
    // don't, so the shipped tokens item self-loads it. The import goes into the
    // SHIPPED file only, so the on-disk source stays clean and the app has no
    // double-load.
    fontPackages: ['@fontsource-variable/jetbrains-mono'],
    fontInjectInto: 'tokens.ts',
    templates: [
      { slug: 'andromeda-mission-control',   name: 'Mission Control',   domain: 'Sci-Fi',     entryPath: 'examples/mission-control/index.tsx' },
      { slug: 'andromeda-service-order',     name: 'Service Order',     domain: 'Telecom',    entryPath: 'examples/service-order/index.tsx' },
      // exchange-terminal is hidden from the registry, sidebar and showcase.
      // Restore by uncommenting the entry below plus the matching entries in
      // app/lib/component-registry.tsx and app/_components/IdeationSidebar.tsx.
      // { slug: 'andromeda-exchange-terminal', name: 'Exchange Terminal', domain: 'Finance', entryPath: 'examples/exchange-terminal/index.tsx' },
      { slug: 'andromeda-resource-planning', name: 'Resource Planning', domain: 'Operations', entryPath: 'examples/resource-planning/index.tsx' },
      { slug: 'andromeda-signal-room',       name: 'Signal Room',       domain: 'Audio',      entryPath: 'examples/signal-room/index.tsx' },
    ],
  },
]
