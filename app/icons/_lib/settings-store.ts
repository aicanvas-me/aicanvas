import type { IconSettings } from './settings-query'

// The starting look on the grid and on every icon page; the URL carries only
// what differs from it.
export const ICON_DEFAULTS: IconSettings = { style: 'line', size: 48, weight: 'regular', colour: null }

// One look for the whole icons section while the tab stays on the site: the
// grid's picks open an icon page as they were, the arrows carry them from icon
// to icon, and back on the grid they are still set. A page mounts already in
// that look, so no control moves from the default to it.
// Module memory: a full load starts from the defaults or a shared URL; after
// that the latest pick wins, also over an older URL that Back returns to.
let current: IconSettings = ICON_DEFAULTS
let seeded = false

export const storedSettings = (): IconSettings => current
/** Whether a page of the section has set the look in this load. */
export const isSeeded = () => seeded

export function storeSettings(next: IconSettings) {
  current = next
  seeded = true
}
