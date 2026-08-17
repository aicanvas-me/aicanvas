// The barrel. Hand-written on purpose: one import line per component means
// parallel builders adding specs never touch the same lines twice, and it
// mirrors the per-component .rules.md convention the brain already uses.
import type { MatrixSpec } from './types'
import { alert } from './alert'
import { avatar } from './avatar'
import { badge } from './badge'
import { burst } from './burst'
import { button } from './button'
import { card } from './card'
import { checkbox } from './checkbox'
import { choiceCard } from './choice-card'
import { contourBackdrop } from './contour-backdrop'
import { cornerMarkers } from './corner-markers'
import { dataTable } from './data-table'
import { dateRangePicker } from './date-range-picker'
import { drawer } from './drawer'
import { emptyState } from './empty-state'
import { funnelChart } from './funnel-chart'
import { gauge } from './gauge'
import { gridBackdrop } from './grid-backdrop'
import { heatGrid } from './heat-grid'
import { horizonBackdrop } from './horizon-backdrop'
import { iconButton } from './icon-button'
import { input } from './input'
import { mediaCard } from './media-card'
import { metricChart } from './metric-chart'
import { musicPlayer } from './music-player'
import { navItem } from './nav-item'
import { nodes } from './nodes'
import { orb } from './orb'
import { panelHeader } from './panel-header'
import { panelMenu } from './panel-menu'
import { planet } from './planet'
import { progressBar } from './progress-bar'
import { radarChart } from './radar-chart'
import { radio } from './radio'
import { searchField } from './search-field'
import { segmentedControl } from './segmented-control'
import { slider } from './slider'
import { spinner } from './spinner'
import { statTile } from './stat-tile'
import { table_ } from './table'
import { tag } from './tag'
import { textarea } from './textarea'
import { toggle } from './toggle'
import { tooltip } from './tooltip'
import { trendChart } from './trend-chart'
import { userCard } from './user-card'
import { userMenu } from './user-menu'
import { voidBackdrop } from './void-backdrop'
import { waveform } from './waveform'

export const SPECS: readonly MatrixSpec[] = [
  alert, avatar, badge, burst, button, card, checkbox, choiceCard, contourBackdrop,
  cornerMarkers, dataTable, dateRangePicker, drawer, emptyState, funnelChart,
  gauge, gridBackdrop, heatGrid, horizonBackdrop, iconButton, input, mediaCard,
  metricChart, musicPlayer, navItem, nodes, orb, panelHeader, panelMenu, planet,
  progressBar, radarChart, radio, searchField, segmentedControl, slider, spinner,
  statTile, table_, tag, textarea, toggle, tooltip, trendChart, userCard,
  userMenu, voidBackdrop, waveform,
]

export const SPEC_BY_SLUG: Record<string, MatrixSpec> = Object.fromEntries(
  SPECS.map((s) => [s.slug, s]),
)

export { matrixId, REST, CONTROL_STATES } from './types'
export type { MatrixSpec, MatrixCase } from './types'
