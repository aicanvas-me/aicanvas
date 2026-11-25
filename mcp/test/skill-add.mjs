#!/usr/bin/env node
/**
 * `aicanvas-mcp skill add`: install, update, user changes, carried-over files,
 * bad tokens, damaged and hostile downloads, agent choice. Runs against a local
 * stand-in for /api/skills/<slug>/download with a synthetic skill; no network.
 */
import { createServer } from 'node:http'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { zipSync, strToU8 } from 'fflate'

const CLI = fileURLToPath(new URL('../dist/index.js', import.meta.url))
const TOKEN = 'aic_' + 'a'.repeat(48)
const ROTATED = 'aic_' + 'b'.repeat(48)
let pass = 0
const failures = []
const check = (name, ok, detail = '') => { if (ok) pass++; else failures.push(`${name}${detail ? `: ${detail}` : ''}`) }

const skillZip = (version, extra = {}) => zipSync({
  'demo/SKILL.md': strToU8(`---\nname: demo\nmetadata:\n  version: "${version}"\n---\n# demo ${version}\n`),
  'demo/engine/setup.mjs': strToU8(`console.log('setup ${version}')\n`),
  'demo/references/guide.md': strToU8(`guide ${version}\n`),
  ...extra,
})
let served = { zip: skillZip('1.0.0'), version: '1.0.0', sha: null }
const server = createServer((req, res) => {
  const auth = req.headers.authorization
  const json = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)) }
  if (!req.url.startsWith('/api/skills/demo/download') || req.url.includes('token=')) return json(404, { error: 'not-found', message: 'No such skill.' })
  if (auth === `Bearer ${ROTATED}`) return json(401, { error: 'token-changed', message: 'This token no longer matches an account (it was rotated).' })
  if (auth !== `Bearer ${TOKEN}`) return json(403, { error: 'premium-required', message: 'This skill is part of AI Canvas Premium. Upgrade to install it.', upgrade: 'https://aicanvas.me/pricing?ref=skill' })
  const buf = Buffer.from(served.zip)
  res.writeHead(200, {
    'Content-Type': 'application/zip',
    'X-AICanvas-Skill-Version': served.version,
    'X-AICanvas-Skill-Sha256': served.sha ?? createHash('sha256').update(buf).digest('hex'),
  })
  res.end(buf)
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}`

const work = mkdtempSync(join(tmpdir(), 'skill-add-'))
const home = join(work, 'home')
mkdirSync(home)
const run = (args, env = {}, cwd = work) => new Promise((resolve) => {
  // spawnSync would block this process's own test server, so run async.
  import('node:child_process').then(({ spawn }) => {
    const p = spawn(process.execPath, [CLI, 'skill', ...args], {
      cwd, env: { ...process.env, HOME: home, USERPROFILE: home, CLAUDE_CONFIG_DIR: '', CODEX_HOME: '', AICANVAS_TOKEN: '', AICANVAS_SITE_BASE: base, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let out = ''
    p.stdout.on('data', (d) => { out += d }); p.stderr.on('data', (d) => { out += d })
    p.on('close', (code) => resolve({ code, out }))
  })
})
const dir = join(work, 'skills')
const installed = (f) => join(dir, 'demo', ...f.split('/'))

try {
  let r = await run(['add', 'demo', '--token', TOKEN, '--dir', dir])
  check('fresh install exits 0', r.code === 0, r.out)
  check('SKILL.md installed', existsSync(installed('SKILL.md')))
  check('manifest written', existsSync(installed('.aicanvas-skill.json')))
  check('setup line printed', r.out.includes('setup.mjs'), r.out)

  writeFileSync(installed('my-notes.md'), 'mine')
  served = { zip: skillZip('1.1.0'), version: '1.1.0', sha: null }
  r = await run(['add', 'demo', '--token', TOKEN, '--dir', dir])
  check('update exits 0', r.code === 0, r.out)
  check('update replaced files', readFileSync(installed('references/guide.md'), 'utf8') === 'guide 1.1.0\n')
  check('user-added file carried over', readFileSync(installed('my-notes.md'), 'utf8') === 'mine')

  writeFileSync(installed('references/guide.md'), 'my edit')
  served = { zip: skillZip('1.2.0'), version: '1.2.0', sha: null }
  r = await run(['add', 'demo', '--token', TOKEN, '--dir', dir])
  check('changed file stops the update', r.code === 1 && r.out.includes('references/guide.md'), r.out)
  check('changed file left alone', readFileSync(installed('references/guide.md'), 'utf8') === 'my edit')
  r = await run(['add', 'demo', '--token', TOKEN, '--dir', dir, '--force'])
  check('--force updates', r.code === 0 && readFileSync(installed('references/guide.md'), 'utf8') === 'guide 1.2.0\n', r.out)

  r = await run(['add', 'demo', '--token', ROTATED, '--dir', dir])
  check('rotated token explained', r.code === 1 && r.out.includes('rotated'), r.out)
  r = await run(['add', 'demo', '--token', 'aic_' + 'c'.repeat(48), '--dir', dir])
  check('free account sees the upgrade link', r.code === 1 && r.out.includes('pricing'), r.out)
  r = await run(['add', 'demo', '--token', 'nope', '--dir', dir])
  check('malformed token refused locally', r.code === 1 && r.out.includes('does not look like'), r.out)
  r = await run(['add', 'demo', '--dir', dir])
  check('missing token explained', r.code === 1 && r.out.includes('No token'), r.out)

  const envDir = join(work, 'project')
  mkdirSync(envDir)
  writeFileSync(join(envDir, '.env.local'), `# comment\nAICANVAS_TOKEN=${TOKEN}\n`)
  r = await run(['add', 'demo', '--dir', dir], {}, envDir)
  check('token read from .env.local', r.code === 0, r.out)
  check('nothing written into the project', !existsSync(join(envDir, 'demo')) && !existsSync(join(envDir, '.claude')))

  served = { zip: skillZip('1.3.0'), version: '1.3.0', sha: 'f'.repeat(64) }
  r = await run(['add', 'demo', '--token', TOKEN, '--dir', dir])
  check('damaged download refused', r.code === 1 && r.out.includes('fingerprint'), r.out)
  check('damaged download left the install alone', readFileSync(installed('references/guide.md'), 'utf8') === 'guide 1.2.0\n')

  for (const bad of ['demo/../escape.md', 'demo/..\\escape.md', 'other/x.md', 'demo/C:/x.md']) {
    served = { zip: skillZip('9.9.9', { [bad]: strToU8('x') }), version: '9.9.9', sha: null }
    r = await run(['add', 'demo', '--token', TOKEN, '--dir', dir])
    check(`hostile path refused: ${bad}`, r.code === 1 && /Unsafe|Unexpected/.test(r.out), r.out)
  }
  check('nothing escaped the skills folder', !existsSync(join(dir, 'escape.md')) && !existsSync(join(work, 'escape.md')))

  served = { zip: skillZip('1.0.0'), version: '1.0.0', sha: null }
  mkdirSync(join(work, 'other-skills', 'demo'), { recursive: true })
  writeFileSync(join(work, 'other-skills', 'demo', 'SKILL.md'), 'hand copied')
  r = await run(['add', 'demo', '--token', TOKEN, '--dir', join(work, 'other-skills')])
  check('folder not installed by the command is not replaced', r.code === 1 && r.out.includes('not installed by this command'), r.out)

  mkdirSync(join(home, '.claude'), { recursive: true })
  r = await run(['add', 'demo', '--token', TOKEN])
  check('one agent found: installs into ~/.claude/skills', r.code === 0 && existsSync(join(home, '.claude', 'skills', 'demo', 'SKILL.md')), r.out)
  mkdirSync(join(home, '.codex'), { recursive: true })
  r = await run(['add', 'demo', '--token', TOKEN])
  check('several agents without a terminal: asks for --agent', r.code === 1 && r.out.includes('--agent'), r.out)
  r = await run(['add', 'demo', '--token', TOKEN, '--agent', 'all'])
  check('--agent all installs Codex into ~/.agents/skills', r.code === 0 && existsSync(join(home, '.agents', 'skills', 'demo', 'SKILL.md')), r.out)
  check('nothing new in ~/.codex/skills', !existsSync(join(home, '.codex', 'skills', 'demo')))
  check('says how to call it in each agent', r.out.includes('/demo in Claude Code') && r.out.includes('$demo in Codex'), r.out)
  r = await run(['add', 'demo', '--token', TOKEN, '--agent', 'codex'], { CODEX_HOME: join(work, 'codex-home') })
  check('CODEX_HOME is honoured', r.code === 0 && existsSync(join(work, 'codex-home', 'skills', 'demo', 'SKILL.md')), r.out)

  // An install from before Codex moved to ~/.agents/skills keeps being updated where it is.
  const home2 = join(work, 'home2'), earlier = join(home2, '.codex', 'skills')
  const h2 = { HOME: home2, USERPROFILE: home2 }
  mkdirSync(home2)
  r = await run(['add', 'demo', '--token', TOKEN, '--dir', earlier], h2)
  check('earlier Codex install made', r.code === 0, r.out)
  r = await run(['add', 'demo', '--token', TOKEN], h2)
  check('only Codex found: updates the earlier install', r.code === 0 && r.out.includes(join(earlier, 'demo')), r.out)
  check('no second copy in ~/.agents/skills', !existsSync(join(home2, '.agents', 'skills', 'demo')))

  // A file the user added where a new version ships one: stop, --force replaces it.
  writeFileSync(installed('NEWS.md'), 'my news')
  served = { zip: skillZip('2.0.0', { 'demo/NEWS.md': strToU8('ours') }), version: '2.0.0', sha: null }
  r = await run(['add', 'demo', '--token', TOKEN, '--dir', dir])
  check('a user file in the way stops the update', r.code === 1 && r.out.includes('NEWS.md'), r.out)
  check('the user file is left alone', readFileSync(installed('NEWS.md'), 'utf8') === 'my news')
  r = await run(['add', 'demo', '--token', TOKEN, '--dir', dir, '--force'])
  check('--force replaces it', r.code === 0 && readFileSync(installed('NEWS.md'), 'utf8') === 'ours', r.out)

  // Case only: a disk that ignores case sees one file.
  writeFileSync(installed('notes.md'), 'mine, lower case')
  served = { zip: skillZip('2.1.0', { 'demo/NOTES.md': strToU8('ours') }), version: '2.1.0', sha: null }
  r = await run(['add', 'demo', '--token', TOKEN, '--dir', dir])
  check('a case-only clash stops the update', r.code === 1 && r.out.includes('notes.md'), r.out)

  // With two targets, a stop in the second leaves the first untouched.
  const two = { CLAUDE_CONFIG_DIR: join(work, 'cfg-a'), CODEX_HOME: join(work, 'cfg-b') }
  served = { zip: skillZip('3.0.0'), version: '3.0.0', sha: null }
  r = await run(['add', 'demo', '--token', TOKEN, '--agent', 'all'], two)
  check('two targets installed', r.code === 0, r.out)
  writeFileSync(join(work, 'cfg-b', 'skills', 'demo', 'references', 'guide.md'), 'changed in b')
  served = { zip: skillZip('3.1.0'), version: '3.1.0', sha: null }
  r = await run(['add', 'demo', '--token', TOKEN, '--agent', 'all'], two)
  check('a stop in one target', r.code === 1 && r.out.includes('guide.md'), r.out)
  check('leaves the other target as it was', readFileSync(join(work, 'cfg-a', 'skills', 'demo', 'references', 'guide.md'), 'utf8') === 'guide 3.0.0\n')

  r = await run(['add', 'demo', '-h'])
  check('-h shows help, installs nothing', r.code === 0 && r.out.includes('skill add'), r.out)
  r = await run(['add', 'demo', '--agnet', 'claude', '--token', TOKEN])
  check('an unknown option is refused', r.code === 1 && r.out.includes('Unknown option'), r.out)
  r = await run(['remove', 'demo'])
  check('unknown action exits 1', r.code === 1)
  const help = spawnSync(process.execPath, [CLI, 'skill', '--help'], { encoding: 'utf8' })
  check('--help exits 0', help.status === 0 && help.stdout.includes('skill add'))
} finally {
  server.close()
  rmSync(work, { recursive: true, force: true })
}

console.log(`skill add: ${pass} passed, ${failures.length} failed`)
for (const f of failures) console.log('  FAIL ' + f)
process.exit(failures.length ? 1 : 0)
