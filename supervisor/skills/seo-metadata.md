---
name: seo-metadata
description: Rules for writing SEO-ready component descriptions, titles, and metadata. Used by Builder (when writing descriptions) and Integrator (when auditing registry entries before wiring).
type: skill
---

# SEO Metadata Skill

AI Canvas ships `generateMetadata` in `app/components/[slug]/page.tsx` — it auto-generates every component page's title, meta description, OG tags, and Twitter card from the registry entry. This means **the registry `description` field is the primary SEO lever**. Write it well and every component page ranks well automatically.

---

## How `generateMetadata` builds the meta description

```
[entry.description, truncated at 150 chars] | Install via shadcn CLI. Free and open source.
```

(Premium content gets `| Install via shadcn CLI. Premium AI Canvas component.` instead — the meta must never claim open source on premium.) Verify the exact tail against `computeMetaDescription` in `app/components/[slug]/page.tsx`, not this doc.

The suffix is ~49 characters. Google shows ~155 characters. So the description should be **75–100 characters** for the best fit — enough to describe the component visually, short enough that the suffix is fully visible in search results.

---

## The title formula (auto-generated — do not touch)

```
[Component Name] — Animated React Component | AI Canvas
```

This is handled by `generateMetadata`. Never put the title in the registry entry.

---

## Naming the component (the name IS the SEO title)

**Hard rule, every component, no exceptions.** The display name and slug must be SEO-friendly and *stupidly* intuitive: someone searching for this kind of component should recognise it from the name alone, with zero guessing. Because the page title is `[Name] — Animated React Component | AI Canvas`, the name is the biggest SEO lever after the description. Cute codenames are banned.

- **Lead with what people search.** Name the mechanism, form, or category, not a metaphor. "Interactive Card Stack" beats "Scatter Pile"; a developer should be able to guess the component from the name alone.
- **Describe the component, not the demo content.** The name must survive the user swapping in their own images and copy. "Interactive Card Stack" works for any photos; "Aviary" or "Paradise" only fit the bird demo.
- **Be unique across the catalog.** No two components share a name or slug, and a new name must be clearly distinguishable from existing siblings (we already have Polaroid Stack, Tilted Coverflow, Card Flick, Radial Cards, Stack Tower — a new card component needs its own angle, not a near-duplicate).
- **Don't repeat yourself.** Don't restate words the surrounding structure already supplies: the title suffix adds "Animated React Component" (so never put "Animated" in the name), and the description must not repeat the component name or the slug — spend those characters describing the visual and the interaction instead.
- **No em-dashes in the name** (project copy rule). If you want an evocative tag, prefer a clean two-word form over "Name — Tag".
- **The slug must match the name** (kebab-case) and is **permanent once published**. Lock the SEO name before the first push — renaming a published slug breaks every `shadcn add @aicanvas/<slug>` install.

Prior art: `scatter-pile` was renamed to `interactive-card-stack` pre-publish (2026-06-09) purely for search intent.

---

## Description formula

Every description must answer: **what does this component look like and what does it do on interaction?**

### Structure

```
[Visual noun phrase]. [Interaction behaviour].
```

**Good:**
> A dot grid connected by thin lines. On hover, a radial wave pulses outward from the cursor, illuminating lines and dots as it spreads.

**Bad (too abstract):**
> An interactive background component.

**Bad (too long — truncates before the suffix):**
> A swipeable portrait card stack perfect for introducing a team, showcasing crew members, or picking an avatar. Four stacked cards fan out with soft rotations — drag to browse, tap to choose. Drop in your own photos and names...

### Rules

1. **Lead with the visual noun** — what is it? "Frosted glass navbar", "circular battery indicator", "animated flip calendar"
2. **Name the interaction** — hover, drag, click, swipe. What happens?
3. **Include the aesthetic keyword for its category** — see table below
4. **Stay under 90 characters** — the suffix adds 76 chars; total should be under 160
5. **No tech stack mentions** — `generateMetadata` adds React/Framer Motion keywords separately. Don't pad the description with "built with Framer Motion"
6. **No "free", "copy-paste", "AI prompts"** — the suffix handles all of that
7. **End with a period** — the suffix starts with "Free..." and needs a clean sentence boundary

---

## Required aesthetic keyword by category

Every component description must include its category's primary SEO keyword naturally:

| Category | Required keyword in description |
|---|---|
| Backgrounds | canvas, interactive, animated background, particle, grid, wave |
| Buttons & Toggles | button, toggle, animated, glitch, spring |
| Navigation | navbar, sidebar, navigation, tab bar, dock |
| Widgets | widget, indicator, loader, calendar, clock |
| Cards & Modals | card, modal, stack, deck, swipeable |
| Inputs & Controls | input, slider, stepper, search bar, progress |
| Notifications | notification, toast, alert |
| Typography | text animation, blur, scramble, reveal |
| Glass (design system) | **glassmorphism** or **frosted glass** — mandatory for every Glass component |

The Glass category deserves special attention: **every Glass component description must contain "glassmorphism" or "frosted glass"**. These are high-intent search terms with moderate competition. A Glass component that doesn't say "glassmorphism" in its description is invisible to that search.

---

## Prompts are already doing SEO work — do not touch them

Each component's general AI prompt (the `'Claude Code'` lane) is server-rendered as visible text inside the Remix side panel, under a "The Remix Prompt" heading, below the "Remix {name} with AI" title — the largest block of unique crawlable text on the page. Do not modify prompts for SEO purposes — they are optimised for developer utility, not search engines; the SEO value is a side effect of rendering them.

---

## Image field — required for og:image

Every registry entry must have an `image` field pointing to the component's ImageKit screenshot:

```ts
image: 'https://ik.imagekit.io/aitoolkit/[slug].png',
```

Without this, the component page has no `og:image` — social sharing previews are blank. The image is uploaded by the Integrator after building and screenshotting.

---

## Audit checklist — run before every integration

Before adding a component to the registry, verify:

- [ ] Description is 75–90 characters
- [ ] Description ends with a period
- [ ] Description names the visual form and the interaction
- [ ] Description includes the category's required aesthetic keyword (see table)
- [ ] Glass components say "glassmorphism" or "frosted glass"
- [ ] `image` field is present and points to a valid ImageKit URL
- [ ] Name is the display name (title case, no acronyms)
- [ ] Name + slug are SEO-friendly and intuitive — a searcher recognises the component from the name alone (no codenames)
- [ ] Name + slug are unique and not a near-duplicate of an existing component
- [ ] Name does not contain "Animated"; description does not repeat the name or slug

---

## Design system pages — additional SEO targets

Design system landing pages (`/design-systems/andromeda`, etc.) target a different keyword set than individual components. When adding or updating a design system:

| System | Primary keyword | Description target |
|---|---|---|
| Andromeda | `sci-fi design system react` | Blueprint/technical aesthetic with AI prompts |
| Glass | `glassmorphism design system react` | Frosted glass component suite with AI prompts |
| Meridian | `react design system components` | Editorial dashboard system with AI prompts |

The uncontested phrase **"design system with AI prompts built in"** should appear naturally in the description copy for every design system landing page.

---

## Where this skill is used

- **Builder** — write descriptions following this skill when creating a new component's spec and implementation
- **Integrator** — run the audit checklist before every `component-registry.tsx` edit
- **Supervisor** — if the Reviewer flags a description as too short or missing the category keyword, return to Builder before integrating
