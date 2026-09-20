-- AI Canvas — pull history
-- One row each time a known account is served real source: a registry file
-- through /r/<file>.json (CLI, MCP) or an image-pack file. The server writes it
-- with the service role after the response has gone out (app/lib/track-pull.ts).
--
-- It is a separate table from install_history on purpose: install_history is
-- the member's own list, shown on their History page and writable by them; this
-- one is a server-side record no client role can read or write. Deleting the
-- account deletes its rows (ON DELETE CASCADE).

create table public.pull_history (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  slug       text not null,
  kind       text not null,               -- classifyContent kind, or "image-pack"
  pulled_at  timestamptz not null default now()
);

create index pull_history_user_idx
  on public.pull_history (user_id, pulled_at desc);

-- RLS on with no policy: anon and authenticated are denied every row. The
-- revokes state the same thing at the GRANT layer, and the explicit
-- service_role grant keeps the table reachable once Supabase stops exposing new
-- public tables by default (see 0006).
alter table public.pull_history enable row level security;

revoke all on table public.pull_history from anon, authenticated;
revoke all on sequence public.pull_history_id_seq from anon, authenticated;

grant select, insert on table public.pull_history to service_role;
grant usage on sequence public.pull_history_id_seq to service_role;
