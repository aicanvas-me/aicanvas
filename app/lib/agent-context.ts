import 'server-only'
import { NextRequest } from 'next/server'
import { GET as registryGET } from '@/app/r/[file]/route'
import { getEntitlement } from '@/app/lib/entitlement'
import { createAdminClient } from '@/app/lib/supabase/admin'
import { classifyContent, type ContentType } from '@/lib/registry/content-type'
import { loadContentLookup } from '@/lib/registry/lookup'
import type { ToolContext } from '@/mcp/src/tools'

// The hosted MCP is one more token caller of the registry: every file it reads goes through
// the /r handler in this process, with the account's current token, so the same gate decides
// the same bytes the npm package gets. Nothing here grants access; /r stays the enforcer.

export const REGISTRY_BASE = 'https://aicanvas.me/r'

// The content types /r answers with a placeholder unless the caller is premium. Labels read
// this so they match what /r will do by construction.
const PREMIUM_ONLY: ReadonlySet<ContentType> = new Set(['design-system', 'template', 'premium-standalone', 'brain'])

export type Plan = 'free' | 'premium'

export interface AgentContext extends ToolContext {
  userId: string
  plan: Plan
}

/**
 * The tool context for one hosted request, from the account's API token. Null when the token
 * matches no account (rotated or never issued), which the route answers with a 401. A failed
 * subscription read throws, like it does for /r, and the route answers 503. `siteOrigin` is
 * the site the agent connected through, so a local or preview server hands out its own /r.
 */
export async function agentContext(token: string, siteOrigin: string): Promise<AgentContext | null> {
  const entitlement = await getEntitlement(
    new Request(`${REGISTRY_BASE}/aicanvas-mcp.json`, { headers: { authorization: `Bearer ${token}` } }),
  )
  if (entitlement.tier === 'anonymous' || !entitlement.userId) return null
  const plan: Plan = entitlement.tier
  const userId = entitlement.userId
  const lookup = loadContentLookup()

  return {
    userId,
    plan,
    registryBase: `${siteOrigin}/r`,
    token,
    // The token is read fresh for every request, so it cannot have gone stale since setup.
    probeBeforeInstall: false,
    fetchRegistry: (file) =>
      registryGET(
        new NextRequest(`${REGISTRY_BASE}/${file}`, {
          headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
        }),
        { params: Promise.resolve({ file }) },
      ),
    access: {
      plan,
      premium: (slug) => PREMIUM_ONLY.has(classifyContent(slug, lookup)),
      locked: (slug) => plan !== 'premium' && PREMIUM_ONLY.has(classifyContent(slug, lookup)),
    },
    whoami: async () => {
      const { data } = await createAdminClient().auth.admin.getUserById(userId)
      return { email: data.user?.email ?? null, plan }
    },
  }
}

/** What the hosted server tells every agent that connects, before its first tool call. */
export const HOSTED_INSTRUCTIONS = [
  'AI Canvas is a library of React components and design systems (Tailwind v4, Framer Motion), installed with the shadcn CLI.',
  '',
  'Answer any question about AI Canvas (what it has, how many, free or Premium) from these tools, not the website or a web search. The catalog has two parts: standalone components and blocks (list_components) and design systems with their own components (list_systems). A question about what AI Canvas has covers both.',
  '',
  'How to build with it:',
  '1. Find: search_components for one part, or compose_page to plan a whole page from a brief.',
  '2. Read the API: get_component_props before writing JSX for a component you have not read.',
  '3. Install: get_install_command, then run the command it returns in the user\'s project. It needs a components.json; if the project has none, set up shadcn first. The command carries the user\'s own AI Canvas key on purpose: run it as is and keep it out of files that go into git.',
  '4. Check: validate_usage on every file that uses AI Canvas components, then get_audit_checklist.',
  '',
  'Every item has a "tier": free or premium, the same for every account; count free items by tier. "access" is this account: items marked "locked" are AI Canvas Premium and this account cannot install them. Say so and offer the upgrade link; never write a placeholder in their place. whoami tells you which account and plan this connection uses.',
].join('\n')
