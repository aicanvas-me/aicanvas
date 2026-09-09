import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { createAdminClient } from '@/app/lib/supabase/admin'
import { deriveTier, type SubStatus } from '@/lib/identity/tier'
import { BrainViewer } from '../BrainViewer'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Andromeda Brain: Premium Design Intelligence',
  description:
    'The judgment layer for Andromeda: foundations and per-component rules, the intelligence behind every build decision.',
  robots: { index: false, follow: false },
}

interface BrainRegistryFile {
  path: string
  content: string
  type: string
}

// The Brain reader (gated). The marketing story landing is the PUBLIC parent
// route (../page.tsx); this child route is the premium-only content: the same
// tier check as before, just relocated under /brain/explore.
export default async function AndromedaBrainReaderPage() {
  // Resolve tier via cookie session (server component, no Request object)
  let tier: 'anonymous' | 'free' | 'premium' = 'anonymous'
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const admin = createAdminClient()
      const { data, error } = await admin
        .from('user_subscriptions')
        .select('status, current_period_end')
        .eq('user_id', user.id)
        .maybeSingle()
      // A failed read here should not silently downgrade a paying user — throw
      // so the outer catch renders the paywall (safe) instead of serving content.
      if (error) throw error
      tier = deriveTier({
        hasUser: true,
        status: (data?.status ?? 'none') as SubStatus,
        currentPeriodEnd: data?.current_period_end ?? null,
      })
    }
  } catch {
    // Fail closed: entitlement error → treated as non-premium below (never serve brain content)
  }

  // Non-premium: the pitch lives on the public /brain story page. The old
  // BrainPaywall pre-split pitch was deleted 2026-08-03; this redirect replaced it.
  if (tier !== 'premium') {
    redirect('/design-systems/andromeda/brain')
  }

  // Premium: load brain files from the generated bundle. The UNDERSCORE name is
  // load-bearing — the /r/[file] route's filename regex rejects underscores
  // (same convention as _manifest.json / _premium.json), so this premium bundle
  // is structurally unservable to the public. Written by inject-premium.mjs;
  // bundled into the Vercel serverless function via outputFileTracingIncludes
  // in next.config.ts.
  let files: BrainRegistryFile[] = []
  try {
    const raw = readFileSync(
      join(process.cwd(), 'registry-data', '_andromeda-brain.json'),
      'utf8',
    )
    const parsed = JSON.parse(raw)
    files = (parsed.files ?? []) as BrainRegistryFile[]
    if (files.length === 0) throw new Error('empty brain bundle')
  } catch {
    // Premium user, unreadable/empty bundle (degraded build). Never redirect a
    // paying subscriber to the pitch page; tell them plainly instead.
    return (
      <div className="flex-1 bg-sand-50 text-sand-600 dark:bg-sand-950 dark:text-sand-400" style={{ padding: '40px 48px', maxWidth: 720, fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono Variable'), 'JetBrains Mono', monospace" }}>
        <h1 className="text-sand-900 dark:text-sand-50" style={{ fontSize: 15, marginBottom: 12 }}>Brain temporarily unavailable</h1>
        <p style={{ fontSize: 13, lineHeight: 1.6 }}>
          Your Premium access is active, but the Brain files could not be loaded
          on this deployment. This resolves on the next build. If it persists,
          write to us and we will fix it.
        </p>
      </div>
    )
  }

  // The reader paints from its own palette in both themes (see BrainViewer);
  // the page ground belongs to the scroll column (AndromedaContentColumn), so
  // it holds past this box's height.
  return (
    <div className="flex flex-col">
      <BrainViewer files={files} />
    </div>
  )
}
