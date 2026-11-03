// Where the icon scripts look for the closed icon set, in order. inject-premium
// keeps the pinned vault's icons in .icons-source because it deletes its clone.
import { homedir } from 'node:os'
import { join } from 'node:path'

export const ICONS_KEPT = '.icons-source'

export const iconSourceCandidates = (root) =>
  [
    process.env.ICONS_LOCAL_PATH,
    process.env.PREMIUM_LOCAL_PATH && join(process.env.PREMIUM_LOCAL_PATH, 'icons'),
    join(root, ICONS_KEPT),
    join(homedir(), 'aicanvas-premium-icon-library/icons'),
  ].filter(Boolean)
