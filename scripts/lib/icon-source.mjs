// Where the icon scripts look for the closed icon set, in order. inject-premium
// keeps the pinned vault's icons in .icons-source because it deletes its clone.
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export const ICONS_KEPT = '.icons-source'

// Everything under icons/ that the icon scripts read, so all of it goes into .icons-source.
export const ICON_PARTS = ['react', 'src', 'svg', 'svg-duotone', 'svg-solid', 'svg-solid-duotone', 'batch-4.json']

export const iconSourceCandidates = (root) =>
  [
    process.env.ICONS_LOCAL_PATH,
    process.env.PREMIUM_LOCAL_PATH && join(process.env.PREMIUM_LOCAL_PATH, 'icons'),
    join(root, ICONS_KEPT),
  ].filter(Boolean)

// The Vercel path: no local checkout, so inject clones the pinned vault commit with the PAT.
export const isPinnedBuild = (env) => !env.PREMIUM_LOCAL_PATH && Boolean(env.GITHUB_PAT_PREMIUM)

// A pinned build without the icon set would ship a blank /icons and stay green, so it
// fails; dev and free-only builds go on without icons.
export const iconSetAction = ({ pinned, iconsDir }) =>
  iconsDir && existsSync(join(iconsDir, 'react/IconBase.tsx')) ? 'copy' : pinned ? 'fail' : 'skip'


