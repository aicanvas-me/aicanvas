import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Some suites read trees that arrive from the private vault at build time: the
// Andromeda Pro matrix and tone rules, and the icon download route. A clone has
// none of that, so they are excluded there instead of failing a contributor's
// `npm test` for content they cannot have. With the vault present nothing is
// excluded, and the warning below is what keeps a skipped premium suite from
// passing for a full run before a ship. The hosted-MCP route is NOT excluded:
// its door cases need no vault and it skips only its premium cases itself.
const dir = (p: string) => fileURLToPath(new URL(p, import.meta.url))
const premiumInjected = existsSync(dir('./design-systems/andromeda-pro/components'))
const iconsBuilt = existsSync(dir('./.icons-source'))
const vaultOnly = [
  ...(premiumInjected ? [] : ['app/_lib/andromeda-pro/**']),
  ...(iconsBuilt ? [] : ['app/api/icons/**']),
]
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
  },
})
