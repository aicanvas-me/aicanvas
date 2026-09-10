// Per-instance and best-effort: serverless instances are ephemeral and unshared,
// so this is a speed bump, not a guarantee.
const WINDOW_MS = 10 * 60 * 1000

export function rateLimiter(maxPerWindow: number): (ip: string) => boolean {
  const hits = new Map<string, number[]>()

  return (ip) => {
    const now = Date.now()
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
    recent.push(now)
    hits.set(ip, recent)
    if (hits.size > 5000) {
      for (const [k, v] of hits) {
        if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k)
      }
    }
    return recent.length > maxPerWindow
  }
}
