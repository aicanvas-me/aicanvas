import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { prepareCheckoutSignIn } from './checkout-signin'
import { checkoutPasswordFor } from './paddle-provision'
import { fakeSupabase } from './__fixtures__/fake-supabase'

const TXN_ID = 'txn_01aaaaaaaaaaaaaaaaaaaaaaaa'
const USER_ID = '11111111-1111-4111-8111-111111111111'
const LIFETIME_PRICE = 'pri_lifetime'
const EMAIL = 'buyer@example.com'
const ago = (ms: number) => new Date(Date.now() - ms).toISOString()

const ENV_KEYS = ['PADDLE_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'NEXT_PUBLIC_PADDLE_PRICE_LIFETIME']
const savedEnv: Record<string, string | undefined> = {}

type Txn = Record<string, unknown>
const lifetimeItems = [{ price: { id: LIFETIME_PRICE, billing_cycle: null } }]
const subscriptionItems = [{ price: { id: 'pri_monthly', billing_cycle: { interval: 'month', frequency: 1 } } }]

function goodTxn(over: Txn = {}): Txn {
  return {
    id: TXN_ID,
    status: 'completed',
    created_at: ago(60_000),
    customer_id: 'ctm_x',
    custom_data: null,
    items: lifetimeItems,
    ...over,
  }
}

// What the mocked network answers; each test changes these.
let txnAnswer: () => Response
let customerAnswer: () => Response
let searchAnswer: () => Response

const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
  const url = String(input)
  if (url.includes('/transactions/')) return txnAnswer()
  if (url.includes('/customers/')) return customerAnswer()
  if (url.includes('/auth/v1/admin/users')) return searchAnswer()
  throw new Error(`unexpected fetch ${url}`)
})

const db = fakeSupabase()
const updateUserById = vi.fn()
let userRecord: Record<string, unknown>

function adminClient() {
  return {
    from: db.client.from,
    auth: {
      admin: {
        getUserById: async () => ({ data: { user: userRecord }, error: null }),
        updateUserById,
      },
    },
  } as unknown as Parameters<typeof prepareCheckoutSignIn>[0]
}

function lifetimeRow(over: Record<string, unknown> = {}) {
  return { paddle_transaction_id: TXN_ID, user_id: USER_ID, granted_at: ago(30_000), revoked_at: null, ...over }
}

function setup(over: { txn?: Txn; user?: Record<string, unknown>; lifetime?: Record<string, unknown> | null } = {}) {
  const txn = over.txn ?? goodTxn()
  txnAnswer = () => Response.json({ data: txn })
  customerAnswer = () => Response.json({ data: { email: EMAIL } })
  searchAnswer = () => Response.json({ users: [{ id: USER_ID, email: EMAIL }] })
  userRecord = {
    id: USER_ID,
    email: EMAIL,
    created_at: ago(30_000),
    last_sign_in_at: null,
    user_metadata: { anon_provisioned: true },
    ...over.user,
  }
  if (over.lifetime !== null) db.rows('user_lifetime_access').push(lifetimeRow(over.lifetime ?? {}))
}

beforeEach(() => {
  for (const k of ENV_KEYS) savedEnv[k] = process.env[k]
  process.env.PADDLE_API_KEY = 'pdl_test'
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://proj.supabase.co'
  process.env.SUPABASE_SECRET_KEY = 'sb_secret_test'
  process.env.NEXT_PUBLIC_PADDLE_PRICE_LIFETIME = LIFETIME_PRICE
  db.reset()
  fetchMock.mockClear()
  updateUserById.mockReset()
  updateUserById.mockResolvedValue({ data: { user: {} }, error: null })
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k]
    else process.env[k] = savedEnv[k]
  }
})

const claimRows = () => db.rows('billing_events').filter((r) => r.paddle_event_id === `checkout-signin:${TXN_ID}`)

