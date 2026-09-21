import { describe, it, expect, afterEach } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import {
  mergeForSave,
  carryStartedAt,
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

describe('mergeForSave', () => {
  const e = (url: string) => ({ url })

  it('keeps results a previous run stored that this one has not reached yet', () => {
    const carried = new Map([['a', e('a')], ['b', e('b')], ['z', e('z')]])
    const out = mergeForSave([e('a'), e('b'), e('c')], carried)
    expect(out.map((x) => x.url)).toEqual(['a', 'b', 'c', 'z'])
  })

  it('never duplicates a URL that was replayed', () => {
    const carried = new Map([['a', e('a')]])
    expect(mergeForSave([e('a')], carried).map((x) => x.url)).toEqual(['a'])
  })

  it('keeps this run answer when both have the URL, because it is the newer one', () => {
    type Entry = { url: string; category: string }
    const carried = new Map<string, Entry>([['a', { url: 'a', category: 'old' }]])
    const out = mergeForSave<Entry>([{ url: 'a', category: 'new' }], carried)
    expect(out[0].category).toBe('new')
  })

  it('a save can never be shorter than what is already stored', () => {
    const carried = new Map(['a', 'b', 'c', 'd'].map((u) => [u, e(u)]))
    expect(mergeForSave([e('x')], carried).length).toBe(5)
  })

  it('is just this run when there is nothing carried', () => {
    expect(mergeForSave([e('a'), e('b')], new Map()).map((x) => x.url)).toEqual(['a', 'b'])
  })
})

describe('carryStartedAt', () => {
  const NOW_ISO = '2026-09-21T12:00:00Z'

  it('keeps the first attempt time, so interruptions cannot launder old results', () => {
    expect(carryStartedAt(cp(), 5, NOW_ISO)).toBe('2026-09-20T07:00:00Z')
  })

  it('starts a fresh clock when nothing was carried', () => {
    expect(carryStartedAt(cp(), 0, NOW_ISO)).toBe(NOW_ISO)
    expect(carryStartedAt(null, 0, NOW_ISO)).toBe(NOW_ISO)
  })

  it('starts a fresh clock when the old checkpoint has no usable stamp', () => {
    expect(carryStartedAt(cp({ startedAt: '' }), 5, NOW_ISO)).toBe(NOW_ISO)
  })

  it('three interruptions in a row still expire 24h after the first try', () => {
    let stamp = carryStartedAt(null, 0, '2026-09-20T07:00:00Z')
    for (const t of ['2026-09-20T09:00:00Z', '2026-09-20T18:00:00Z', '2026-09-21T05:00:00Z']) {
      stamp = carryStartedAt(cp({ startedAt: stamp }), 100, t)
    }
    expect(stamp).toBe('2026-09-20T07:00:00Z')
    expect(usableEntries(cp({ startedAt: stamp }), { ...CTX, now: Date.parse('2026-09-21T08:00:00Z') }).size).toBe(0)
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

  it('refuses while the holder is still running, and says who it is', () => {
    const l = path.join(tmpdir(), 'audit.lock')
    fs.mkdirSync(l)
    fs.writeFileSync(path.join(l, 'pid'), '4242')
    expect(() => takeLock(l, { isAlive: () => true })).toThrow(/already running \(4242\)/)
  })

  it('refuses a live holder even once the lock is past the stale window', () => {
    const l = path.join(tmpdir(), 'audit.lock')
    fs.mkdirSync(l)
    fs.writeFileSync(path.join(l, 'pid'), '4242')
    expect(() =>
      takeLock(l, { isAlive: () => true, now: Date.now() + 7 * 60 * 60 * 1000 }),
    ).toThrow(/already running/)
  })

  it('takes over at once when the holder is gone: the machine going down must not lock out the retry', () => {
    const l = path.join(tmpdir(), 'audit.lock')
    fs.mkdirSync(l)
    fs.writeFileSync(path.join(l, 'pid'), '4242')
    const release = takeLock(l, { isAlive: () => false })
    expect(fs.readFileSync(path.join(l, 'pid'), 'utf8')).toBe(String(process.pid))
    release()
  })

  it('refuses our own live process without the stub, so the default really checks liveness', () => {
    const l = path.join(tmpdir(), 'audit.lock')
    fs.mkdirSync(l)
    fs.writeFileSync(path.join(l, 'pid'), String(process.pid))
    expect(() => takeLock(l)).toThrow(/already running/)
  })

  it('falls back to age when the holder died before writing its pid', () => {
    const fresh = path.join(tmpdir(), 'fresh.lock')
    fs.mkdirSync(fresh)
    expect(() => takeLock(fresh)).toThrow(/already running \(pid unknown\)/)
    const old = path.join(tmpdir(), 'old.lock')
    fs.mkdirSync(old)
    const release = takeLock(old, { now: Date.now() + 7 * 60 * 60 * 1000 })
    expect(fs.existsSync(path.join(old, 'pid'))).toBe(true)
    release()
  })

  it('treats a garbage pid file as no pid and falls back to age', () => {
    const l = path.join(tmpdir(), 'audit.lock')
    fs.mkdirSync(l)
    fs.writeFileSync(path.join(l, 'pid'), 'not-a-pid')
    expect(() => takeLock(l)).toThrow(/already running \(not-a-pid\)/)
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
