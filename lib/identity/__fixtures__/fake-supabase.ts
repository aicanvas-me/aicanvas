// An in-memory stand-in for the supabase-js admin client, for billing tests.
// It runs the query builder calls the billing code makes (select, eq, is, not,
// lt, in, limit, maybeSingle, upsert with onConflict/ignoreDuplicates, insert,
// update) against plain arrays, and enforces the unique columns the migrations
// declare, so a duplicate delivery behaves as it would in Postgres (an upsert
// with ignoreDuplicates skips, a unique clash on update returns 23505).

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>

const UNIQUE: Record<string, string[]> = {
  user_subscriptions: ['user_id', 'paddle_subscription_id'],
  user_lifetime_access: ['paddle_transaction_id'],
  billing_events: ['paddle_event_id', 'alert_key'],
}

export interface FakeUser {
  email: string
  user_metadata: Record<string, unknown>
}

export function fakeSupabase() {
  const tables: Record<string, Row[]> = {}
  const users: Record<string, FakeUser> = {}
  // `${table}:${op}` entries make that operation return an error.
  const failing = new Set<string>()
  let nextId = 1

  const rowsOf = (t: string) => (tables[t] ??= [])

  function clash(table: string, candidate: Row, except: Row[]): boolean {
    return (UNIQUE[table] ?? []).some(
      (col) => candidate[col] != null && rowsOf(table).some((r) => !except.includes(r) && r[col] === candidate[col]),
    )
  }

  function query(table: string) {
    const st = {
      op: 'select' as 'select' | 'upsert' | 'insert' | 'update',
      filters: [] as ((r: Row) => boolean)[],
      payload: [] as Row[],
      patch: {} as Row,
      opts: {} as { onConflict?: string; ignoreDuplicates?: boolean },
      limit: undefined as number | undefined,
      single: false,
    }

    async function exec(): Promise<{ data: any; error: any }> {
      if (failing.has(`${table}:${st.op}`)) return { data: null, error: { message: `forced ${st.op} failure` } }
      const all = rowsOf(table)
      const matched = all.filter((r) => st.filters.every((f) => f(r)))

      if (st.op === 'select') {
        const out = (st.limit != null ? matched.slice(0, st.limit) : matched).map((r) => ({ ...r }))
        if (st.single) {
          if (out.length > 1) return { data: null, error: { message: 'multiple rows' } }
          return { data: out[0] ?? null, error: null }
        }
        return { data: out, error: null }
      }

      if (st.op === 'upsert' || st.op === 'insert') {
        const written: Row[] = []
        for (const incoming of st.payload) {
          const col = st.opts.onConflict
          const existing = col && incoming[col] != null ? all.find((r) => r[col] === incoming[col]) : undefined
          if (existing) {
            if (st.opts.ignoreDuplicates) continue
            if (clash(table, incoming, [existing])) return { data: null, error: { code: '23505', message: 'duplicate key' } }
            Object.assign(existing, incoming)
            written.push(existing)
            continue
          }
          if (clash(table, incoming, [])) {
            if (st.opts.ignoreDuplicates) continue
            return { data: null, error: { code: '23505', message: 'duplicate key' } }
          }
          const row = { id: nextId++, created_at: new Date().toISOString(), ...incoming }
          all.push(row)
          written.push(row)
        }
        return { data: written.map((r) => ({ ...r })), error: null }
      }

      // update
      for (const r of matched) {
        if (clash(table, { ...r, ...st.patch }, [r])) return { data: null, error: { code: '23505', message: 'duplicate key' } }
      }
      if (matched.length > 1 && (UNIQUE[table] ?? []).some((c) => st.patch[c] != null)) {
        return { data: null, error: { code: '23505', message: 'duplicate key' } }
      }
      for (const r of matched) Object.assign(r, st.patch)
      return { data: matched.map((r) => ({ ...r })), error: null }
    }

    const b: any = {
      select: () => b,
      eq: (c: string, v: unknown) => (st.filters.push((r) => r[c] === v), b),
      is: (c: string, v: unknown) => (st.filters.push((r) => (r[c] ?? null) === v), b),
      not: (c: string, _op: 'is', v: unknown) => (st.filters.push((r) => (r[c] ?? null) !== v), b),
      lt: (c: string, v: string) => (st.filters.push((r) => r[c] != null && r[c] < v), b),
      in: (c: string, vs: unknown[]) => (st.filters.push((r) => vs.includes(r[c])), b),
      limit: (n: number) => ((st.limit = n), b),
      order: () => b,
      maybeSingle: () => ((st.single = true), exec()),
      upsert: (rows: Row | Row[], opts: typeof st.opts = {}) => ((st.op = 'upsert'), (st.payload = [rows].flat()), (st.opts = opts), b),
      insert: (rows: Row | Row[]) => ((st.op = 'insert'), (st.payload = [rows].flat()), b),
      update: (patch: Row) => ((st.op = 'update'), (st.patch = patch), b),
      then: (resolve: (v: any) => unknown, reject?: (e: unknown) => unknown) => exec().then(resolve, reject),
    }
    return b
  }

  const client = {
    from: (table: string) => query(table),
    auth: {
      admin: {
        getUserById: async (id: string) => {
          const u = users[id]
          return { data: { user: u ? { id, email: u.email, user_metadata: { ...u.user_metadata } } : null }, error: null }
        },
        createUser: async (attrs: { email: string; user_metadata?: Record<string, unknown> }) => {
          const existing = Object.entries(users).find(([, u]) => u.email === attrs.email)
          if (existing) return { data: { user: null }, error: { code: 'email_exists', message: 'exists' } }
          const id = `00000000-0000-4000-8000-${String(nextId++).padStart(12, '0')}`
          users[id] = { email: attrs.email, user_metadata: { ...(attrs.user_metadata ?? {}) } }
          return { data: { user: { id } }, error: null }
        },
        generateLink: async (attrs: { email: string }) => {
          const existing = Object.entries(users).find(([, u]) => u.email === attrs.email)
          return existing
            ? { data: { user: { id: existing[0] } }, error: null }
            : { data: { user: null }, error: { message: 'no user' } }
        },
        updateUserById: async (id: string, attrs: { user_metadata: Record<string, unknown> }) => {
          if (users[id]) users[id].user_metadata = { ...attrs.user_metadata }
          return { data: { user: users[id] ?? null }, error: null }
        },
      },
    },
  }

  return {
    client,
    tables,
    users,
    failing,
    rows: rowsOf,
    reset() {
      for (const k of Object.keys(tables)) delete tables[k]
      for (const k of Object.keys(users)) delete users[k]
      failing.clear()
      nextId = 1
    },
  }
}
