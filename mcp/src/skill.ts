/**
 * `aicanvas-mcp skill add <slug>`: installs a paid AI Canvas agent skill into the
 * user-level skills folder of each chosen agent, never into a project.
 *
 * Token: --token, then AICANVAS_TOKEN, then AICANVAS_TOKEN in ./.env.local.
 * The token travels in an Authorization header, never in the address.
 * A reinstall updates the skill but stops before overwriting a file the user
 * changed (--force overwrites). Files the user added are carried over.
 */

import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, readlinkSync, renameSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { inflateRawSync } from 'node:zlib'

const TOKEN_RE = /^aic_[0-9a-f]{48}$/
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MANIFEST = '.aicanvas-skill.json'
const MAX_FILES = 2000
const MAX_BYTES = 64 * 1024 * 1024

type Options = { siteBase: string; userAgent: string }
type Entry = { path: string; data: Buffer }
type Installed = { slug: string; version: string | null; files: Record<string, string> }

const AGENTS: Record<string, { label: string; home: () => string }> = {
  claude: { label: 'Claude Code', home: () => process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude') },
  codex: { label: 'Codex', home: () => process.env.CODEX_HOME || join(homedir(), '.codex') },
}

const HELP = `Install an AI Canvas Premium agent skill.

  npx -y @aicanvas/mcp@latest skill add <name> --token aic_...

Options
  --token <aic_...>   your AI Canvas install token (or set AICANVAS_TOKEN)
  --agent <name>      claude, codex or all (asked when several are found)
  --dir <path>        install into this skills folder instead
  --force             overwrite files you changed since the last install

The skill goes into your user-level skills folder (for example ~/.claude/skills),
never into a project. Running it again updates the skill.`

class Stop extends Error {}
const stop = (msg: string): never => { throw new Stop(msg) }
const sha256 = (b: Buffer | Uint8Array) => createHash('sha256').update(b).digest('hex')

function parseArgs(argv: string[]) {
  const flags: Record<string, string | true> = {}
  const rest: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--force' || a === '--help' || a === '-h') flags[a.replace(/^-+/, '')] = true
    else if (a.startsWith('--')) {
      const [key, inline] = a.slice(2).split(/=(.*)/s)
      const value = inline ?? argv[++i]
      if (value === undefined || value.startsWith('--')) stop(`--${key} needs a value.`)
      flags[key] = value
    } else rest.push(a)
  }
  return { flags, rest }
}

function readToken(flag: string | true | undefined): string {
  const fromEnvFile = () => {
    try {
      const m = readFileSync(join(process.cwd(), '.env.local'), 'utf8').match(/^\s*AICANVAS_TOKEN\s*=\s*["']?([^"'\s#]+)/m)
      return m?.[1] ?? ''
    } catch { return '' }
  }
  const token = (typeof flag === 'string' ? flag : '') || process.env.AICANVAS_TOKEN || fromEnvFile()
  if (!token) stop('No token. Copy the install command from https://aicanvas.me/skills#whoosh (signed in as Premium), or pass --token aic_...')
  if (!TOKEN_RE.test(token)) stop('That token does not look like an AI Canvas token (aic_ followed by 48 characters).')
  return token
}

/** Reads the zips our server builds: stored or deflated entries, no zip64, no encryption. */
export function unzip(buf: Buffer): Entry[] {
  let eocd = -1
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 22 - 65535); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) stop('The download is not a zip file.')
  const count = buf.readUInt16LE(eocd + 10)
  let p = buf.readUInt32LE(eocd + 16)
  if (count > MAX_FILES) stop('The download has too many files.')
  const out: Entry[] = []
  let total = 0
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) stop('The download is a damaged zip file.')
    const flags = buf.readUInt16LE(p + 8)
    const method = buf.readUInt16LE(p + 10)
    const size = buf.readUInt32LE(p + 20)
    const raw = buf.readUInt32LE(p + 24)
    const nameLen = buf.readUInt16LE(p + 28)
    const extraLen = buf.readUInt16LE(p + 30)
    const commentLen = buf.readUInt16LE(p + 32)
    const local = buf.readUInt32LE(p + 42)
    const name = buf.subarray(p + 46, p + 46 + nameLen).toString('utf8')
    p += 46 + nameLen + extraLen + commentLen
    if (flags & 1) stop('The download is encrypted.')
    if (size === 0xffffffff || raw === 0xffffffff || local === 0xffffffff) stop('The download uses zip64, which is not supported.')
    if (name.endsWith('/')) continue
    if (buf.readUInt32LE(local) !== 0x04034b50) stop('The download is a damaged zip file.')
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28)
    const body = buf.subarray(start, start + size)
    const data = method === 0 ? Buffer.from(body) : method === 8 ? inflateRawSync(body) : stop(`Unsupported zip method ${method}.`)
    if (data.length !== raw) stop('The download is a damaged zip file.')
    total += data.length
    if (total > MAX_BYTES) stop('The download is larger than any skill should be.')
    out.push({ path: name, data })
  }
  return out
}

