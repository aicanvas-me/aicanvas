import type { Platform } from '../../app/components/ComponentCard'

// ─── Shared spec ──────────────────────────────────────────────────────────────
// The full, self-contained build spec, reused (with a per-platform preamble) for
// all three lanes so an AI can recreate Mood Tracker from scratch without the source.

const SPEC = `Build a single-file, copy-paste-ready React + TypeScript component called \`MoodTracker\`:
a "How are you feeling?" mood check-in CARD (not a score). Drag a segmented slider
(or tap a face) through six expressive character moods; the big face, the feeling
word, and the whole card's colors all shift smoothly with the chosen mood. A Save
button records it.

STACK
- React + TypeScript (strict, no \`any\`).
- Tailwind CSS v4 for layout/utility classes.
- Framer Motion is the ONLY external dependency (\`npm install framer-motion\`).
- No icon library: all six faces AND the Save/check/bookmark icons are inline SVG.
- Default export \`function MoodTracker()\`. Root element is the only one with
  \`min-h-screen\`: \`className="flex min-h-screen w-full items-center justify-center p-4"\`,
  with an inline page background (dark \`#0E0E10\`, light \`#EDEDE7\`). The card sits
  centered, \`maxWidth: 380\`, \`rounded-3xl\`, \`p-5\`, overflow-hidden.
- Font stack: \`Manrope, ui-sans-serif, system-ui, -apple-system, sans-serif\`.

DESIGN SCALE (strict)
- Type scale (px): 10 · 12 · 14 · 16 · 20 · 24 · 28. The feeling word sits at 24px
  (font-extrabold). The big mood face is the single focal element and may exceed the
  cap via clamp() (~96–140px). Every other text size snaps to a step.
- Spacing on a 2px grid favouring 4px steps (4 · 8 · 12 · 16 · 20 · 24; 2 · 6 · 10 · 14
  allowed). Tailwind gap-2=8, gap-3=12, gap-4=16, p-4=16, etc.
- 44px minimum touch target on the slider track and every legend/Save button.

THE SIX MOODS, in this exact slider/legend order. Each is a DISTINCT inline SVG
character (own body shape + color + expression) drawn on a 0–64 viewBox; they share
one eye/mouth vocabulary so they read as a set. Default-selected mood is index 2 (Happy).
A shared facial stroke width of 2.6 is used for most features.
  1. Frustrated: color \`#CB5E3E\` (red). Rounded-square body (rx 16) with a subtle
     top-down white sheen overlay (~0.18 opacity). Angry down-slanted V brows, two
     small filled eyes (r 3.4), a tense flat grimace mouth. Feature ink \`#5A1E0E\`.
  2. Surprised: color \`#E5A85E\` (tan). Scalloped flower/cloud body built from a chain
     of 9 quadratic-arc lobes (inner radius 21, outer radius 26, centered at 32,32).
     Wide round open eyes (white r 5 + ink pupil r 2.4), a small open "o" mouth
     (ellipse rx 3.4 ry 4.4). Feature ink \`#6B3F12\`.
  3. Happy: color \`#F2D44E\` (yellow). Circle body (r 25). Two upward-arc smiling eyes,
     a big filled open grin, plus rosy cheeks (\`#F0926B\` r 4, ~0.7 opacity). Feature ink
     \`#6E5806\`.
  4. Uneasy: color \`#A9C95E\` (green). Lumpy wavy organic blob (cubic-curve loop).
     Slightly worried eyes (small filled circles + tiny upper-lid arcs), a squiggly wavy
     mouth (\`Q…T…T\` path). Feature ink \`#3F551A\`.
  5. Sad: color \`#8AC7D8\` (light blue). Dome / rounded-top half-shape (rounded top,
     flatter bottom). Downturned eyes (arcs curving down), a single light tear
     (\`#E6F4F8\`), a frown. Feature ink \`#1E5663\`.
  6. Anxious: color \`#BA8FD4\` (lavender). Rounded-diamond body (a 45°-rotated square with
     soft corners). Worried slanted brows, two small uneasy eyes (r 3.2), a small frown.
     Feature ink \`#4A2A66\`.

COLOR / LERP HELPERS (inline, no libs)
- hexToRgb / rgbToHex / \`lerpHex(a, b, t)\` linear-interpolate two hex colors.
- \`tintHex(hex, t)\` = lerp toward white \`#FFFFFF\` (lighten).
- \`shadeHex(hex, t)\` = lerp toward a soft dark neutral \`DARK_NEUTRAL = '#1B1B22'\`
  (NEVER near-black, so dark theme stays colored, not muddy).
- \`inkHex(hex)\` = lerp toward near-black \`#14140F\` by 0.82, a deep, mood-tinted ink
  that stays AA-legible on a soft same-hue wash while keeping a trace of hue.
- \`clamp(n, lo, hi)\`.

MOOD-DERIVED WASHES (recompute via useMemo on mood color + theme)
The focal panel is a soft, airy, same-hue wash of the CURRENT mood (light → toward
white; dark → toward the soft dark neutral). Exact lerp amounts:
- baseTint  = isDark ? shadeHex(color, 0.5)  : tintHex(color, 0.5)   // "base" blobs
- softTint  = isDark ? shadeHex(color, 0.44) : tintHex(color, 0.66)  // "soft" blobs
- panelWash = isDark ? shadeHex(color, 0.56) : tintHex(color, 0.62)  // flat panel fill
- panelInk  = isDark ? tintHex(color, 0.88)  : inkHex(color)         // feeling-word ink (AA)
- cardTint  = isDark ? lerpHex('#1A1A1E', color, 0.1) : lerpHex('#FFFFFF', color, 0.06) // card surface
- deepAccent = lerpHex(color, '#000000', 0.18)  // accent rail / handle ring / chips
- Neutral chrome (theme, not mood): titleColor dark \`#F2F2F0\` / light \`#16160F\`;
  subColor dark \`#8A8A86\` / light \`#6B6B62\`; legendIdle dark \`#26262C\` / light \`#F1F1EC\`.

LAYOUT (top to bottom inside the card; content layer above an ambient glow)
- AMBIENT GLOW: a pointer-events-none absolute-inset radial-gradient of the mood color
  blooming behind the panel: \`radial-gradient(120% 70% at 50% 28%, {color}{alpha} 0%, {color}00 60%)\`
  with alpha hex \`24\` (dark) / \`1F\` (light). Transitions background 0.5s ease.
- HEADER ROW (flex, space-between): left = "How are you feeling?" (16px, font-bold) over a
  subtitle "Today · 6-day streak" (12px, subColor, marginTop 6). Right = the SAVE BUTTON.
- FOCAL PANEL: rounded-2xl, minHeight 200, vertical padding 20, background = panelWash,
  inset hairline box-shadow (\`inset 0 0 0 1px {tint}…\`), overflow-hidden, transition
  background 0.5s ease. It contains:
    • LIQUID MESH: an absolute-inset layer with \`filter: blur(26px)\` holding 5 drifting
      radial blobs. Each blob: rounded-full, aspect 1/1, positioned by % with -50%/-50%
      translate, background \`radial-gradient(circle at 50% 50%, {color}, {color}00 70%)\`,
      opacity 0.85 (dark) / 0.7 (light), transition background 0.45s ease. The blob set
      (x%, y%, size% of panel width, tint slot, drift dx%, dy%, duration s):
        {24,30,72,base,8,6,11} {76,26,66,soft,7,8,13} {34,76,78,soft,9,5,15}
        {80,74,60,base,6,9,12} {52,50,54,base,10,7,17}
      Tint slot 'base' uses baseTint, 'soft' uses softTint. Each blob drifts forever via
      Framer Motion: animate x:[0, dx, -dx*0.6, 0], y:[0, -dy, dy*0.7, 0], repeat Infinity,
      easeInOut, its own duration.
    • READABILITY LIFT: an absolute-inset gradient keeping the feeling word legible:
      dark: \`radial-gradient(120% 90% at 50% 40%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 100%)\`;
      light: \`radial-gradient(120% 90% at 50% 42%, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 62%)\`.
    • BIG FACE: in a clamp(96px, 30vw, 140px) square, render the current mood's SVG at
      size 140 with a drop-shadow. On mood change it crossfades + spring-pops via
      AnimatePresence mode="popLayout": initial {opacity:0, scale:0.78, y:8},
      animate {opacity:1, scale:1, y:0}, exit {opacity:0, scale:0.78, y:-8},
      spring {stiffness:360, damping:22}.
    • FEELING WORD: the mood label at 24px font-extrabold, color = panelInk,
      letterSpacing -0.01em, a soft theme-aware textShadow. Crossfades on change
      (AnimatePresence popLayout): initial {opacity:0, y:8, blur(4px)} →
      {opacity:1, y:0, blur(0)} → exit {opacity:0, y:-8, blur(4px)}, 0.26s easeOut.
      NO number anywhere.
- SEGMENTED SLIDER: label "Drag to set your mood" (12px, subColor) above a track that
  is the slider control itself: role="slider", tabIndex 0, height 44 (the hit area),
  touch-none, select-none, cursor-pointer. ARIA: aria-valuemin 1, aria-valuemax 6,
  aria-valuenow = index+1, aria-valuetext = current mood label, aria-describedby the
  feeling-word id, aria-label "Mood".
    • The visible rail is a centered 12px-tall rounded-full bar (top 16) split into 6
      equal flex segments, each filled with its mood color in order.
    • HANDLE: a 36×36 white circle, 4px border in deepAccent, drop-shadow, with a 12×12
      inner dot in the current mood color (transition 0.35s). Its left = ((index+0.5)/6)*100%,
      animated via spring {stiffness:480, damping:34}; marginLeft -18 to center it.
    • DRAG: pointer-capture on pointerdown; map clientX over the track rect to the nearest
      of 6 stops (stops at the CENTER of each segment): ratio = clamp((x-left)/width, 0, 1);
      index = clamp(round(ratio*6 - 0.5), 0, 5). pointermove while dragging updates it;
      pointerup/cancel release capture.
    • KEYBOARD: ArrowLeft/ArrowDown → prev, ArrowRight/ArrowUp → next, Home → 0, End → 5
      (preventDefault on handled keys).
- LEGEND ROW: a 6-column grid (gap-1.5 = 6px, marginTop 4) of tappable face buttons (no
  counts). Each button: real <button> with aria-label = mood, aria-pressed = active,
  minHeight 44, padding 8, rounded-xl; background \`{color}22\` when active else transparent.
  Inside, a 36×36 rounded-full chip holding the mood SVG at size 28; when active the chip
  gets background = legendIdle, a \`0 0 0 2px {color}\` ring, and spring-scales to 1.08
  ({stiffness:420, damping:24}). Clicking sets that mood.

SAVE BUTTON STATE MACHINE
- A real <button> with a ≥44×44 hit area wrapping a compact pill (font 12, semibold,
  rounded-full, vertical padding 6, horizontal padding 10, gap-1).
- IDLE: pill shows an inline bookmark SVG + "Save"; background = a faint tint of the
  current mood (\`{color}26\` dark / \`{color}1F\` light), inset 1px ring of the mood color,
  text = \`#F2F2F0\` (dark) / inkHex(color) (light). whileHover scale 1.04 + brightness-110
  (pointer devices only), whileTap scale 0.94, spring {stiffness:480, damping:28}.
- ON CLICK: morph to CONFIRMING for ~1.6s, background/ring/text become a calm success
  green \`CONFIRM_GREEN = '#3FA66A'\` (bg \`{green}33\` dark / \`{green}24\` light, ring \`{green}55\`),
  the icon swaps to an inline check, the label becomes "Recorded", and the pill does a
  one-shot scale pop [1, 1.12, 1] over 0.36s. Color/bg/ring transition 0.3s ease.
  Then it reverts to idle. Re-clicks are BLOCKED while confirming (disabled). aria-label
  flips to "Mood recorded"; the button is aria-live="polite". Clean up the setTimeout on
  unmount.

DUAL THEME (portable, no provider)
Inline a card-wrapper-aware \`useTheme\` hook: it resolves the active theme from the
nearest \`[data-card-theme]\` ancestor when present (reading whether it has the \`dark\`
class), otherwise falls back to the \`dark\` class on \`<html>\`. Keep it in sync with a
MutationObserver watching the class attribute of BOTH \`<html>\` AND the card wrapper
(when present); disconnect on cleanup. Use a useLayoutEffect that is isomorphic-safe.
This is what lets every inline hex branch per theme.

MOTION / A11Y
- Respect \`useReducedMotion()\`: when reduced, freeze blob drift, make crossfades/pop/glow
  instant (duration 0), and skip hover/tap scale and the entrance.
- Gentle entrance: the card rises + fades on mount (initial {opacity:0, y:16} →
  {opacity:1, y:0}, spring {stiffness:220, damping:26}); skipped under reduced motion.
- Fully responsive down to 320px (no fixed layout widths; clamp() on the big face).
- 44px touch targets; full keyboard slider; decorative SVG parts aria-hidden /
  focusable="false".

KEY CONSTANTS RECAP
- Six mood hex: Frustrated #CB5E3E · Surprised #E5A85E · Happy #F2D44E · Uneasy #A9C95E
  · Sad #8AC7D8 · Anxious #BA8FD4. Default index 2 (Happy).
- DARK_NEUTRAL #1B1B22 · inkHex target #14140F @0.82 · CONFIRM_GREEN #3FA66A.
- Panel/wash lerps: base 0.5 · soft 0.44(dark)/0.66(light) · panelWash 0.56(dark)/0.62(light)
  · panelInk tint 0.88(dark)/inkHex(light) · cardTint 0.1(dark)/0.06(light) · deepAccent 0.18.
- "Recorded" hold 1600ms; save pop 0.36s [1,1.12,1].
- Springs: card-enter 220/26 · face-pop 360/22 · handle 480/34 · legend 420/24 · save 480/28.
- Blob mesh blur 26px; 5 blobs as listed; face SVG stroke 2.6.`

const CLAUDE_PREAMBLE = `Before writing any code, verify the project is set up with Tailwind CSS v4, TypeScript, and React. If any are missing, scaffold them (use the shadcn CLI to initialize Tailwind + the project if needed). Then build the component below as a single self-contained file.

`

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': CLAUDE_PREAMBLE + SPEC,
  Lovable: SPEC,
  V0: SPEC,
}
