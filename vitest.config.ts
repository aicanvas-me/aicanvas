import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

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
    environment: 'node',
  },
})