describe('prepareCheckoutSignIn', () => {
  it('hands back the password the account was created with and writes nothing on the account', async () => {
    setup()
    const out = await prepareCheckoutSignIn(adminClient(), TXN_ID)
    expect(out.status).toBe('ready')
    if (out.status !== 'ready') return
    expect(out.email).toBe(EMAIL)
    expect(out.password).toBe(checkoutPasswordFor(EMAIL))
    expect(out.password.length).toBeGreaterThanOrEqual(40)
    expect(claimRows()).toHaveLength(1)
    // A password or metadata write would void the link in the purchase email.
    expect(updateUserById).not.toHaveBeenCalled()
  })

  it('refuses a second call for the same transaction', async () => {
    setup()
    expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('ready')
    expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('refused')
    expect(claimRows()).toHaveLength(1)
  })

  it('refuses an account that existed before the transaction started', async () => {
    setup({ user: { created_at: ago(5 * 60_000) } })
    expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('refused')
    expect(db.rows('billing_events')).toHaveLength(0)
    expect(updateUserById).not.toHaveBeenCalled()
  })

  it('refuses an account the checkout did not provision', async () => {
    setup({ user: { user_metadata: {} } })
    expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('refused')
  })

  it('refuses an account somebody has already signed into', async () => {
    setup({ user: { last_sign_in_at: ago(10_000) } })
    expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('refused')
  })

  it('refuses a purchase made while signed in', async () => {
    setup({ txn: goodTxn({ custom_data: { user_id: '22222222-2222-4222-8222-222222222222' } }) })
    expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('refused')
  })

  it('refuses a transaction older than the replay window', async () => {
    setup({ txn: goodTxn({ created_at: ago(20 * 60_000) }), user: { created_at: ago(30_000) } })
    expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('refused')
  })

  it('waits on a transaction that is not paid yet and refuses a canceled one', async () => {
    setup({ txn: goodTxn({ status: 'ready' }) })
    expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('pending')
    setup({ txn: goodTxn({ status: 'canceled' }) })
    expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('refused')
  })

  it('waits when the Paddle transaction read fails with a server error and refuses when it is not found', async () => {
    setup()
    txnAnswer = () => new Response('down', { status: 500 })
    expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('pending')
    txnAnswer = () => new Response('nope', { status: 404 })
    expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('refused')
  })

  it('waits when the admin user search finds nobody yet', async () => {
    setup()
    searchAnswer = () => Response.json({ users: [] })
    expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('pending')
  })

  it('waits for the Lifetime row, and refuses a revoked row or one owned by another account', async () => {
    setup({ lifetime: null })
    expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('pending')

    db.reset()
    setup({ lifetime: { revoked_at: ago(1_000) } })
    expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('refused')

    db.reset()
    setup({ lifetime: { user_id: '33333333-3333-4333-8333-333333333333' } })
    expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('refused')
  })

  describe('a subscription purchase', () => {
    const subTxn = () => goodTxn({ items: subscriptionItems, subscription_id: 'sub_1' })
    const subRow = (over: Record<string, unknown> = {}) =>
      db.rows('user_subscriptions').push({ user_id: USER_ID, status: 'active', paddle_subscription_id: 'sub_1', ...over })

    it('is ready once the account holds an active subscription', async () => {
      setup({ txn: subTxn(), lifetime: null })
      subRow()
      const out = await prepareCheckoutSignIn(adminClient(), TXN_ID)
      expect(out.status).toBe('ready')
    })

    it('waits while the subscription is not active yet', async () => {
      setup({ txn: subTxn(), lifetime: null })
      subRow({ status: 'canceled', current_period_end: '2020-01-01T00:00:00Z' })
      expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('pending')
    })

    it('refuses when the premium subscription on the account is another one', async () => {
      setup({ txn: subTxn(), lifetime: null })
      subRow({ paddle_subscription_id: 'sub_other' })
      expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('refused')
    })

    it('waits while the subscription row is missing', async () => {
      setup({ txn: subTxn(), lifetime: null })
      expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('pending')
    })
  })

  it('refuses when the one-time claim cannot be written', async () => {
    setup()
    db.failing.add('billing_events:upsert')
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).toBe('refused')
    err.mockRestore()
  })

  it('refuses without the server secret and leaves the claim unused', async () => {
    setup()
    delete process.env.SUPABASE_SECRET_KEY
    searchAnswer = () => Response.json({ users: [{ id: USER_ID, email: EMAIL }] })
    expect((await prepareCheckoutSignIn(adminClient(), TXN_ID)).status).not.toBe('ready')
    expect(claimRows()).toHaveLength(0)
  })
})
