let warned = false

// A clone with no Supabase keys serves the catalog: the proxy, the root layout and
// the session provider skip the client instead of constructing one that throws.
// Read per call, never once at module load: a server that receives its env at
// runtime must not be frozen into "signed out" by what the bundle was built with.
export const supabaseConfigured = () => {
  const ok = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  // In production this is never false. If it ever is, every visitor is served
  // signed out, subscribers included, and the page still renders: one loud line
  // is what stops that from being silent.
  if (!ok && !warned && process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    warned = true
    console.error('[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is unset: every visitor is served signed out')
  }
  return ok
}
