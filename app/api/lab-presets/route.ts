import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '../../lib/supabase/server'

// Tools currently in the LAB. Server validates the value so a malformed
// client can't insert garbage into the `tool` column.
const KNOWN_TOOLS = ['60k-particles', 'mesh-gradient', 'noise-field'] as const
type KnownTool = (typeof KNOWN_TOOLS)[number]
function isKnownTool(v: unknown): v is KnownTool {
  return typeof v === 'string' && (KNOWN_TOOLS as readonly string[]).includes(v)
}

// Lab presets — list / create / rename / delete.
// All access is RLS-scoped to the authenticated user's auth.uid().
// Per-user cap so one account cannot fill the table; a preset can legitimately
// be large (inlined image data), so the cap is on rows, not bytes.
const MAX_PRESETS_PER_USER = 100

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ presets: [] })

  const tool = request.nextUrl.searchParams.get('tool')

  let query = supabase
    .from('lab_presets')
    .select('id, tool, name, config, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (tool && isKnownTool(tool)) query = query.eq('tool', tool)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ presets: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'invalid body' }, { status: 400 })

  if (!isKnownTool(body.tool)) {
    return NextResponse.json({ error: 'invalid tool' }, { status: 400 })
  }
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  if (name.length > 80) {
    return NextResponse.json({ error: 'name too long' }, { status: 400 })
  }
  if (!body.config || typeof body.config !== 'object') {
    return NextResponse.json({ error: 'config required' }, { status: 400 })
  }

  const { count } = await supabase
    .from('lab_presets')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  if ((count ?? 0) >= MAX_PRESETS_PER_USER) {
    return NextResponse.json({ error: 'preset limit reached, delete one first' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('lab_presets')
    .insert({
      user_id: user.id,
      tool: body.tool,
      name,
      config: body.config,
    })
    .select('id, tool, name, config, created_at, updated_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ preset: data })
}

// PATCH: rename or overwrite config on an existing preset.
// Body: { id, name?, config? }
export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.id || typeof body.id !== 'string') {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (typeof body.name === 'string') {
    const name = body.name.trim()
    if (!name) return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 })
    if (name.length > 80) return NextResponse.json({ error: 'name too long' }, { status: 400 })
    update.name = name
  }
  if (body.config && typeof body.config === 'object') {
    update.config = body.config
  }
  if (Object.keys(update).length === 1) {
    return NextResponse.json({ error: 'nothing to update' }, { status: 400 })
  }

  const { error } = await supabase
    .from('lab_presets')
    .update(update)
    .eq('id', body.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.id || typeof body.id !== 'string') {
    return NextResponse.json({ error: 'id required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('lab_presets')
    .delete()
    .eq('id', body.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
