import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion @phosphor-icons/react

Root element: className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#1A1A19]"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named \`GlassSearchBar\`, a glass-morphism search bar over a blurred floral background, with a suggestions dropdown.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: full-bleed \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20pink%20Flower%20%20(1).png\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Layout: container \`absolute w-[calc(100%-2rem)] max-w-[380px]\`, positioned at \`top: '30%', left: '50%', transform: 'translateX(-50%)'\` so the bar stays fixed when the dropdown opens.

Search bar: 48px tall, \`borderRadius: 24\`, glass panel:
- \`background: rgba(255,255,255,0.08)\`
- \`border: 1px solid rgba(255,255,255,0.1)\`
- \`boxShadow: 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)\`
- separate non-animating absolute blur layer: \`backdropFilter: blur(24px) saturate(1.8)\`

When active (focused), animate boxShadow to:
\`0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1.5px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.08)\`
via spring \`{ stiffness: 400, damping: 30 }\`.

Left: 48x48 slot containing Phosphor \`MagnifyingGlass\` size 20 \`weight="regular"\`, \`text-white/50\`.
Input: transparent, \`text-sm font-medium text-white/90 placeholder-white/30\`, caret \`#7D8D41\`, placeholder "Search components...".
Right: when \`query.length > 0\`, show a 20x20 circular clear button (\`rgba(255,255,255,0.08)\`, border \`rgba(255,255,255,0.12)\`) with Phosphor \`X\` size 10. Enter/exit via \`AnimatePresence\` scaling from 0.5, whileHover bg \`rgba(255,255,255,0.14)\`, whileTap scale 0.88.

Dropdown: appears when active and suggestions remain. Positioned \`absolute left-0 right-0\`, \`top: 56\`, \`rounded-2xl p-2\`, style \`{ ...glassPanel, ...glassBlur }\`, blur applied directly on the element (no separate child div). Top edge highlight: \`absolute left-6 right-6 top-0 h-[1px]\` with \`linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)\`. Enter spring \`{ stiffness: 350, damping: 28 }\` from \`{ opacity:0, scale:0.95, y:-8, filter:'blur(4px)' }\`.

Label: \`text-[10px] font-semibold uppercase tracking-widest text-white/25\`, text "Suggestions" (or "Results" when typing).

Suggestions array (icon, label, color):
- MusicNote, "Audio visualizers", #FF5C8A
- File, "Documentation files", #3A86FF
- Lightning, "Quick actions", #06D6A0

Each row: \`minHeight: 44\`, flex gap-3, px-3 py-2.5 rounded-xl. Icon badge 32x32 \`rounded-xl\`, bg \`\${color}18\`, border \`1px solid \${color}22\`, icon size 16 \`weight="regular"\` tinted. Label \`text-sm font-semibold\` \`rgba(255,255,255,0.75)\` → \`0.95\` on hover. Animated button group (icon + label only) springs \`x: hovered ? 3 : 0, scale: hovered ? 1.08 : 1\`, \`transformOrigin: 'left center'\`, whileTap 0.90, spring \`{ stiffness: 320, damping: 20 }\`. Trailing pill "CLEAR" \`text-[8px] uppercase tracking-wide text-white/40\` \`bg rgba(255,255,255,0.06)\`: stays still, stopPropagation, removes that row from suggestions.

Behavior: click bar to activate + focus input; click outside or Escape deactivates + clears query. Filter suggestions by query substring (case-insensitive). Use \`useReducedMotion\` to fall back to fades. Use Manrope font ('font-sans').

## Typography
- Font: project default sans-serif
- Sizes: 8px, 10px, 14px
- Weights: 500, 600`,

  'Lovable': `Create a React client component named \`GlassSearchBar\` — a glass-morphism search bar over a blurred floral background, with a suggestions dropdown.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: full-bleed \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20pink%20Flower%20%20(1).png\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Layout: container \`absolute w-[calc(100%-2rem)] max-w-[380px]\`, positioned at \`top: '30%', left: '50%', transform: 'translateX(-50%)'\` so the bar stays fixed when the dropdown opens.

Search bar: 48px tall, \`borderRadius: 24\`, glass panel —
- \`background: rgba(255,255,255,0.08)\`
- \`border: 1px solid rgba(255,255,255,0.1)\`
- \`boxShadow: 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)\`
- separate non-animating absolute blur layer: \`backdropFilter: blur(24px) saturate(1.8)\`

When active (focused), animate boxShadow to:
\`0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1.5px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.08)\`
via spring \`{ stiffness: 400, damping: 30 }\`.

Left: 48x48 slot containing Phosphor \`MagnifyingGlass\` size 20 \`weight="regular"\`, \`text-white/50\`.
Input: transparent, \`text-sm font-medium text-white/90 placeholder-white/30\`, caret \`#7D8D41\`, placeholder "Search components...".
Right: when \`query.length > 0\`, show a 20x20 circular clear button (\`rgba(255,255,255,0.08)\`, border \`rgba(255,255,255,0.12)\`) with Phosphor \`X\` size 10. Enter/exit via \`AnimatePresence\` scaling from 0.5, whileHover bg \`rgba(255,255,255,0.14)\`, whileTap scale 0.88.

Dropdown: appears when active and suggestions remain. Positioned \`absolute left-0 right-0\`, \`top: 56\`, \`rounded-2xl p-2\`, style \`{ ...glassPanel, ...glassBlur }\` — blur applied directly on the element (no separate child div). Top edge highlight: \`absolute left-6 right-6 top-0 h-[1px]\` with \`linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)\`. Enter spring \`{ stiffness: 350, damping: 28 }\` from \`{ opacity:0, scale:0.95, y:-8, filter:'blur(4px)' }\`.

Label: \`text-[10px] font-semibold uppercase tracking-widest text-white/25\`, text "Suggestions" (or "Results" when typing).

Suggestions array (icon, label, color):
- MusicNote, "Audio visualizers", #FF5C8A
- File, "Documentation files", #3A86FF
- Lightning, "Quick actions", #06D6A0

Each row: \`minHeight: 44\`, flex gap-3, px-3 py-2.5 rounded-xl. Icon badge 32x32 \`rounded-xl\`, bg \`\${color}18\`, border \`1px solid \${color}22\`, icon size 16 \`weight="regular"\` tinted. Label \`text-sm font-semibold\` \`rgba(255,255,255,0.75)\` → \`0.95\` on hover. Animated button group (icon + label only) springs \`x: hovered ? 3 : 0, scale: hovered ? 1.08 : 1\`, \`transformOrigin: 'left center'\`, whileTap 0.90, spring \`{ stiffness: 320, damping: 20 }\`. Trailing pill "CLEAR" \`text-[8px] uppercase tracking-wide text-white/40\` \`bg rgba(255,255,255,0.06)\` — stays still, stopPropagation, removes that row from suggestions.

Behavior: click bar to activate + focus input; click outside or Escape deactivates + clears query. Filter suggestions by query substring (case-insensitive). Use \`useReducedMotion\` to fall back to fades. Use Manrope font ('font-sans').

## Typography
- Font: project default sans-serif
- Sizes: 8px, 10px, 14px
- Weights: 500, 600`,

  'V0': `Create a React client component named \`GlassSearchBar\` — a glass-morphism search bar over a blurred floral background, with a suggestions dropdown.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: full-bleed \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20pink%20Flower%20%20(1).png\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Layout: container \`absolute w-[calc(100%-2rem)] max-w-[380px]\`, positioned at \`top: '30%', left: '50%', transform: 'translateX(-50%)'\` so the bar stays fixed when the dropdown opens.

Search bar: 48px tall, \`borderRadius: 24\`, glass panel —
- \`background: rgba(255,255,255,0.08)\`
- \`border: 1px solid rgba(255,255,255,0.1)\`
- \`boxShadow: 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)\`
- separate non-animating absolute blur layer: \`backdropFilter: blur(24px) saturate(1.8)\`

When active (focused), animate boxShadow to:
\`0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1.5px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.08)\`
via spring \`{ stiffness: 400, damping: 30 }\`.

Left: 48x48 slot containing Phosphor \`MagnifyingGlass\` size 20 \`weight="regular"\`, \`text-white/50\`.
Input: transparent, \`text-sm font-medium text-white/90 placeholder-white/30\`, caret \`#7D8D41\`, placeholder "Search components...".
Right: when \`query.length > 0\`, show a 20x20 circular clear button (\`rgba(255,255,255,0.08)\`, border \`rgba(255,255,255,0.12)\`) with Phosphor \`X\` size 10. Enter/exit via \`AnimatePresence\` scaling from 0.5, whileHover bg \`rgba(255,255,255,0.14)\`, whileTap scale 0.88.

Dropdown: appears when active and suggestions remain. Positioned \`absolute left-0 right-0\`, \`top: 56\`, \`rounded-2xl p-2\`, style \`{ ...glassPanel, ...glassBlur }\` — blur applied directly on the element (no separate child div). Top edge highlight: \`absolute left-6 right-6 top-0 h-[1px]\` with \`linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)\`. Enter spring \`{ stiffness: 350, damping: 28 }\` from \`{ opacity:0, scale:0.95, y:-8, filter:'blur(4px)' }\`.

Label: \`text-[10px] font-semibold uppercase tracking-widest text-white/25\`, text "Suggestions" (or "Results" when typing).

Suggestions array (icon, label, color):
- MusicNote, "Audio visualizers", #FF5C8A
- File, "Documentation files", #3A86FF
- Lightning, "Quick actions", #06D6A0

Each row: \`minHeight: 44\`, flex gap-3, px-3 py-2.5 rounded-xl. Icon badge 32x32 \`rounded-xl\`, bg \`\${color}18\`, border \`1px solid \${color}22\`, icon size 16 \`weight="regular"\` tinted. Label \`text-sm font-semibold\` \`rgba(255,255,255,0.75)\` → \`0.95\` on hover. Animated button group (icon + label only) springs \`x: hovered ? 3 : 0, scale: hovered ? 1.08 : 1\`, \`transformOrigin: 'left center'\`, whileTap 0.90, spring \`{ stiffness: 320, damping: 20 }\`. Trailing pill "CLEAR" \`text-[8px] uppercase tracking-wide text-white/40\` \`bg rgba(255,255,255,0.06)\` — stays still, stopPropagation, removes that row from suggestions.

Behavior: click bar to activate + focus input; click outside or Escape deactivates + clears query. Filter suggestions by query substring (case-insensitive). Use \`useReducedMotion\` to fall back to fades. Use Manrope font ('font-sans').

## Typography
- Font: project default sans-serif
- Sizes: 8px, 10px, 14px
- Weights: 500, 600`,
}
