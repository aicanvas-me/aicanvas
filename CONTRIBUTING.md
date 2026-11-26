# Contributing

AI Canvas is an open-core product, and this repo is the real thing: the free MIT
library, the website that serves it, and the registry build that turns component
source into installable JSON. Pull requests are welcome.

The two most useful contributions are a bug on a component you actually
installed, and a component you wish existed. Both start as an issue.

## Run it locally

```bash
git clone https://github.com/aicanvas-me/aicanvas.git
cd aicanvas
npm install
npm run dev
```

Open http://localhost:3001. The whole free catalog, every component page and the
registry routes work with no API keys at all. The dev script generates the
registry, the component source strings and the icon data before Next starts, so
the first run takes a few seconds longer than a bare `next dev`.

Node 22 or newer. npm is the package manager the lockfile is built with.

### What needs keys, and what does not

| Area | Without keys |
| --- | --- |
| Catalog, component pages, `/r/*.json` registry | Works |
| Sign in, accounts, checkout, usage metering | Not available |
| Icon pages | Build empty (the icon set ships from a private source) |
| Premium components, design systems, templates | Not in this repo at all |

Copy `.env.example` to `.env.local` and fill the Supabase pair if you want to
work on the account routes. Everything else degrades quietly when unset.

Premium is injected at build time from a private vault and is never committed
here. A clone builds the free library only, and that is the supported path.

## Where things live

| Path | What's there |
| --- | --- |
| `components-workspace/<slug>/` | One free component: `index.tsx`, `prompts.ts`, often a `spec.md` |
| `design-systems/andromeda/` | The free Andromeda design system: tokens, components, utilities |
| `app/` | The aicanvas.me website (Next.js App Router) |
| `app/lib/component-registry.tsx` | The catalog index. Append-only: slugs are a public contract |
| `scripts/generate-registry.mjs` | Builds the shadcn registry JSON from the sources above |
| `mcp/` | The `@aicanvas/mcp` server published to npm |
| `supabase/` | SQL migrations for the account tables |
| `CLAUDE.md`, `AGENTS.md`, `supervisor/`, `reviewer/`, `skills/` | The rules the project's own AI agents follow when they build here. Read them if you want to match the house style; ignore them if you are writing code by hand |

## Adding or fixing a component

1. Open an issue first for a new component, so the slug and the scope get agreed
   before you build. Slugs are permanent once published.
2. Work in `components-workspace/<slug>/`. A component is a default-exported
   React component, Tailwind v4 classes, Framer Motion for anything that moves,
   and it has to work in both light and dark.
3. Every component ships one platform-agnostic remix prompt in `prompts.ts`.
   `npm run lint:prompts` checks the shape.
4. Register it in `app/lib/component-registry.tsx`. Never rename or delete an
   existing entry.
5. Keep shipped component code close to comment-free. Buyers copy these files
   into their own projects: a comment earns its place only when removing it
   breaks something silently. `skills/code-comments.md` is the full rule.

## Before you open a pull request

```bash
npm run lint
npx tsc --noEmit
npm test
```

CI runs exactly those three on every pull request, plus a check that no premium
file leaked into the public tree. Keep the diff to one subject.

## Reporting a bug

Open an issue with the component slug, what you expected, what happened, and the
versions of React, Tailwind and Next you are on. A reproduction beats a
description. If it is a security issue, do not open an issue: see
[SECURITY.md](./SECURITY.md).

## Conduct

Be decent, assume good faith, keep it about the code. Harassment, personal
attacks or spam get the contributor blocked, no second step. See
[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## License of your contribution

Contributions to this repo are MIT, like the rest of the free library. Do not
submit code you do not have the right to license that way, and do not paste code
from a proprietary or non-MIT-compatible source.
