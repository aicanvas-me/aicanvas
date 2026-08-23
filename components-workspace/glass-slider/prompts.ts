import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion

Root element: className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#1A1A19]"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named \`GlassSlider\`, a frosted glass Display panel with four gradient-filled sliders.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: full-bleed \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Panel: \`w-[calc(100%-32px)] max-w-[360px]\` \`rounded-3xl px-7 py-8\` \`flex-col gap-7\`, glass:
- \`background: rgba(255,255,255,0.08)\`
- \`border: 1px solid rgba(255,255,255,0.1)\`
- \`boxShadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)\`
- Separate non-animating blur layer (\`z-[-1] rounded-3xl\`): \`backdrop-filter: blur(24px) saturate(1.8)\`
- Top edge highlight: \`absolute left-7 right-7 top-0 h-[1px]\` \`linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)\`
- Entrance: \`initial { y: 20, scale: 0.96 }\` → \`animate { y: 0, scale: 1 }\`, spring \`{ stiffness: 200, damping: 22 }\`.

Header: "Display" \`text-base font-semibold text-white/80\`.

Sliders array (label, defaultValue, colorA, colorB):
- "Brightness", 72, #5B8FF9, #A78BFA
- "Contrast",   45, #FF6BF5, #FF6680
- "Warmth",     60, #FF7B54, #FFBE0B
- "Saturation", 55, #06D6A0, #5B8FF9

Each Slider: entrance \`{ opacity:0, y:12 }\` → \`{ opacity:1, y:0 }\`, spring \`{ stiffness: 200, damping: 22, delay: 0.08 + i * 0.06 }\`.

Label row: \`flex justify-between\`. Label span animates color \`rgba(255,255,255,0.5)\` → \`0.85\` on hover, \`duration: 0.2\`. Value span \`font-mono text-sm font-semibold\`, color = interpolated gradient color at current position.

Track: 5px tall \`rounded-full w-full touch-none\`. Background \`rgba(255,255,255,0.08)\` → \`0.14\` on hover (CSS transition). Fill div: \`width: \${value}%\`, \`linear-gradient(90deg, \${colorA}, \${colorB})\`, on hover gets a \`drop-shadow(0 0 4px \${thumbColor}88)\`.

Thumb: centered on \`left: \${value}%\`, 44x44 tap target (touch-friendly), contains a 18x18 white circle with boxShadow \`0 0 0 2.5px \${thumbColor}, 0 2px 10px \${thumbColor}66\`. Scale driven by \`useSpring(useTransform(isDragging, [0,1], [1, 1.3]), { stiffness: 400, damping: 20 })\` where \`isDragging\` is a \`useMotionValue(0)\` set to 1 on pointer down.

Color interpolation: a \`lerpHex(a, b, t)\` helper parses two hex strings and linearly interpolates the channels, returning a hex string. Use it to compute \`thumbColor = lerpHex(colorA, colorB, value/100)\`.

Drag handling: on \`onPointerDown\` on the track, preventDefault, set isDragging=1, compute value from \`(clientX - rect.left) / rect.width\` clamped 0–1, rounded to 0–100. Add \`pointermove\` and \`pointerup\` listeners on window; pointerup resets isDragging=0 and removes listeners.

Use Manrope font.

## Typography
- Font: monospace (system)
- Sizes: 14px, 16px
- Weights: 500, 600`,

  'Lovable': `Create a React client component named \`GlassSlider\` — a frosted glass Display panel with four gradient-filled sliders.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: full-bleed \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Panel: \`w-[calc(100%-32px)] max-w-[360px]\` \`rounded-3xl px-7 py-8\` \`flex-col gap-7\`, glass —
- \`background: rgba(255,255,255,0.08)\`
- \`border: 1px solid rgba(255,255,255,0.1)\`
- \`boxShadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)\`
- Separate non-animating blur layer (\`z-[-1] rounded-3xl\`): \`backdrop-filter: blur(24px) saturate(1.8)\`
- Top edge highlight: \`absolute left-7 right-7 top-0 h-[1px]\` \`linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)\`
- Entrance: \`initial { y: 20, scale: 0.96 }\` → \`animate { y: 0, scale: 1 }\`, spring \`{ stiffness: 200, damping: 22 }\`.

Header: "Display" \`text-base font-semibold text-white/80\`.

Sliders array (label, defaultValue, colorA, colorB):
- "Brightness", 72, #5B8FF9, #A78BFA
- "Contrast",   45, #FF6BF5, #FF6680
- "Warmth",     60, #FF7B54, #FFBE0B
- "Saturation", 55, #06D6A0, #5B8FF9

Each Slider: entrance \`{ opacity:0, y:12 }\` → \`{ opacity:1, y:0 }\`, spring \`{ stiffness: 200, damping: 22, delay: 0.08 + i * 0.06 }\`.

Label row: \`flex justify-between\`. Label span animates color \`rgba(255,255,255,0.5)\` → \`0.85\` on hover, \`duration: 0.2\`. Value span \`font-mono text-sm font-semibold\`, color = interpolated gradient color at current position.

Track: 5px tall \`rounded-full w-full touch-none\`. Background \`rgba(255,255,255,0.08)\` → \`0.14\` on hover (CSS transition). Fill div: \`width: \${value}%\`, \`linear-gradient(90deg, \${colorA}, \${colorB})\`, on hover gets a \`drop-shadow(0 0 4px \${thumbColor}88)\`.

Thumb: centered on \`left: \${value}%\`, 44x44 tap target (touch-friendly), contains a 18x18 white circle with boxShadow \`0 0 0 2.5px \${thumbColor}, 0 2px 10px \${thumbColor}66\`. Scale driven by \`useSpring(useTransform(isDragging, [0,1], [1, 1.3]), { stiffness: 400, damping: 20 })\` where \`isDragging\` is a \`useMotionValue(0)\` set to 1 on pointer down.

Color interpolation: a \`lerpHex(a, b, t)\` helper parses two hex strings and linearly interpolates the channels, returning a hex string. Use it to compute \`thumbColor = lerpHex(colorA, colorB, value/100)\`.

Drag handling: on \`onPointerDown\` on the track, preventDefault, set isDragging=1, compute value from \`(clientX - rect.left) / rect.width\` clamped 0–1, rounded to 0–100. Add \`pointermove\` and \`pointerup\` listeners on window; pointerup resets isDragging=0 and removes listeners.

Use Manrope font.

## Typography
- Font: monospace (system)
- Sizes: 14px, 16px
- Weights: 500, 600`,

  'V0': `Create a React client component named \`GlassSlider\` — a frosted glass Display panel with four gradient-filled sliders.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: full-bleed \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Panel: \`w-[calc(100%-32px)] max-w-[360px]\` \`rounded-3xl px-7 py-8\` \`flex-col gap-7\`, glass —
- \`background: rgba(255,255,255,0.08)\`
- \`border: 1px solid rgba(255,255,255,0.1)\`
- \`boxShadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)\`
- Separate non-animating blur layer (\`z-[-1] rounded-3xl\`): \`backdrop-filter: blur(24px) saturate(1.8)\`
- Top edge highlight: \`absolute left-7 right-7 top-0 h-[1px]\` \`linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)\`
- Entrance: \`initial { y: 20, scale: 0.96 }\` → \`animate { y: 0, scale: 1 }\`, spring \`{ stiffness: 200, damping: 22 }\`.

Header: "Display" \`text-base font-semibold text-white/80\`.

Sliders array (label, defaultValue, colorA, colorB):
- "Brightness", 72, #5B8FF9, #A78BFA
- "Contrast",   45, #FF6BF5, #FF6680
- "Warmth",     60, #FF7B54, #FFBE0B
- "Saturation", 55, #06D6A0, #5B8FF9

Each Slider: entrance \`{ opacity:0, y:12 }\` → \`{ opacity:1, y:0 }\`, spring \`{ stiffness: 200, damping: 22, delay: 0.08 + i * 0.06 }\`.

Label row: \`flex justify-between\`. Label span animates color \`rgba(255,255,255,0.5)\` → \`0.85\` on hover, \`duration: 0.2\`. Value span \`font-mono text-sm font-semibold\`, color = interpolated gradient color at current position.

Track: 5px tall \`rounded-full w-full touch-none\`. Background \`rgba(255,255,255,0.08)\` → \`0.14\` on hover (CSS transition). Fill div: \`width: \${value}%\`, \`linear-gradient(90deg, \${colorA}, \${colorB})\`, on hover gets a \`drop-shadow(0 0 4px \${thumbColor}88)\`.

Thumb: centered on \`left: \${value}%\`, 44x44 tap target (touch-friendly), contains a 18x18 white circle with boxShadow \`0 0 0 2.5px \${thumbColor}, 0 2px 10px \${thumbColor}66\`. Scale driven by \`useSpring(useTransform(isDragging, [0,1], [1, 1.3]), { stiffness: 400, damping: 20 })\` where \`isDragging\` is a \`useMotionValue(0)\` set to 1 on pointer down.

Color interpolation: a \`lerpHex(a, b, t)\` helper parses two hex strings and linearly interpolates the channels, returning a hex string. Use it to compute \`thumbColor = lerpHex(colorA, colorB, value/100)\`.

Drag handling: on \`onPointerDown\` on the track, preventDefault, set isDragging=1, compute value from \`(clientX - rect.left) / rect.width\` clamped 0–1, rounded to 0–100. Add \`pointermove\` and \`pointerup\` listeners on window; pointerup resets isDragging=0 and removes listeners.

Use Manrope font.

## Typography
- Font: monospace (system)
- Sizes: 14px, 16px
- Weights: 500, 600`,
}
