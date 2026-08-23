-- API tokens no longer expire. The token only identifies the account; premium
-- is checked live against the subscription on every request, so an old token
-- grants nothing on its own. Expiry only locked out people who came back after
-- a break. Rotation in settings stays the answer to a leaked token.
-- The column is kept (nullable, no default) so the currently deployed code
-- keeps working; nothing reads it once the next deploy lands. Apply this
-- before that deploy, so a rollback to the previous build also sees no expiry.
alter table public.user_api_keys
  alter column expires_at drop not null,
  alter column expires_at drop default;

update public.user_api_keys set expires_at = null;
