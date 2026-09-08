import { NextResponse, type NextRequest } from 'next/server'
import { sessionUser, unauthenticated } from '../../lib/require-user'

export async function GET() {
  const { supabase, user } = await sessionUser()
  if (!user) return NextResponse.json({ slugs: [] })

  const { data, error } = await supabase
    .from('saved_components')
    .select('slug')
    .order('saved_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ slugs: (data ?? []).map((row: { slug: string }) => row.slug) })
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await sessionUser()
  if (!user) return unauthenticated()

  const body = await request.json().catch(() => null)
  if (!body?.slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  // Only include `collection` when the caller explicitly asked for it.
  // The heart-toggle SaveButton never sends it, and omitting the field
  // keeps that flow working even if migration 0002 hasn't been applied yet.
  const row: {
    user_id: string
    slug: string
    system: string | null
    collection?: string | null
  } = {
    user_id: user.id,
    slug: body.slug,
    system: body.system ?? null,
  }
  if (body.collection !== undefined) row.collection = body.collection

  const { error } = await supabase
    .from('saved_components')
    .upsert(row)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// Updates the collection of an existing save. Used by the Saved tab's
// inline collection picker — separate from POST so toggling the heart on
// a card doesn't accidentally clear a user-assigned collection.
export async function PATCH(request: NextRequest) {
  const { supabase, user } = await sessionUser()
  if (!user) return unauthenticated()

  const body = await request.json().catch(() => null)
  if (!body?.slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  // collection: string → assign to that name; null/empty → clear (uncategorized).
  const collection = typeof body.collection === 'string' && body.collection.trim()
    ? body.collection.trim()
    : null

  const { error } = await supabase
    .from('saved_components')
    .update({ collection })
    .eq('slug', body.slug)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const { supabase, user } = await sessionUser()
  if (!user) return unauthenticated()

  const body = await request.json().catch(() => null)
  if (!body?.slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  const { error } = await supabase
    .from('saved_components')
    .delete()
    .eq('slug', body.slug)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
