-- AI Canvas — AI agent connections for the hosted MCP (mcp.aicanvas.me)
-- One row per AI agent a person allowed on the consent screen. The agent holds
-- opaque tokens that only the hosted MCP route can resolve, to "this account,
-- use its current API key"; they never reach Supabase Auth or the data API.
-- Only SHA-256 hashes of the tokens are stored, so a copy of this table signs
-- nobody in. A row is born when the person clicks Allow (nothing is stored for
-- registrations or unanswered requests) and dies on disconnect or account
-- deletion (cascade). Connections never expire by themselves.
--
-- Additive only: no existing table, policy or function is touched. Reached
-- only by the server with the secret key; the anon and authenticated roles get
-- nothing (the 0006 explicit-grants convention).

create table if not exists public.mcp_grants (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users(id) on delete cascade,
  client_id              text not null,
  client_name            text not null,
  redirect_uri           text not null,
  resource               text not null,
  request_nonce          text not null unique,
  code_hash              text unique,
  code_challenge         text not null,
  code_expires_at        timestamptz,
  code_used_at           timestamptz,
  access_hash            text unique,
  access_expires_at      timestamptz,
  refresh_hash           text unique,
  prev_refresh_hash      text,
  refresh_rotated_at     timestamptz,
  stale_refresh_seen_at  timestamptz,
  browser_country        text,
  agent_country          text,
  created_at             timestamptz not null default now(),
  last_used_at           timestamptz
);

create index if not exists mcp_grants_user_id_idx on public.mcp_grants (user_id);
create index if not exists mcp_grants_prev_refresh_hash_idx on public.mcp_grants (prev_refresh_hash);

alter table public.mcp_grants enable row level security;
revoke all on table public.mcp_grants from anon, authenticated;
grant select, insert, update, delete on table public.mcp_grants to service_role;

comment on table public.mcp_grants is
  'AI agents a person allowed to use the hosted MCP. Token hashes only; server-only (secret key). Rows cascade with the account.';
