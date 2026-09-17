-- issue_api_token() is a trigger function: it only ever runs from
-- on_auth_user_created_issue_token when a row lands in auth.users. Functions
-- are executable by PUBLIC by default, so the Data API exposed it at
-- /rest/v1/rpc/issue_api_token to anon and authenticated. A direct call fails
-- (trigger functions cannot be called outside a trigger), but it has no reason
-- to be reachable at all.
-- Postgres checks EXECUTE on a trigger function when the trigger is created,
-- not when it fires, so signups keep getting their token. The owner (postgres)
-- and service_role keep their grant.
revoke execute on function public.issue_api_token() from public, anon, authenticated;
