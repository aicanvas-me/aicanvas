import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Three suites read trees that arrive from the private vault at build time:
// the Andromeda Pro matrix, the hosted-MCP route (it asserts on a premium slug)
// and the icon download route (it asserts on the built icon set). A clone without
// the vault has none of that, so they are excluded there instead of failing a
// contributor's `npm test` for something they cannot have. With the vault
// present nothing is skipped.
const dir = (p: string) => fileURLToPath(new URL(p, import.meta.url))
const premiumInjected = existsSync(dir('./design-systems/andromeda-pro/components'))
const iconsBuilt = existsSync(dir('./.icons-source'))
const vaultOnly = [
  ...(premiumInjected ? [] : ['app/_lib/andromeda-pro/**', 'app/api/mcp/route.test.ts']),
  ...(iconsBuilt ? [] : ['app/api/icons/**']),
]

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
