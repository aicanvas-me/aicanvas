import { describe, it, expect, vi } from 'vitest'

// The manifest read is the only boundary. First call fails, every later call
// succeeds, which is what a transient read failure on a warm instance looks like.
const readFileSync = vi.fn()
vi.mock('node:fs', () => ({ readFileSync: (...args: unknown[]) => readFileSync(...args) }))

import { loadContentLookup } from './lookup'

const manifest = JSON.stringify({
  systemSlugs: ['andromeda'],
  designSystemSlugs: ['andromeda-alert'],
  templateSlugs: ['andromeda-mission-control'],
  premiumSlugs: ['aurora-pricing-table'],
  brainSlugs: ['andromeda-brain'],
})

describe('loadContentLookup', () => {
  it('a failed manifest read degrades only that request; the next one retries and recovers', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    readFileSync.mockImplementationOnce(() => { throw new Error('EIO') })
    readFileSync.mockImplementation(() => manifest)

    expect(loadContentLookup().degraded).toBe(true)
    const recovered = loadContentLookup()
    expect(recovered.degraded).toBeFalsy()
    expect(recovered.premiumSlugs.has('aurora-pricing-table')).toBe(true)
    // Recovered once, cached from then on: no further reads.
    loadContentLookup()
    expect(readFileSync).toHaveBeenCalledTimes(2)
  })
})
