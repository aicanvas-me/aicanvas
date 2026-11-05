// Where the icon scripts look for the closed icon set, in order. inject-premium
// keeps the pinned vault's icons in .icons-source because it deletes its clone.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

export const ICONS_KEPT = '.icons-source'

// Everything under icons/ that the icon scripts read, so all of it goes into .icons-source.
export const ICON_PARTS = ['react', 'src', 'svg', 'svg-duotone', 'svg-solid', 'svg-solid-duotone', 'batch-4.json', 'added-dates.json']

export const iconSourceCandidates = (root) =>
  [
    process.env.ICONS_LOCAL_PATH,
    process.env.PREMIUM_LOCAL_PATH && join(process.env.PREMIUM_LOCAL_PATH, 'icons'),
    join(root, ICONS_KEPT),
    join(homedir(), 'aicanvas-premium-icon-library/icons'),
  ].filter(Boolean)

// The Vercel path: no local checkout, so inject clones the pinned vault commit with the PAT.
export const isPinnedBuild = (env) => !env.PREMIUM_LOCAL_PATH && Boolean(env.GITHUB_PAT_PREMIUM)

// A pinned build without the icon set would ship a blank /icons and stay green, so it
// fails; dev and free-only builds go on without icons.
export const iconSetAction = ({ pinned, iconsDir }) =>
  iconsDir && existsSync(join(iconsDir, 'react/IconBase.tsx')) ? 'copy' : pinned ? 'fail' : 'skip'

const DAY = /^\d{4}-\d{2}-\d{2}$/

// Each icon's first-added date, from the set's added-dates.json; icons it lacks fall back
// to the first commit that added their line SVG. A kept copy has no git: those stay unknown.
export function readAddedDates(src, names) {
  const file = join(src, 'added-dates.json')
  const listed = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
  const added = Object.fromEntries(Object.entries(listed).filter(([, day]) => DAY.test(String(day))))
  if (names.every((name) => added[name])) return added

  // One git pass, newest first, so the last date seen for a file is its first add.
  const fromGit = {}
  let date = ''
  let log = ''
  try {
    log = execFileSync('git', ['-C', src, 'log', '--diff-filter=A', '--format=@%ad', '--date=short', '--name-only', '--', 'svg/'], { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'] })
  } catch {}
  for (const line of log.split('\n')) {
    if (line.startsWith('@')) date = line.slice(1)
    else if (line.startsWith('icons/svg/') || line.startsWith('svg/')) fromGit[line.split('/').pop().replace(/\.svg$/, '')] = date
  }
  return { ...fromGit, ...added }
}