/** Zip path -> path parts under the skill folder; refuses anything that could land outside it. */
export function safeParts(zipPath: string, slug: string): string[] {
  const parts = zipPath.split('/')
  if (parts[0] !== slug || parts.length < 2) stop(`Unexpected file in the download: ${zipPath}`)
  const inner = parts.slice(1)
  for (const s of inner) {
    if (!s || s === '.' || s === '..' || /[\\:\0]/.test(s) || /[. ]$/.test(s)) stop(`Unsafe file name in the download: ${zipPath}`)
  }
  return inner
}

function walk(dir: string, base = dir): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name)
    if (e.isSymbolicLink()) return [relative(base, full).split(sep).join('/')]
    return e.isDirectory() ? walk(full, base) : [relative(base, full).split(sep).join('/')]
  })
}

function readInstalled(dest: string): Installed | null {
  try { return JSON.parse(readFileSync(join(dest, MANIFEST), 'utf8')) as Installed } catch { return null }
}

function retryRename(from: string, to: string) {
  // Windows antivirus and indexers can hold a fresh folder for a moment.
  for (let i = 1; ; i++) {
    try { renameSync(from, to); return } catch (e) {
      if (i === 10) throw e
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200 * i)
    }
  }
}

function installInto(skillsDir: string, slug: string, version: string | null, entries: Entry[], force: boolean): string {
  const dest = join(skillsDir, slug)
  const files: Record<string, string> = {}
  for (const e of entries) files[safeParts(e.path, slug).join('/')] = sha256(e.data)

  let keep: string[] = []
  if (existsSync(dest) || isSymlink(dest)) {
    if (isSymlink(dest) || !statSync(dest).isDirectory()) {
      if (!force) stop(`${dest} is a link or a file, not an installed copy. Move it away, or add --force to replace it.`)
    } else {
      const before = readInstalled(dest)
      if (!before && !force) stop(`${dest} exists but was not installed by this command. Move it away, or add --force to replace it.`)
      if (before) {
        const changed = Object.entries(before.files).filter(([f, h]) => {
          try { return sha256(readFileSync(join(dest, ...f.split('/')))) !== h } catch { return false }
        }).map(([f]) => f)
        if (changed.length && !force) {
          stop(`You changed ${changed.length} file(s) in ${dest}:\n  ${changed.join('\n  ')}\nCopy your changes somewhere safe, then add --force to update.`)
        }
        // Files the user added (renders, their own notes) are not ours: carry them over.
        keep = walk(dest).filter((f) => f !== MANIFEST && !Object.hasOwn(before.files, f) && !Object.hasOwn(files, f))
      }
    }
  }

  mkdirSync(skillsDir, { recursive: true })
  const tmp = join(skillsDir, `.${slug}.new-${process.pid}`)
  const old = join(skillsDir, `.${slug}.old-${process.pid}`)
  rmSync(tmp, { recursive: true, force: true })
  try {
    const root = resolve(tmp)
    for (const e of entries) {
      const target = resolve(root, ...safeParts(e.path, slug))
      if (!target.startsWith(root + sep)) stop(`Unsafe file name in the download: ${e.path}`)
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, e.data)
    }
    for (const f of keep) {
      const from = join(dest, ...f.split('/'))
      const to = join(tmp, ...f.split('/'))
      mkdirSync(dirname(to), { recursive: true })
      // Copied, not moved: if the swap fails the old folder must still hold them.
      if (isSymlink(from)) symlinkSync(readlinkSync(from), to)
      else copyFileSync(from, to)
    }
    writeFileSync(join(tmp, MANIFEST), JSON.stringify({ slug, version, files } satisfies Installed, null, 1) + '\n')
    if (existsSync(dest) || isSymlink(dest)) retryRename(dest, old)
    retryRename(tmp, dest)
  } catch (e) {
    rmSync(tmp, { recursive: true, force: true })
    throw e
  }
  rmSync(old, { recursive: true, force: true })
  return dest
}

