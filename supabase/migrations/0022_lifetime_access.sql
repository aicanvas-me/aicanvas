-- AI Canvas — Lifetime access + billing event log
--
-- user_lifetime_access: one row per Lifetime grant (a one-time Paddle purchase,
-- or a gift). It is a separate table from user_subscriptions on purpose: that
-- table holds ONE row per user that every subscription event overwrites, so a
-- later cancel of an old subscription would wipe a Lifetime grant stored there.
-- Subscription code never writes this table. A user may have several rows (a
-- purchase and a gift). A row is live when granted_at is set and revoked_at is
-- not; premium = a premium subscription OR a live row (lib/identity/premium.ts).
--
-- granted_at NULL is a tombstone: a refund or chargeback for the purchase
-- arrived before the purchase itself, so the row exists only to carry the
-- revoke. last_adjustment_at orders adjustment events the way last_event_at
-- orders subscription events. welcome_claimed_at is the send-once claim for the
-- Lifetime email, the same pattern as 0021.
--
-- billing_events: an append-only log of every verified Paddle event, written
-- before any other handling. Our own timeline of cancels, refunds and
-- chargebacks (the Paddle dashboard shows only the effective cancel date), and
-- the source of the billing alert emails. alert_key is unique so one alert is
-- sent per cancel, refund status or past-due period even when Paddle delivers
-- the same change twice. Service role only.
--
-- Supabase stops exposing NEW public tables to the Data API without explicit
-- grants (see 0006), so every grant is stated. Without the service_role grants
-- the admin read throws and every premium check fails.

create table public.user_lifetime_access (
  id                       bigserial primary key,
  user_id                  uuid not null references auth.users(id) on delete cascade,
  paddle_transaction_id    text unique,                -- NULL for gifts
  paddle_customer_id       text,
  source                   text not null check (source in ('purchase', 'gift')),
  gift_for_subscription_id text,                       -- gifts only
  granted_at               timestamptz,                -- NULL = tombstone
  revoked_at               timestamptz,
  revoke_reason            text check (revoke_reason in ('refund', 'chargeback')),
  last_adjustment_at       timestamptz,
  welcome_claimed_at       timestamptz,
  created_at               timestamptz not null default now(),
  constraint user_lifetime_access_source_shape check (
    (source = 'purchase' and paddle_transaction_id is not null)
    or (source = 'gift' and paddle_transaction_id is null and gift_for_subscription_id is not null)
  )
);

-- Read on every premium check.
create index user_lifetime_access_user_idx on public.user_lifetime_access (user_id);

alter table public.user_lifetime_access enable row level security;

-- Owner may read their own rows (the account page and /api/me/entitlement read
-- with the session client). Writes happen server-side only.
create policy "lifetime: owner read" on public.user_lifetime_access
  for select to authenticated using ((select auth.uid()) = user_id);

-- Revoke from authenticated too: the project's default privileges grant every
-- role ALL on a new table, TRUNCATE included, which row security does not stop.
-- Then grant back only the read the owner policy allows.
revoke all on table public.user_lifetime_access from anon, authenticated;
revoke all on sequence public.user_lifetime_access_id_seq from anon, authenticated;
grant select on table public.user_lifetime_access to authenticated;
grant select, insert, update on table public.user_lifetime_access to service_role;
grant usage on sequence public.user_lifetime_access_id_seq to service_role;

create table public.billing_events (
  id               bigserial primary key,
  paddle_event_id  text not null unique,
  event_type       text not null,
  occurred_at      timestamptz,
  subscription_id  text,
  transaction_id   text,
  user_id          uuid references auth.users(id) on delete set null,
  summary          jsonb not null default '{}'::jsonb,
  alert_key        text unique,
  alerted_at       timestamptz,
  created_at       timestamptz not null default now()
);

create index billing_events_pending_alert_idx
  on public.billing_events (created_at)
  where alert_key is not null and alerted_at is null;

-- RLS on with no policy: anon and authenticated are denied every row.
alter table public.billing_events enable row level security;

revoke all on table public.billing_events from anon, authenticated;
revoke all on sequence public.billing_events_id_seq from anon, authenticated;
grant select, insert, update on table public.billing_events to service_role;
grant usage on sequence public.billing_events_id_seq to service_role;
