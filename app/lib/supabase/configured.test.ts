import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { supabaseConfigured } from './configured'

// A clone with no Supabase keys has to serve the catalog, and three files build a
// client on a path every visitor hits: the proxy, the root layout and the session
// provider. Lose the guard in any of them and the site renders and then blanks
// itself through the root error boundary on hydration, which is how it behaved
// until 9a9484a0. No type sees this: createClient() throws at runtime.
const GUARDED = [
  'app/lib/supabase/proxy.ts',
  'app/layout.tsx',
  'app/components/auth/SessionProvider.tsx',
]

describe('the keyless-clone guard', () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const set = (u?: string, k?: string) => {
    if (u === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL
    else process.env.NEXT_PUBLIC_SUPABASE_URL = u
    if (k === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = k
  }
  afterEach(() => set(url, key))

  it('is true only when both public variables carry a value', () => {
    set('https://project.supabase.co', 'sb_publishable_x')
    expect(supabaseConfigured()).toBe(true)
    set('https://project.supabase.co', undefined)
    expect(supabaseConfigured()).toBe(false)
    set(undefined, 'sb_publishable_x')
    expect(supabaseConfigured()).toBe(false)
    set(undefined, undefined)
    expect(supabaseConfigured()).toBe(false)
    set('', '')
    expect(supabaseConfigured()).toBe(false)
  })

  it('says so in the production logs when a key is missing', async () => {
    // Serving every visitor signed out is survivable; doing it silently is not.
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    set(undefined, undefined)
    vi.stubEnv('NODE_ENV', 'production')
    const fresh = await import('./configured?loud')
    expect(fresh.supabaseConfigured()).toBe(false)
    expect(err).toHaveBeenCalledOnce()
    expect(String(err.mock.calls[0][0])).toContain('signed out')
    fresh.supabaseConfigured()
    expect(err, 'once per process, not once per render').toHaveBeenCalledOnce()
    vi.unstubAllEnvs()
    err.mockRestore()
  })

  it.each(GUARDED)('%s asks before it builds a client', (file) => {
    // Comments name createClient() too, and one of them sits above the guard.
    const src = readFileSync(join(process.cwd(), file), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
    const guard = src.indexOf('supabaseConfigured()')
    const build = src.search(/create(?:Server|Browser)?Client\(/)
    expect(guard, `${file} never calls supabaseConfigured()`).toBeGreaterThan(-1)
    expect(build, `${file} no longer builds a client`).toBeGreaterThan(-1)
    expect(guard, `${file} builds a client before it checks`).toBeLessThan(build)
  })
})
