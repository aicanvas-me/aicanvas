import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ICON_PARTS, iconSetAction, isPinnedBuild } from './icon-source.mjs'

let dir: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'icon-source-test-'))
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

const withIconSet = () => {
  mkdirSync(join(dir, 'react'), { recursive: true })
  writeFileSync(join(dir, 'react/IconBase.tsx'), 'export {}')
  return dir
}

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
