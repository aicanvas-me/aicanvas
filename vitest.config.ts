import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// The Andromeda Pro suites read a tree that arrives from the private vault at
// build time, so a clone has nothing for them to assert on and they are excluded
// there rather than failing a contributor's `npm test`. The warning below is what
// keeps a skipped premium suite from passing for a full run before a ship.
// Nothing else is excluded: the hosted-MCP and icon-download suites skip only
// their own vault-dependent cases, so their 401, 403 and 503 gates still run.
const dir = (p: string) => fileURLToPath(new URL(p, import.meta.url))
const premiumInjected = existsSync(dir('./design-systems/andromeda-pro/components'))
const vaultOnly = premiumInjected ? [] : ['app/_lib/andromeda-pro/**']
if (vaultOnly.length) console.warn(`vitest: no vault on disk, not running ${vaultOnly.join(', ')}`)

export default defineConfig({
  resolve: {
    alias: {
      // Mirror tsconfig's `@/*` → project root so route tests can import via `@/…`.
      '@': fileURLToPath(new URL('.', import.meta.url)),
      // `server-only` throws when evaluated outside an RSC build; swap its no-op
      // stub so server modules (e.g. the real registry lookup) load under vitest.
      'server-only': fileURLToPath(new URL('./node_modules/server-only/empty.js', import.meta.url)),
    },
  },
  test: {
    include: ['lib/**/*.test.ts', 'app/**/*.test.ts', 'app/**/*.test.tsx', 'scripts/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/.next/**', ...vaultOnly],
    environment: 'node',
    // Four suites render the whole 78-component rail or the icon wall several
    // times over. On an idle laptop the slowest sits at 21s; on a two-core CI
    // box under 80 files of contention it needs multiples of that, and vitest's
    // 5s default fails them for being slow rather than wrong. A hung run is
    // caught by the workflow's timeout-minutes, not by this number.
    testTimeout: 120_000,
    hookTimeout: 120_000,
    // Half the cores, not all of them. Those same suites starve the main thread
    // when every core is a worker, and vitest then exits non-zero on an internal
    // "Timeout calling onTaskUpdate" with every test passing.
    maxWorkers: '50%',
  },
})
