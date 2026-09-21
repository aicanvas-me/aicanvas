/**
 * gsc-resume.ts — checkpoint + lock for the URL Inspection pass.
 *
 * Why this exists: the weekly audit calls the Inspection API once per sitemap
 * URL and only writes audit.json after the last one. On 2026-09-20 the run
 * stopped 78 minutes in at URL 112 of 212 — no error in either launchd log,
 * which is what the machine going down looks like. All 112 results were lost,
 * and weekly.log never got its DONE line, which the daily pulse reads as a
 * job that has never finished. The list only grows (157 URLs on 09-13, 212 on
 * 09-20), so a run long enough to be interrupted is the normal case now.
 *
 * A checkpoint makes an interrupted run resumable. A lock keeps two runs — the
 * Sunday launchd job and someone running it by hand — from inspecting the same
 * property twice and writing over each other's checkpoint.
 */

import fs from 'fs'
import path from 'path'

/** The shape the audit stores per URL. Only these two fields matter here. */
export type Resumable = { url: string; error?: string }

export type Checkpoint<T extends Resumable = Resumable> = {
  startedAt: string
  property: string
  sitemapUrl: string
  entries: T[]
}

/** A checkpoint older than this describes a different week's index state. */
export const RESUME_MAX_AGE_MS = 24 * 60 * 60 * 1000
/** A full pass took 78 minutes for half the list, so a lock is only abandoned well past that. */
export const LOCK_STALE_MS = 6 * 60 * 60 * 1000

/**
 * The results worth keeping from a checkpoint, keyed by URL.
 *
 * Empty whenever the checkpoint cannot be trusted to describe THIS run: a
 * different property or sitemap, or one old enough that Google's answers have
 * moved on. Entries that failed are never reused — a retry costs one call and
 * a stored error would otherwise survive into the report for good.
 */
export function usableEntries<T extends Resumable>(
  cp: Checkpoint<T> | null | undefined,
  ctx: { property: string; sitemapUrl: string; now?: number; maxAgeMs?: number },
): Map<string, T> {
  const out = new Map<string, T>()
  if (!cp || typeof cp !== 'object' || !Array.isArray(cp.entries)) return out
  if (cp.property !== ctx.property || cp.sitemapUrl !== ctx.sitemapUrl) return out
  const started = Date.parse(cp.startedAt)
  const now = ctx.now ?? Date.now()
  const maxAge = ctx.maxAgeMs ?? RESUME_MAX_AGE_MS
  if (!Number.isFinite(started) || now - started > maxAge || started > now) return out
  for (const e of cp.entries) {
    if (e && typeof e.url === 'string' && !e.error) out.set(e.url, e)
  }
  return out
}

/** The stored checkpoint, or null if there is none or it cannot be parsed. */
export function loadCheckpoint<T extends Resumable>(file: string): Checkpoint<T> | null {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as Checkpoint<T>
  } catch {
    return null
  }
}

/**
 * Write the checkpoint through a temp file and rename.
 * The whole point is surviving a run that stops without warning, so a partly
 * written checkpoint — the one thing worse than none — must not be possible.
 */
export function saveCheckpoint<T extends Resumable>(file: string, cp: Checkpoint<T>): void {
  const tmp = `${file}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(cp))
  fs.renameSync(tmp, file)
}

export function clearCheckpoint(file: string): void {
  for (const f of [file, `${file}.tmp`]) {
    try {
      fs.unlinkSync(f)
    } catch {
      /* already gone */
    }
  }
}

/**
 * Serialise runs. mkdir is the atomic test-and-set.
 * Returns the release function; also released on exit and on Ctrl-C, so a
 * failed run does not leave the next one locked out.
 */
export function takeLock(lockDir: string, opts: { staleMs?: number; now?: number } = {}): () => void {
  const staleMs = opts.staleMs ?? LOCK_STALE_MS
  const now = opts.now ?? Date.now()
  try {
    const age = now - fs.statSync(lockDir).mtimeMs
    // A run killed mid-flight leaves the directory with no process to release it.
    if (age > staleMs) fs.rmSync(lockDir, { recursive: true, force: true })
  } catch {
    /* no lock present */
  }
  try {
    fs.mkdirSync(lockDir)
  } catch {
    let held = 'pid unknown'
    try {
      held = fs.readFileSync(path.join(lockDir, 'pid'), 'utf8').trim() || held
    } catch {
      /* the holder never got to write it */
    }
    throw new Error(
      `another GSC audit is already running (${held}). ` +
        `If that is wrong, remove ${lockDir} and run it again.`,
    )
  }
  fs.writeFileSync(path.join(lockDir, 'pid'), String(process.pid))
  let released = false
  const release = () => {
    if (released) return
    released = true
    try {
      fs.rmSync(lockDir, { recursive: true, force: true })
    } catch {
      /* best effort */
    }
  }
  process.on('exit', release)
  process.on('SIGINT', () => {
    release()
    process.exit(130)
  })
  process.on('SIGTERM', () => {
    release()
    process.exit(143)
  })
  return release
}
