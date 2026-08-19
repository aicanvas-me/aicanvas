/**
 * Design-system declarations — source of truth for both:
 *  - the registry generator (which emits multi-file `andromeda.json` and per-template JSONs)
 *  - the website (per-component "Part of Andromeda" affordance, TemplateChrome metadata)
 *
 * Keeping this in `.mjs` means the build script and Next.js can both import it
 * without parsing TS or duplicating the data. New systems land here.
 *
 * Note: registry items of type `registry:block` keep that name in the JSON because
 * shadcn's CLI only recognises a fixed set of `type` values. Everything user-facing
 * uses "template"; only the JSON schema field uses the shadcn vocabulary.
 */

/**
 * First line of a placeholder file that inject-premium writes for a free-lane
 * design-system component that was EXPECTED but NOT injected (degraded/free-only
 * build, or a pin predating the component). The file exists only so static
 * imports (`../../components/<Name>`) resolve without crashing the build; the
 * registry/props generators treat any file starting with this sentinel as absent
 * so a placeholder is never registered or installed. inject-premium.mjs writes
 * it; generate-registry.mjs reads it — they MUST agree, hence one shared source.
 */
export const FREE_DS_PLACEHOLDER_SENTINEL = '// @aicanvas-inject-degraded-placeholder'

/**
 * @typedef {Object} DesignSystemTemplate
 * @property {string} slug         Registry slug, e.g. 'andromeda-mission-control'
 * @property {string} name         Human label for the template widget
 * @property {string} [domain]     Short domain tag (e.g. 'Sci-Fi', 'Finance')
 * @property {string} entryPath    Entry file relative to the system's `rootDir`.
 *                                 The generator walks transitive imports starting
 *                                 here and ships every file inside `rootDir` reached.
 */

/**
 * @typedef {Object} DesignSystem
 * @property {'andromeda'} slug
 * @property {string} name
 * @property {string} rootDir         Path from repo root. Layout is preserved verbatim
 *                                    so internal relative imports continue to resolve.
 * @property {string} [injectedRootDir] Whole-system v2 tree injected at build time by
 *                                    scripts/inject-premium.mjs (vault manifest key
 *                                    `systems`). When it exists on disk the registry
 *                                    generator reads the system from THERE instead of
 *                                    `rootDir`; when it doesn't (fork, no PAT, older
 *                                    pin) it falls back to the committed `rootDir`.
 * @property {string[]} tokenEntries  Foundation files (tokens, utils, system icons).
 *                                    Shipped as the `<slug>-tokens` registry item;
 *                                    every other item depends on it.
 * @property {string[]} systemEntries Component files. Shipped as the `<slug>` system
 *                                    item, which depends on `<slug>-tokens` so the
 *                                    foundation isn't duplicated. Walked transitively.
 * @property {string[]} [optionalSystemEntries] Component files flagged OPTIONAL:
 *                                    v2 components injected at build time by
 *                                    scripts/inject-premium.mjs (vault manifest key
 *                                    `freeSystemComponents`). When present they are
 *                                    emitted exactly like systemEntries; when absent
 *                                    (degraded build / older premium pin) the
 *                                    generator skips them with a warning instead of
 *                                    failing.
 * @property {DesignSystemTemplate[]} templates
 */

/** @type {DesignSystem[]} */
export const DESIGN_SYSTEMS = [
  {
    slug: 'andromeda',
    name: 'Andromeda',
    rootDir: 'design-systems/andromeda',
    injectedRootDir: 'design-systems/andromeda-v2',
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
    // v2-only components — authored in the private vault (aicanvas-premium) and
    // reachable only through the injected `injectedRootDir` tree. FREE
    // single-component installs exactly like the v1 entries above (same
    // registry:ui type → classified free by lib/registry/content-type.ts).
    // Optional because they have no committed counterpart: on a degraded build
    // (fork, no PAT, older premium pin) the generator reads the v1 rootDir,
    // finds them absent, and skips them with a warning instead of failing.
    // The entries above ship in BOTH trees, so they are never optional.
    optionalSystemEntries: [
      'components/Burst.tsx',
      'components/ChoiceCard.tsx',
      'components/ContourBackdrop.tsx',
      'components/DataTable.tsx',
      'components/FunnelChart.tsx',
      'components/Gauge.tsx',
      'components/GridBackdrop.tsx',
      'components/HorizonBackdrop.tsx',
      'components/MediaCard.tsx',
      'components/MetricChart.tsx',
      'components/MusicPlayer.tsx',
      'components/Nodes.tsx',
      'components/Orb.tsx',
      'components/TopBar.tsx',
      'components/VoidBackdrop.tsx',
      'components/Waveform.tsx',
    ],
    // Per-file slug overrides. Button.tsx's natural slug (andromeda-button) is
    // owned by the standalone in components-workspace/andromeda-button/, so the
    // design-system Button is given its own unique slug and ships as a
    // first-class installable component (with Button.rules.md), fully separate
    // from that standalone.
    slugOverrides: {
      'components/Button.tsx': 'andromeda-button-system',
    },
    // Fonts the system needs at runtime. The AI Canvas app provides
    // --font-jetbrains-mono via next/font, but installed projects don't — so the
    // shipped tokens item self-loads the font. The import is injected into the
    // SHIPPED tokens file only (fontInjectInto); the on-disk source stays clean,
    // so the app keeps using next/font with no double-load.
    fontPackages: ['@fontsource-variable/jetbrains-mono'],
    fontInjectInto: 'tokens.ts',
    templates: [
      { slug: 'andromeda-mission-control',   name: 'Mission Control',   domain: 'Sci-Fi',     entryPath: 'examples/mission-control/index.tsx' },
      { slug: 'andromeda-service-order',     name: 'Service Order',     domain: 'Telecom',    entryPath: 'examples/service-order/index.tsx' },
      // exchange-terminal — hidden from registry, sidebar, and showcase. Source
      // preserved in `examples/exchange-terminal/` for future revival; restore
      // by uncommenting the entry below + the matching entries in
      // app/lib/component-registry.tsx and app/_components/IdeationSidebar.tsx.
      // { slug: 'andromeda-exchange-terminal', name: 'Exchange Terminal', domain: 'Finance', entryPath: 'examples/exchange-terminal/index.tsx' },
      { slug: 'andromeda-resource-planning', name: 'Resource Planning', domain: 'Operations', entryPath: 'examples/resource-planning/index.tsx' },
      { slug: 'andromeda-signal-room',       name: 'Signal Room',       domain: 'Audio',      entryPath: 'examples/signal-room/index.tsx' },
    ],
  },
]

export function getDesignSystem(slug) {
  return DESIGN_SYSTEMS.find((s) => s.slug === slug)
}

export function getDesignSystemTemplate(slug) {
  for (const system of DESIGN_SYSTEMS) {
    const template = system.templates.find((t) => t.slug === slug)
    if (template) return { system, template }
  }
  return undefined
}
