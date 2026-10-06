// The barrel. Hand-written on purpose: one import line per component means
// parallel builders adding specs never touch the same lines twice, and it
// mirrors the per-component .rules.md convention the brain already uses.
import type { MatrixSpec } from './types'
import { accordion } from './accordion'
import { alert } from './alert'
import { artifact } from './artifact'
import { avatar } from './avatar'
import { badge } from './badge'
import { bentoGrid } from './bento-grid'
import { burst } from './burst'
import { button } from './button'
import { card } from './card'
import { checkbox } from './checkbox'
import { suggestion } from './suggestion'
import { tabs } from './tabs'
import { choiceCard } from './choice-card'
import { collapsible } from './collapsible'
import { combobox } from './combobox'
import { cornerMarkers } from './corner-markers'
import { cube } from './cube'
import { dataTable } from './table-data'
import { dateRangePicker } from './date-range-picker'
import { drawer } from './drawer'
import { emptyState } from './empty-state'
import { funnelChart } from './chart-funnel'
import { gauge } from './gauge'
import { heatGrid } from './heat-grid'
import { iconButton } from './icon-button'
import { input } from './input'
import { item } from './item'
import { logoCloud } from './logo-cloud'
import { marquee } from './marquee'
import { mediaCard } from './media-card'
import { message } from './message'
import { metricChart } from './chart-metric'
import { musicPlayer } from './music-player'
import { navItem } from './nav-item'
import { navbar } from './navbar'
import { nodes } from './nodes'
import { orb } from './orb'
import { panelHeader } from './panel-header'
import { panelMenu } from './panel-menu'
import { planet } from './planet'
import { popover } from './popover'
import { progressBar } from './progress-bar'
import { pricingCard } from './pricing-card'
import { promptInput } from './prompt-input'
import { radarChart } from './chart-radar'
import { radio } from './radio'
import { searchField } from './search-field'
import { sectionHeading } from './section-heading'
import { strengthMeter } from './strength-meter'
import { segmentedControl } from './segmented-control'
import { sidebar } from './sidebar'
import { skeleton } from './skeleton'
import { slider } from './slider'
import { spinner } from './spinner'
import { statTile } from './stat-tile'
import { stepper } from './stepper'
import { table_ } from './table-basic'
import { tag } from './tag'
import { textarea } from './textarea'
import { toggle } from './toggle'
import { tool } from './tool'
import { tooltip } from './tooltip'
import { topBar } from './top-bar'
import { trendChart } from './chart-trend'
import { userCard } from './user-card'
import { userMenu } from './user-menu'
import { waveform } from './waveform'

export const SPECS: readonly MatrixSpec[] = [
  accordion, alert, artifact, avatar, badge, bentoGrid, burst, button, card, checkbox, choiceCard, collapsible, combobox,
  // The two tables sit together so their selected-row treatments are judged
  // side by side.
  cornerMarkers, cube, dataTable, table_, dateRangePicker, drawer, emptyState, funnelChart,
  gauge, heatGrid, iconButton, input, item, logoCloud, marquee, mediaCard, message,
  metricChart, musicPlayer, navItem, navbar, nodes, orb, panelHeader, panelMenu, planet, popover,
  pricingCard, progressBar, promptInput, radarChart, radio, searchField, sectionHeading, segmentedControl, sidebar, skeleton, slider, spinner,
  statTile, stepper, strengthMeter, suggestion, tabs, tag, textarea, toggle, tool, tooltip, topBar, trendChart, userCard,
  userMenu, waveform,
]

export const SPEC_BY_SLUG: Record<string, MatrixSpec> = Object.fromEntries(
  SPECS.map((s) => [s.slug, s]),
)

export { matrixId, REST, CONTROL_STATES } from './types'
export type { MatrixSpec, MatrixCase } from './types'
