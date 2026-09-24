-- AI Canvas — first-activation email claim
-- The Paddle webhook sends one email when a subscription first goes active.
-- Paddle delivers subscription.created and subscription.activated at the same
-- instant, and the old guard (a flag read and then written on the auth user)
-- let both deliveries send. This column is the guard now: the webhook claims
-- it with one conditional UPDATE (... WHERE welcome_claimed_at IS NULL), so
-- only one delivery can win the row lock.
--
-- Every row that exists today has already had its activation moment, so it is
-- marked claimed here and can never be welcomed again. Nullable, no default: a
-- row created after this migration starts unclaimed. Additive only; the
-- entitlement columns and every reader of them are untouched.
--
-- Safe to re-run, and the remedy after a code rollback that spanned new
-- activations: the column add is guarded and the backfill only fills nulls.

alter table public.user_subscriptions
  add column if not exists welcome_claimed_at timestamptz;

comment on column public.user_subscriptions.welcome_claimed_at is
  'When the first-activation email was claimed for sending. The Paddle webhook claims it atomically; rows older than the column were claimed by migration 0021.';

update public.user_subscriptions
  set welcome_claimed_at = now()
  where welcome_claimed_at is null;
