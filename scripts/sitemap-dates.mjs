// Writes app/lib/sitemap-dates.json: page path -> date of the last commit to its source.
// Runs from .githooks/pre-commit, never in a build: Vercel shallow-clones, so git
// history is missing there. --staged dates pages whose source is in this commit as today.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const OUT = 'app/lib/sitemap-dates.json'
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
const today = new Date().toISOString().slice(0, 10)
const staged = process.argv.includes('--staged')
  ? git('diff', '--cached', '--name-only').split('\n').filter(Boolean)
  : []

// One pass over history: the newest commit date of every file.
const fileDates = new Map()
let current = ''
for (const line of git('log', '--format=@%cs', '--name-only').split('\n')) {
  if (line.startsWith('@')) current = line.slice(1)
  else if (line && !(fileDates.get(line) >= current)) fileDates.set(line, current)
}

const dates = {}
function date(path, owns) {
  let d = staged.some(owns) ? today : ''
  for (const [f, fd] of fileDates) if (fd > d && owns(f)) d = fd
  if (d) dates[path] = d
}

for (const e of readdirSync('components-workspace', { withFileTypes: true })) {
  if (!e.isDirectory()) continue
  const dir = `components-workspace/${e.name}`
  date(`/components/${e.name}`, (f) => f.startsWith(`${dir}/`))
}

// Static routes, dated by the files beside their page.tsx (not nested routes).
function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory() && !/^[_[]/.test(e.name)) walk(join(dir, e.name))
  }
  if (!existsSync(join(dir, 'page.tsx')) || dir === 'app') return
  const route = '/' + dir.split('/').slice(1).filter((s) => !s.startsWith('(')).join('/')
  date(route, (f) => dirname(f) === dir)
}
walk('app')
date('/', (f) => f === 'app/page.tsx' || f.startsWith('app/home/'))

const sorted = Object.fromEntries(Object.entries(dates).sort(([a], [b]) => a.localeCompare(b)))
const next = JSON.stringify(sorted, null, 2) + '\n'
if (!existsSync(OUT) || readFileSync(OUT, 'utf8') !== next) writeFileSync(OUT, next)
