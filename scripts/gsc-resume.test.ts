import { describe, it, expect, afterEach } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import {
  usableEntries,
  loadCheckpoint,
  saveCheckpoint,
  clearCheckpoint,
  takeLock,
  RESUME_MAX_AGE_MS,
  type Checkpoint,
} from './gsc-resume'

const CTX = { property: 'sc-domain:aicanvas.me', sitemapUrl: 'https://aicanvas.me/sitemap.xml' }
const NOW = Date.parse('2026-09-20T09:00:00Z')

function cp(over: Partial<Checkpoint> = {}): Checkpoint {
  return {
    startedAt: '2026-09-20T07:00:00Z',
    property: CTX.property,
    sitemapUrl: CTX.sitemapUrl,
    entries: [{ url: 'https://aicanvas.me/a' }, { url: 'https://aicanvas.me/b' }],
    ...over,
  }
}

const tmps: string[] = []
function tmpdir(): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'gsc-resume-'))
  tmps.push(d)
  return d
}
afterEach(() => {
  while (tmps.length) fs.rmSync(tmps.pop()!, { recursive: true, force: true })
})

describe('usableEntries', () => {
  it('reuses the results of an interrupted run', () => {
    const m = usableEntries(cp(), { ...CTX, now: NOW })
    expect([...m.keys()]).toEqual(['https://aicanvas.me/a', 'https://aicanvas.me/b'])
  })

  it('retries a URL whose inspection failed rather than storing the error for good', () => {
    const m = usableEntries(
      cp({ entries: [{ url: 'https://aicanvas.me/a' }, { url: 'https://aicanvas.me/b', error: 'timed out' }] }),
      { ...CTX, now: NOW },
    )
    expect([...m.keys()]).toEqual(['https://aicanvas.me/a'])
  })

  it('ignores a checkpoint from a different property', () => {
    expect(usableEntries(cp({ property: 'sc-domain:other.test' }), { ...CTX, now: NOW }).size).toBe(0)
  })

  it('ignores a checkpoint from a different sitemap', () => {
    expect(usableEntries(cp({ sitemapUrl: 'https://aicanvas.me/sitemap-old.xml' }), { ...CTX, now: NOW }).size).toBe(0)
  })

  it('ignores a checkpoint older than the resume window, because the index has moved on', () => {
    const old = new Date(NOW - RESUME_MAX_AGE_MS - 1000).toISOString()
    expect(usableEntries(cp({ startedAt: old }), { ...CTX, now: NOW }).size).toBe(0)
  })

  it('keeps a checkpoint from inside the window', () => {
    const recent = new Date(NOW - RESUME_MAX_AGE_MS + 60_000).toISOString()
    expect(usableEntries(cp({ startedAt: recent }), { ...CTX, now: NOW }).size).toBe(2)
  })

  it('ignores a checkpoint stamped in the future, which means a clock nobody can trust', () => {
    expect(usableEntries(cp({ startedAt: '2027-01-01T00:00:00Z' }), { ...CTX, now: NOW }).size).toBe(0)
  })

  it('ignores null, a missing entries array and an unparseable date', () => {
    expect(usableEntries(null, { ...CTX, now: NOW }).size).toBe(0)
    expect(usableEntries({ ...cp(), entries: undefined as never }, { ...CTX, now: NOW }).size).toBe(0)
    expect(usableEntries(cp({ startedAt: 'not a date' }), { ...CTX, now: NOW }).size).toBe(0)
  })
})

describe('checkpoint file', () => {
  it('round-trips', () => {
    const f = path.join(tmpdir(), 'progress.json')
    saveCheckpoint(f, cp())
    expect(loadCheckpoint(f)).toEqual(cp())
  })

  it('reads a missing or corrupt file as no checkpoint, never as a crash', () => {
    const d = tmpdir()
    expect(loadCheckpoint(path.join(d, 'nothing.json'))).toBeNull()
    const bad = path.join(d, 'half.json')
    fs.writeFileSync(bad, '{"entries": [{"url": "https://aic')
    expect(loadCheckpoint(bad)).toBeNull()
  })

  it('leaves no temp file behind, so an interrupted write cannot be read as progress', () => {
    const d = tmpdir()
    const f = path.join(d, 'progress.json')
    saveCheckpoint(f, cp())
    expect(fs.readdirSync(d)).toEqual(['progress.json'])
    clearCheckpoint(f)
    expect(fs.readdirSync(d)).toEqual([])
  })

  it('clears a checkpoint that is not there without complaining', () => {
    expect(() => clearCheckpoint(path.join(tmpdir(), 'gone.json'))).not.toThrow()
  })
})

describe('takeLock', () => {
  it('takes a free lock and names the process holding it', () => {
    const l = path.join(tmpdir(), 'audit.lock')
    const release = takeLock(l)
    expect(fs.readFileSync(path.join(l, 'pid'), 'utf8')).toBe(String(process.pid))
    release()
    expect(fs.existsSync(l)).toBe(false)
  })

  it('refuses a second run and says who holds it', () => {
    const l = path.join(tmpdir(), 'audit.lock')
    fs.mkdirSync(l)
    fs.writeFileSync(path.join(l, 'pid'), '4242')
    expect(() => takeLock(l)).toThrow(/already running \(4242\)/)
  })

  it('refuses even when the holder never wrote its pid', () => {
    const l = path.join(tmpdir(), 'audit.lock')
    fs.mkdirSync(l)
    expect(() => takeLock(l)).toThrow(/already running \(pid unknown\)/)
  })

  it('takes over a lock left behind by a run that was killed', () => {
    const l = path.join(tmpdir(), 'audit.lock')
    fs.mkdirSync(l)
    fs.writeFileSync(path.join(l, 'pid'), '4242')
    const release = takeLock(l, { now: Date.now() + 7 * 60 * 60 * 1000 })
    expect(fs.readFileSync(path.join(l, 'pid'), 'utf8')).toBe(String(process.pid))
    release()
  })

  it('releases once, so a second call cannot wipe the next run lock', () => {
    const l = path.join(tmpdir(), 'audit.lock')
    const release = takeLock(l)
    release()
    fs.mkdirSync(l)
    fs.writeFileSync(path.join(l, 'pid'), '999')
    release()
    expect(fs.existsSync(l)).toBe(true)
  })
})
