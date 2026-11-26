# Security policy

## Reporting a vulnerability

Report privately through GitHub: open the
[Security tab](https://github.com/aicanvas-me/aicanvas/security/advisories/new)
and file a draft advisory. It goes only to the maintainer.

Please do not open a public issue, a pull request or a discussion for a
vulnerability.

What helps: the affected route, file or component, what an attacker can do with
it, and a reproduction. First response within 72 hours, and a fix or a plan
before any public disclosure.

## Scope

In scope: this repository, the `@aicanvas/mcp` package published from `mcp/`,
and the aicanvas.me site it powers, including the registry routes under `/r/`
and the account and checkout routes.

Out of scope: findings against third-party services the site uses (Supabase,
Paddle, Vercel, PostHog, ImageKit), missing hardening headers with no
demonstrated impact, volumetric or denial-of-service testing, and automated
scanner output with no working proof.

## Please do not

Test against production accounts other than your own, run load or
denial-of-service tests, or access data that is not yours. A local clone
reproduces almost everything.
