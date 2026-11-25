// Builds one zip per paid agent skill (manifest `skills`) from the vault's TRACKED files,
// for app/api/skills/[slug]/download. Output is gitignored: skills-premium/<slug>.zip
// plus skills-premium/_skills.json (version, sha256, bytes per skill).
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { zipSync } from 'fflate'

export const SKILLS_DIR = 'skills-premium'
// Vercel caps a function response at 4.5 MB; leave room for headers.
export const MAX_ZIP_BYTES = 4 * 1024 * 1024
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
// Fixed timestamp so the same vault commit always yields the same zip bytes.
const MTIME = new Date('2026-01-01T00:00:00Z')

/** A missing or malformed `skills` key reads as none, so an older pin still builds. */
export function manifestSkills(manifest) {
  return Array.isArray(manifest?.skills) ? manifest.skills.filter((s) => typeof s === 'string') : []
}

export function skillVersion(skillMd) {
  return (skillMd.match(/^\s+version:\s*"?([^"\n]+?)"?\s*$/m) || [])[1] || null
}

/**
 * Zips each skill. A problem is a listed skill that could not ship;
 * the caller decides how loud to fail.
 * @returns {{ built: Record<string, { version: string | null, sha256: string, bytes: number, files: number }>, problems: string[] }}
 */
export function buildSkillZips(source, root, slugs) {
  const out = join(root, SKILLS_DIR)
  rmSync(out, { recursive: true, force: true })
  /** @type {Record<string, { version: string | null, sha256: string, bytes: number, files: number }>} */
  const built = {}
  const problems = []
  for (const slug of slugs) {
    if (!SLUG.test(slug)) { problems.push(`skill "${slug}" is not a valid slug`); continue }
    const dir = `skills/${slug}`
    let tracked
    try {
      tracked = execFileSync('git', ['-C', source, 'ls-files', '-z', '--', dir], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
        .split('\0').filter(Boolean)
    } catch (e) {
      problems.push(`skill "${slug}": git ls-files failed: ${e.message}`); continue
    }
    if (!tracked.includes(`${dir}/SKILL.md`)) { problems.push(`skill "${slug}": ${dir}/SKILL.md is not tracked in the vault`); continue }
    const entries = {}
    for (const rel of tracked.sort()) {
      const file = join(source, rel)
      // A tracked file deleted in a dev checkout is simply not shipped.
      try { if (!statSync(file).isFile()) continue } catch { continue }
      entries[`${slug}/${rel.slice(dir.length + 1)}`] = [new Uint8Array(readFileSync(file)), { mtime: MTIME }]
    }
    const zip = zipSync(entries, { level: 9 })
    if (zip.length > MAX_ZIP_BYTES) { problems.push(`skill "${slug}": zip is ${zip.length} bytes, over the ${MAX_ZIP_BYTES} byte limit`); continue }
    mkdirSync(out, { recursive: true })
    writeFileSync(join(out, `${slug}.zip`), zip)
    built[slug] = {
      version: skillVersion(readFileSync(join(source, dir, 'SKILL.md'), 'utf8')),
      sha256: createHash('sha256').update(zip).digest('hex'),
      bytes: zip.length,
      files: Object.keys(entries).length,
    }
  }
  mkdirSync(out, { recursive: true })
  writeFileSync(join(out, '_skills.json'), JSON.stringify(built, null, 2) + '\n')
  return { built, problems }
}
