import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

// Premium is a subscription OR a live Lifetime row, decided in ONE place:
// lib/identity/premium.ts. A new page that reads user_subscriptions on its own
// to decide premium would read a Lifetime holder as free. Only the billing
// writers (webhook, checkout fast path, crons, cancel flow) and the
// subscription-display routes may touch the table directly.

const root = join(__dirname, '..', '..')

const ALLOWED = [
  /^lib\/identity\/premium\.ts$/,
  /^lib\/identity\/lifetime\.ts$/,
  /^app\/api\/billing\/portal\/route\.ts$/,
  /^app\/api\/me\/subscription\/route\.ts$/,
  /^app\/api\/cron\/[^/]+\/route\.ts$/,
  /^app\/api\/webhooks\/paddle\/route\.ts$/,
  /^app\/api\/checkout\/completed\/route\.ts$/,
  /^app\/api\/billing\/cancel-[^/]+\/route\.ts$/,
]

const READ = /\.from\(\s*['"`]user_subscriptions['"`]\s*\)/

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(full)
  }
  return out
}

describe('one premium check', () => {
  it('reads user_subscriptions only in the premium check and the billing writers', () => {
    const offenders: string[] = []
    for (const file of [...walk(join(root, 'app')), ...walk(join(root, 'lib'))]) {
      const rel = relative(root, file).split('\\').join('/')
      if (ALLOWED.some((re) => re.test(rel))) continue
      const code = readFileSync(file, 'utf8')
        .split('\n')
        .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
        .join('\n')
      if (READ.test(code)) offenders.push(rel)
    }
    expect(offenders).toEqual([])
  })
})
