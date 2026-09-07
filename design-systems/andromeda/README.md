# Andromeda

A sci-fi / blueprint design system for AI Canvas. Near-monochrome, JetBrains Mono, a single turquoise accent, hairline corner markers. Dark by default, with a light theme built from the same token contract.

## Editions

**Andromeda (free, MIT).** The components and tokens in this folder are free to use, forever. Use them in anything, including commercial work.

**Andromeda Pro (premium).** The full design brain (the deep rules and the build workflow), the template library, and one-command bulk install. Available to premium subscribers.

Learn more: https://aicanvas.me/andromeda

## Development

Andromeda is MIT and lives here: the components, the tokens, and the design rules in `rules.md`. Both themes ship from `tokens.ts`, and any palette change has to clear the contrast self-check on both before it lands:

```
node design-systems/andromeda/_tools/light-contrast.selfcheck.mjs
```

Andromeda Pro is developed separately and is not published in this repository. Its templates, extended brain, and bulk install are premium.
