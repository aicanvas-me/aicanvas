// A clone with no Supabase keys still serves the catalogue: the proxy and the
// root layout skip the session read instead of constructing a client that throws.
export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
)
