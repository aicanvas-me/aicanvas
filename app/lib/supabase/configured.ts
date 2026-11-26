// A clone with no Supabase keys serves the catalog: the proxy, the root layout and
// the session provider skip the client instead of constructing one that throws.
// Read per call, never once at module load: a server that receives its env at
// runtime must not be frozen into "signed out" by what the bundle was built with.
export const supabaseConfigured = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
