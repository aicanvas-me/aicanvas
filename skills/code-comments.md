# Comments in shipped code

Buyers copy our component files into their projects and edit them, often with an
AI tool. Shipped code stays clean: almost no comments. The libraries buyers
compare us with (shadcn, React Bits, ReUI, MUI, BoardUI) ship near-bare code, and
heavy comments now read as "an AI wrote this".

## The test

A comment stays only if an edit made without it would break something
**silently**: an invisible failure, a hydration mismatch, a browser limit,
blocked scrolling, wrong units, values that must change together, a library or
browser quirk, or a requirement the user must follow. If the break would be
visible straight away, no comment.

## The format

One line, ideally under 90 characters. Plain English. Say what must stay true or
what breaks.

```tsx
// Not display:none: gradients inside a hidden SVG stop rendering.
// pan-y, not none: the page must still scroll on touch.
// dispose() keeps the WebGL context; release it or remounts hit the browser limit.
// The exit duration must equal the 380 ms timeout in cycle().
{/* ResponsiveContainer needs this box to have a real width and height. */}
```

A coupling note is fine when both sides ship to the buyer, for example
`// Mirrors tokens.motion.easing.out; change both.` Drop it when the other side
is ours alone (docs, registry, site code).

## Never ship

- File headers, banners, `Props:` lists, or a description of what the component
  is or how it works. The page description and the props table say that, and
  the remix prompt explains how it works.
- Narration (`// Merge styles`), section dividers, JSX region labels, restated
  types (`/** @type {…} */`), and tuning hints (`// tune: raise to …`). The name
  and the visible result say it.
- Unit notes on numbers whose unit is obvious.
- JSDoc on destructured defaults in a component's signature: it repeats the
  props docs. Only JSDoc on the props type's own fields stays.
- Notes for us instead of the buyer: internal docs or rules, builder
  instructions, history, lint talk, build or registry talk. Design intent that
  maintainers need belongs in the system's rules files.
- `TODO`, `FIXME`, `HACK` (`scripts/lint-components.mjs` fails on them) and
  commented-out code.
- A claim you have not verified against the code. A wrong comment is worse than
  none.
- Text that tooling reads as code. Never write `min-h-screen`, site classes
  (`sand-…`, `olive-…`), import-like text (`from '…'`) or a person's name in a
  comment.

## Always keep, unchanged and in place

- `'use client'`, `// npm install …`, `// font: …`, `// font-pkg: …`.
- The premium marker line in premium files, and the blank line after it.
- `@typedef` / `@property` blocks (they render the public props table) and JSDoc
  on prop type fields.
- Directives and hints: eslint, `@ts-*`, `prettier-ignore`, `/* glsl */`,
  `/*#__PURE__*/`, bundler hints, and `andromeda-allow:` comment blocks
  (Andromeda's checking tools read them).
- License, notice and credit text, whole and word for word, including permission
  and warranty paragraphs.
- A comment that a design system's rules point to or require (for example "the
  comment in Button.tsx", or a why-comment a `must` rule asks for).

## Comment-only passes

When a pass only edits comments, change nothing else: no reformatting, renames or
fixes. Report a bug instead of fixing it in the same pass.

- Delete bare `{}` lines: they are empty shells left by an earlier comment strip.
  When you delete a trailing comment, delete the spaces before it too. Leave the
  whitespace of every other line alone.
- Comments inside template strings (GLSL, CSS) are code: leave them.
- A `{/* … */}` that sits inside or between text runs stays: removing it changes
  the rendered text.
