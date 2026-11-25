import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { unzipSync, strFromU8 } from 'fflate'
import { buildSkillZips, manifestSkills, skillVersion, SKILLS_DIR } from './skill-zips.mjs'

let vault: string
let out: string
const git = (...args: string[]) => execFileSync('git', ['-C', vault, ...args], { stdio: 'pipe' })
const write = (rel: string, text: string) => {
  mkdirSync(join(vault, rel, '..'), { recursive: true })
  writeFileSync(join(vault, rel), text)
}

beforeAll(() => {
  vault = mkdtempSync(join(tmpdir(), 'vault-'))
  out = mkdtempSync(join(tmpdir(), 'public-'))
  git('init', '-q')
  write('skills/demo/SKILL.md', '---\nname: demo\nmetadata:\n  version: "2.3.4"\n---\n')
  write('skills/demo/engine/run.mjs', 'run')
  write('skills/nomd/readme.md', 'x')
  git('add', '.')
  // Untracked render output and a gitignored cache must never ship.
  write('skills/demo/examples/a/out/film.mp4', 'video')
  write('skills/demo/.env', 'SECRET=1')
})
afterAll(() => {
  rmSync(vault, { recursive: true, force: true })
  rmSync(out, { recursive: true, force: true })
})

describe('skill zips', () => {
  it('a missing or malformed skills key reads as no skills, so an older pin still builds', () => {
    expect(manifestSkills({ standalones: [] })).toEqual([])
    expect(manifestSkills({ skills: 'whoosh' })).toEqual([])
    expect(manifestSkills({ skills: ['whoosh', 3] })).toEqual(['whoosh'])
    const { built, problems } = buildSkillZips(vault, out, [])
    expect(built).toEqual({})
    expect(problems).toEqual([])
    expect(JSON.parse(readFileSync(join(out, SKILLS_DIR, '_skills.json'), 'utf8'))).toEqual({})
  })

  it('zips tracked files only, under the slug folder, with the SKILL.md version', () => {
    const { built, problems } = buildSkillZips(vault, out, ['demo'])
    expect(problems).toEqual([])
    expect(built.demo.version).toBe('2.3.4')
    const entries = unzipSync(readFileSync(join(out, SKILLS_DIR, 'demo.zip')))
    expect(Object.keys(entries).sort()).toEqual(['demo/SKILL.md', 'demo/engine/run.mjs'])
    expect(strFromU8(entries['demo/engine/run.mjs'])).toBe('run')
  })

  it('the same commit always gives the same zip bytes', () => {
    const a = buildSkillZips(vault, out, ['demo']).built.demo.sha256
    const b = buildSkillZips(vault, out, ['demo']).built.demo.sha256
    expect(a).toBe(b)
  })

  it('reports a listed skill that cannot ship instead of skipping it quietly', () => {
    const { built, problems } = buildSkillZips(vault, out, ['demo', 'nomd', 'missing', '../x'])
    expect(Object.keys(built)).toEqual(['demo'])
    expect(problems).toHaveLength(3)
    expect(existsSync(join(out, SKILLS_DIR, 'nomd.zip'))).toBe(false)
  })

  it('reads the version line with or without quotes', () => {
    expect(skillVersion('metadata:\n  version: 1.0.0\n')).toBe('1.0.0')
    expect(skillVersion('name: x\n')).toBe(null)
  })
})