function isSymlink(p: string): boolean {
  try { return lstatSync(p).isSymbolicLink() } catch { return false }
}

async function chooseTargets(flags: Record<string, string | true>): Promise<{ label: string; dir: string }[]> {
  if (typeof flags.dir === 'string') {
    return [{ label: flags.dir, dir: resolve(flags.dir.replace(/^~(?=$|[\\/])/, homedir())) }]
  }
  const all = Object.entries(AGENTS).map(([id, a]) => ({ id, label: a.label, dir: join(a.home(), 'skills') }))
  if (typeof flags.agent === 'string') {
    if (flags.agent === 'all') return all
    const hit = all.find((a) => a.id === flags.agent)
    return hit ? [hit] : stop(`--agent must be ${Object.keys(AGENTS).join(', ')} or all.`)
  }
  const found = all.filter((a) => existsSync(dirname(a.dir)))
  if (found.length <= 1) return found.length ? found : [all[0]]
  const list = found.map((a, i) => `  ${i + 1}. ${a.label}  (${a.dir})`).join('\n')
  if (!process.stdin.isTTY) {
    stop(`Found several agents:\n${list}\nRun the command again with --agent ${found.map((a) => a.id).join(', --agent ')} or --agent all.`)
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = (await rl.question(`Found several agents:\n${list}\n  ${found.length + 1}. All of them\nInstall for which? [${found.length + 1}] `)).trim()
  rl.close()
  const n = answer === '' ? found.length + 1 : Number(answer)
  if (n === found.length + 1) return found
  return found[n - 1] ? [found[n - 1]] : stop('No agent chosen; nothing installed.')
}

async function download(slug: string, token: string, opts: Options) {
  const url = `${opts.siteBase}/api/skills/${encodeURIComponent(slug)}/download`
  let res: Response
  try {
    res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, 'User-Agent': opts.userAgent, Accept: 'application/zip' } })
  } catch (e) {
    return stop(`Could not reach ${opts.siteBase}: ${(e as Error).message}`)
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string; upgrade?: string } | null
    stop(`${body?.message ?? `Download failed (HTTP ${res.status}).`}${body?.upgrade ? `\nPlans: ${body.upgrade}` : ''}`)
  }
  const zip = Buffer.from(await res.arrayBuffer())
  const want = res.headers.get('x-aicanvas-skill-sha256')
  if (want && sha256(zip) !== want) stop('The download was damaged on the way (its fingerprint does not match). Run the command again.')
  return { zip, version: res.headers.get('x-aicanvas-skill-version') || null }
}

/** Runs `skill ...`; returns the process exit code. */
export async function runSkillCommand(argv: string[], opts: Options): Promise<number> {
  try {
    const { flags, rest } = parseArgs(argv)
    if (flags.help || rest.length === 0) { console.log(HELP); return rest.length === 0 && !flags.help ? 1 : 0 }
    const [action, slug] = rest
    if (action !== 'add' || !slug || rest.length > 2) stop(`Unknown command. ${HELP}`)
    if (!SLUG_RE.test(slug)) stop(`"${slug}" is not a skill name.`)
    const token = readToken(flags.token)
    const targets = await chooseTargets(flags)
    const { zip, version } = await download(slug, token, opts)
    const entries = unzip(zip)
    if (!entries.some((e) => e.path === `${slug}/SKILL.md`)) stop('The download has no SKILL.md.')
    for (const t of targets) {
      const dest = installInto(t.dir, slug, version, entries, flags.force === true)
      console.log(`Installed ${slug}${version ? ` ${version}` : ''} for ${t.label}: ${dest}`)
    }
    const setup = join(targets[0].dir, slug, 'engine', 'setup.mjs')
    if (existsSync(setup)) console.log(`\nOne-time setup on this machine (your agent also runs it the first time):\n  node "${setup}"`)
    console.log(`\nLicensed under the AI Canvas Premium License: https://aicanvas.me/premium-license`)
    return 0
  } catch (e) {
    if (e instanceof Stop) { console.error(e.message); return 1 }
    console.error(`skill add failed: ${(e as Error).message}`)
    return 1
  }
}
