import { describe, expect, it } from 'vitest'
import { FRAME_HEADER, isFramePayload, isFramedPayloadRequest } from './frame'

// A framed document that gets the lean root layout has no session provider, so
// only routes that render bare may get it. The production 500 this guards:
// "useSession must be used within <SessionProvider>" on a framed page.

const url = (href: string) => new URL(href, 'https://aicanvas.me')

describe('isFramePayload', () => {
  it('accepts the routes that render bare', () => {
    expect(isFramePayload(url('/preview/wave-lines?frame=1&theme=dark'))).toBe(true)
    expect(isFramePayload(url('/design-systems/andromeda/templates/signal-room?frame=1'))).toBe(true)
    expect(isFramePayload(url('/design-systems/andromeda-pro/templates/signal-room?frame=1'))).toBe(true)
  })

  it('refuses routes that ignore the flag, and a missing or wrong flag', () => {
    expect(isFramePayload(url('/pricing?frame=1'))).toBe(false)
    expect(isFramePayload(url('/components/wave-lines?frame=1'))).toBe(false)
    expect(isFramePayload(url('/design-systems/andromeda/templates?frame=1'))).toBe(false)
    expect(isFramePayload(url('/preview/wave-lines'))).toBe(false)
    expect(isFramePayload(url('/preview/wave-lines?frame=2'))).toBe(false)
  })
})

describe('isFramedPayloadRequest', () => {
  const full = { 'sec-fetch-dest': 'iframe', 'sec-fetch-site': 'same-origin', [FRAME_HEADER]: '1' }
  const headers = (h: Record<string, string>) => new Headers(h)

  it('needs all three headers', () => {
    expect(isFramedPayloadRequest(headers(full))).toBe(true)
    for (const name of Object.keys(full)) {
      const rest = { ...full }
      delete rest[name as keyof typeof rest]
      expect(isFramedPayloadRequest(headers(rest))).toBe(false)
    }
  })

  it('refuses a frame from another site', () => {
    expect(isFramedPayloadRequest(headers({ ...full, 'sec-fetch-site': 'cross-site' }))).toBe(false)
  })
})
