import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ICON_PARTS, iconSetAction, iconSourceCandidates, isPinnedBuild, readAddedDates } from './icon-source.mjs'

let dir: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'icon-source-test-'))
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
  vi.unstubAllEnvs()
})

const withIconSet = () => {
  mkdirSync(join(dir, 'react'), { recursive: true })
  writeFileSync(join(dir, 'react/IconBase.tsx'), 'export {}')
  return dir
}

describe('iconSourceCandidates', () => {
  it('looks only at the two env paths and the kept copy, never a guessed folder', () => {
    vi.stubEnv('ICONS_LOCAL_PATH', '/set/icons')
    vi.stubEnv('PREMIUM_LOCAL_PATH', '/vault')
    expect(iconSourceCandidates('/repo')).toEqual(['/set/icons', '/vault/icons', '/repo/.icons-source'])
  })

  it('falls back to the kept copy alone when no env path is set', () => {
    vi.stubEnv('ICONS_LOCAL_PATH', '')
    vi.stubEnv('PREMIUM_LOCAL_PATH', '')
    expect(iconSourceCandidates('/repo')).toEqual(['/repo/.icons-source'])
  })
})

describe('isPinnedBuild', () => {
  it('is the PAT clone only when no local checkout is set', () => {
    expect(isPinnedBuild({ GITHUB_PAT_PREMIUM: 'x' })).toBe(true)
    expect(isPinnedBuild({ GITHUB_PAT_PREMIUM: 'x', PREMIUM_LOCAL_PATH: '/vault' })).toBe(false)
    expect(isPinnedBuild({ PREMIUM_LOCAL_PATH: '/vault' })).toBe(false)
    expect(isPinnedBuild({})).toBe(false)
    expect(isPinnedBuild({ GITHUB_PAT_PREMIUM: '' })).toBe(false)
  })
})

describe('iconSetAction', () => {
  it('fails a pinned build whose vault commit has no icon set', () => {
    expect(iconSetAction({ pinned: true, iconsDir: join(dir, 'icons') })).toBe('fail')
    expect(iconSetAction({ pinned: true, iconsDir: '' })).toBe('fail')
  })

  it('lets dev and free-only builds go on without icons', () => {
    expect(iconSetAction({ pinned: false, iconsDir: join(dir, 'icons') })).toBe('skip')
    expect(iconSetAction({ pinned: false, iconsDir: '' })).toBe('skip')
  })

  it('copies the icon set whenever it is there', () => {
    expect(iconSetAction({ pinned: true, iconsDir: withIconSet() })).toBe('copy')
    expect(iconSetAction({ pinned: false, iconsDir: dir })).toBe('copy')
  })
})

it('keeps added-dates.json with the copied icon parts', () => {
  expect(ICON_PARTS).toContain('added-dates.json')
})

describe('readAddedDates', () => {
  const writeDates = (dates: Record<string, unknown>) => writeFileSync(join(dir, 'added-dates.json'), JSON.stringify(dates))

  it('takes every date from added-dates.json', () => {
    writeDates({ search: '2026-10-03', map: '2026-10-17' })
    expect(readAddedDates(dir, ['map', 'search'])).toEqual({ search: '2026-10-03', map: '2026-10-17' })
  })

  it('leaves an icon the file lacks unknown when there is no git history', () => {
    writeDates({ search: '2026-10-03' })
    const added = readAddedDates(dir, ['map', 'search'])
    expect(added.search).toBe('2026-10-03')
    expect(added.map ?? null).toBeNull()
  })

  it('drops a value that is not a YYYY-MM-DD day', () => {
    writeDates({ search: 'soon', map: null, pin: '2026-10-25' })
    expect(readAddedDates(dir, ['map', 'pin', 'search'])).toEqual({ pin: '2026-10-25' })
  })

  it('returns no dates for a kept copy with neither the file nor git', () => {
    expect(readAddedDates(dir, ['search'])).toEqual({})
  })
})
