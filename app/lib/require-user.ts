import { NextResponse } from 'next/server'
import { createClient } from './supabase/server'

/** The RLS-scoped client plus the signed-in user, or null when there is no session. */
export async function sessionUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

export function unauthenticated() {
  return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
}
