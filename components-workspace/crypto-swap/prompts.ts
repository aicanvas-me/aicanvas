import type { Platform } from '../../app/components/ComponentCard'

// The shared spec body (used verbatim by all three platforms). The Claude Code
// lane prepends an env-check preamble; Lovable and V0 use it as-is.
const SPEC = `Build a single, self-contained, copy-paste React + TypeScript component: a Uniswap-style crypto→crypto token swap card. IMPORTANT: this is a CRYPTO-TO-CRYPTO swap (e.g. ETH → USDC), not a fiat exchange. The USD figures are only reference values used to derive the rate; the user trades one token for another.

STACK
- React + TypeScript, Tailwind CSS v4, Framer Motion, @phosphor-icons/react (always weight="regular" unless noted). No other dependencies.
- One default-exported component in a single file. 'use client' at the top. Add a comment: // npm install framer-motion @phosphor-icons/react
- Root element: className="flex min-h-screen w-full items-center justify-center px-4 py-10" with the page background set via inline style. Center the card.
- Must be fully responsive down to 320px wide, and respect prefers-reduced-motion (use Framer Motion's useReducedMotion and gate every animation: reduced motion gets instant snaps / plain crossfades, no springs, no spinners spinning, no live drift).
- No external coin-icon library: inline the brand coin SVGs (see below).

LAYOUT (a single unified tray with uniform 8px spacing)
- One rounded container ("tray") holding FOUR stacked blocks with uniform spacing: the tray's inner padding is 8px on every side (p-2) and the gap between the four blocks is also 8px (gap-2). The tray has a large radius (rounded-[28px]) and a soft drop shadow, NO border.
- Card max width 360px.
- The four blocks, top to bottom:
  1. SELL card: inner block, rounded-3xl, px-4 py-3, fill one notch lighter than the tray, no border.
  2. BUY card: same styling as Sell.
  3. DETAILS / rate accordion: inner block, rounded-3xl, overflow-hidden, same fill.
  4. SWAP button: full-width CTA, height 48px, rounded-3xl.
- A circular FLIP button (44×44) is absolutely centered over the 8px seam between the Sell and Buy cards (left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2, z-10). It has a 4px ring in the TRAY color (via box-shadow, not a border) so it reads cleanly over the seam, plus a soft drop shadow.

THEME (inline hex, dual light/dark, no design tokens)
Read the 'dark' class on <html> and stay in sync with a MutationObserver (attributeFilter: ['class']) inside a small useTheme hook returning 'light' | 'dark'. Default to dark when document is undefined. Branch every inline color on theme:
- Page background: dark #0A0A0A / light #E6E6E3
- Tray fill: dark #141416 / light #FFFFFF
- Inner blocks (Sell/Buy/Details): dark #1D1D20 / light #F2F2EF
- Token pill fill: dark #2A2A2E / light #FFFFFF (soft 1px shadow)
- Primary/value text: dark #ECECEC / light #16160F
- Muted/label text: dark #8A8A86 / light #6B6B62
- ACCENT = PERIWINKLE: dark #AEB6EC / light #9AA6EA, used on the Swap CTA fill, the Max chip, the active slippage chip, and the active token row (as a ~16% tint: rgba(174,182,236,0.16) dark / rgba(154,166,234,0.16) light). Periwinkle CTA text is near-black #0A0A0A.
- Flip button: dark = #2A2A2E circle with #ECECEC icon; light = #0A0A0A (black) circle with #FFFFFF icon.
- Trend up green #16C784 / #0FA968, trend down red #EA3943 / #E5484D, flat grey #8E8E84 / #6E6E66.
- Success green: dark #22C55E / light #0FA968, with near-black text/check (#0A0A0A).
- All surfaces are BORDERLESS: separate them by fill contrast + soft shadows only. Dividers inside a block are faint fill lines (inset box-shadow), not borders.

TYPE & SPACING DISCIPLINE
- Type scale (px): 10 · 12 · 14 · 16 · 20 · 24 · 28. No off-grid sizes.
- Spacing on a 2/4px grid (Tailwind's gap-2=8, p-4=16, px-2.5=10 etc.).
- The big editable amount uses fontSize: clamp(20px, 6vw, 28px), bold, tabular-nums.
- Touch targets are ≥44px (use a transparent ≥44px-tall hit area with the visible chip on an inner span when the visible control is smaller).

TOKENS (mock table, 8 entries)
Each token: { symbol, name, usdPrice, basePrice (seed = usdPrice, the 24h baseline), balance, change24h (signed %), gradient: [start, end] }.
- ETH   Ethereum   usdPrice 3412.55   balance 52.32    change +2.41  gradient #627EEA→#8FA7FF
- BTC   Bitcoin    usdPrice 67840.12  balance 1.284    change +1.07  gradient #F7931A→#FFC56E
- USDC  USD Coin   usdPrice 1.0       balance 12480.5  change +0.01  gradient #2775CA→#4FA3FF
- USDT  Tether     usdPrice 1.0       balance 8920.0   change -0.02  gradient #26A17B→#54D6A8
- SOL   Solana     usdPrice 168.42    balance 312.7    change +5.83  gradient #9945FF→#19FB9B
- AAVE  Aave       usdPrice 102.18    balance 47.9     change -1.64  gradient #B6509E→#2EBAC6
- MATIC Polygon    usdPrice 0.7234    balance 9430.2   change -3.12  gradient #8247E5→#A77BFF
- LINK  Chainlink  usdPrice 14.86     balance 880.4    change +0.42  gradient #2A5ADA→#6E97FF
Defaults: Sell = ETH, Buy = USDC. Default sell amount = "1".

COIN ICONS (inline, no dependency)
Inline a real, brand-colored circular coin SVG per symbol (small circular brand marks). Use the public-domain CC0 cryptocurrency-icons set (spothq/cryptocurrency-icons, svg/color/<symbol>.svg). Copy the markup verbatim, convert SVG attributes to valid JSX (fill-rule→fillRule, fill-opacity→fillOpacity), keep the 0 0 32 32 viewBox, render at the requested size with borderRadius 50%, role="img" aria-hidden. Coin marks are identical in light and dark (logos don't theme). Any symbol without an inlined mark falls back to a gradient disc (the two-stop gradient) showing 1–2 letters of the symbol, so there are zero external image deps.

SELL CARD
- Label "Sell" (12px muted).
- A large editable decimal <input> (inputMode="decimal", placeholder "0", aria-label "Sell amount"). Sanitize on change: digits + a single dot, cap at 8 decimal places, strip leading zeros (keep "0." and "0"). Disabled while a swap is confirming.
- A token PILL top-right (see picker).
- Bottom row: LEFT a 24h trend chip; RIGHT "{balance} {SYMBOL}" + a "Max" chip.
- "Max" chip = periwinkle tint fill, periwinkle text (dark #C7CDF2 / light #4A57B8). Clicking it fills the input with the full balance (truncated to the adaptive precision so it never displays a misleading "0"). 44px hit area, visible chip kept compact, pointer-only hover brightens the tint.

BUY CARD
- Label "Buy". The amount is COMPUTED, not editable. Render it with an animated number transition (a Framer Motion useMotionValue + useTransform that tweens over 0.5s with ease [0.22,1,0.36,1]; SKIP the tween when the relative change is <0.1% so the live price drift doesn't continuously re-animate; snap instantly under reduced motion). Wrap it in role="status" aria-live="polite" with an aria-label naming the value + symbol. Dim the value (use muted color) when there's no amount.
- Bottom row: just the 24h trend chip (no balance/Max on Buy).

SWAP MATH (a coherent constant-product-ish DEX model)
- sellAmount = parseFloat(input) || 0; sellUsd = sellAmount × sellPrice.
- midRate = sellPrice / buyPrice (buy units per 1 sell unit).
- idealBuy = sellAmount × midRate.
- priceImpact = sellAmount > 0 ? clamp(sellUsd / POOL_DEPTH_USD, IMPACT_FLOOR, IMPACT_CAP) : 0, where POOL_DEPTH_USD = 25_000_000, IMPACT_FLOOR = 0.0005 (0.05%), IMPACT_CAP = 0.05 (5%). So bigger trades eat more of the book: a ~$68k trade nudges ~0.27%, a multi-million trade clamps near the cap.
- buyAmount = idealBuy × (1 − priceImpact)  ← the received side is slightly LESS than ideal.
- minReceived = buyAmount × (1 − slippage).
- Network fee is a SEPARATE estimate (NETWORK_FEE_BASE_USD = 2.4, paid in the native token) and does NOT reduce the output.

NUMBER FORMATTING (adaptive precision, never a misleading "0")
- formatTokenAmount: thousands separators, trailing zeros trimmed, with magnitude-adaptive max fraction digits: abs ≥ 1 → 2 decimals; 0.01–1 → 4; <0.01 (nonzero) → 8. So 64308.33 stays 2 decimals, 1.50→"1.5", 2.00→"2", and a tiny 0.0000147 keeps its digits instead of flattening to "0". A genuine 0 or non-finite → "0".
- A "cap for input" helper truncates (not rounds) a precise amount to the adaptive digit count and trims trailing zeros / a dangling dot for seeding the Sell field (used by flip + Max); if truncation would zero out a nonzero value, fall back to value.toPrecision(4) so a tiny amount stays seedable. Returns "" for a genuine 0.
- formatUsd: en-US currency, 2 decimals.
- formatRate: adaptive, abs ≥1000 → 2; ≥1 → 4; ≥0.01 → 6; else 8 decimals.
- 24h change is rendered SIGN-LESS (e.g. "2.41%"). Direction is shown only by the caret (CaretUp/CaretDown, weight="fill", 12px) + red/green color. Within ±0.05% it reads flat/neutral (grey, no caret), so the ~0% stablecoins read flat.

TOKEN PICKER (a compact, component-bounded dropdown, and this is a key detail)
- Clicking a pill TOGGLES that side's picker (open if closed; close if already open for that side). Only one picker open at a time.
- The dropdown is a single list portaled to <body> (so the card's transformed Framer-Motion wrapper can't clip it), but its WIDTH and POSITION are computed from the COMPONENT box, never the viewport:
  - width + left = the card's exact width/left (it spans the whole component).
  - it opens just UNDER the clicked pill with an 8px gap, but FLIPS UP (seated above the pill) when ~3 rows below would spill past the card's bottom edge, so it always stays inside the component bounds. Its max height never exceeds the card height.
  - Measure in a useLayoutEffect (synchronous first measurement avoids a ghost-row scroll bug). RE-ANCHOR on reflow with a ResizeObserver on the card AND the trigger pill (the vertically-centered card re-centers whenever its height changes, so expanding the accordion, opening a popover, or entering the success state moves the pill), plus window scroll (capture) + resize listeners. Only commit a new position when the geometry actually moved past a ~0.5px epsilon (anti-thrash).
- Rows: compact 48px tall (clears the 44px touch min), gap 4px, with ~3 rows visible before it scrolls. Each row: coin icon (32px) + name (14px semibold) + symbol (12px muted) on the left; balance (14px semibold tabular) + trend chip on the right. The active token's row gets the periwinkle tint.
- A VISIBLE custom scrollbar (not the thin auto-hide default): WebKit via Tailwind arbitrary variants ([&::-webkit-scrollbar]:w-2, rounded thumb #46464C dark / #C9C9BC light, transparent track) written as COMPLETE literal class strings so JIT detects them; Firefox via inline scrollbarWidth 'thin' + scrollbarColor. [scrollbar-gutter:stable].
- Full listbox a11y: the panel is role="listbox" aria-label="Select a token" with aria-activedescendant; each row is a role="option" button with aria-selected + a per-symbol id; the trigger pill is aria-haspopup="listbox" aria-controls={listId} aria-expanded. Roving tabindex (only the active option is tabbable). On open, focus the active option (preventScroll). Arrow Up/Down/Home/End move the active option; Enter/Space select; Tab is trapped + wraps within the panel. On close, restore focus to the pill ONLY if focus was still inside the panel (so a tap-close doesn't steal focus). Esc and click-outside close (treat both the card and the portaled dropdown as "inside").
- Open/close animation: spring (stiffness 360, damping 30) with opacity + scale 0.96 + a 6px y offset (sign depends on up/down placement), transformOrigin matching the placement. Reduced motion = opacity only.

TOKEN PILL
- A rounded-full Framer motion.button: coin icon (28px) + symbol (16px bold) + a caret. minHeight 44. Soft 1px shadow.
- The caret rotates to EXACTLY 180° when this side's picker is open, 0° when closed, via a spring (stiffness 360, damping 26); instant under reduced motion.
- Pointer-only hover: scale 1.03 + a faint fill lift (spring stiffness 400, damping 26). whileTap scale 0.96. Inert (no animation, no click, 0.6 opacity) while a swap is confirming.

DETAILS / RATE ACCORDION (COLLAPSED BY DEFAULT)
- Collapsed it shows only a fixed 48px rate row (so it reads as one block the same height as the Swap button):
  - LEFT: a button "1 {SELL} = {rate} {BUY}" with an ArrowsLeftRight icon. Tap to INVERT the rate (rate becomes 1/midRate; swap the from/to symbols). The text crossfades+slides on invert (AnimatePresence mode="wait", 0.26s ease [0.22,1,0.36,1]).
  - RIGHT: a chevron (CaretDown) toggle that rotates 180° (spring 360/26) and expands the breakdown. aria-expanded.
  - The whole row gets a faint pointer-only hover-lift.
- Expanded breakdown (animate height auto + opacity, 0.28s ease [0.22,1,0.36,1]; a faint inset top divider line):
  - "Price impact": -{impact}% colored by severity: green <0.5%, amber (#F5A524 dark / #C77700 light) 0.5–2%, red >2%. Show an em dash when no amount.
  - "Network fee": ~{usd}, animated number, jitters live (see drift).
  - "Max slippage": a gear chip showing the current tolerance ("Auto (0.5%)" or "0.5%"). Tapping it opens a small popover ABOVE the chip (bottom: calc(100% + 6px), spring 420/30) with options: Auto (0.5%) · 0.1% · 0.5% · 1.0%. Default = Auto (0.005). The active option is periwinkle-tinted. Esc + click-outside close it. Changing slippage updates Min received.
  - "Min received": {amount} {BUY}, or an em dash when no amount.

FLIP BUTTON
- The 44×44 circle straddling the Sell/Buy seam. Clicking it: swaps the sell/buy SYMBOLS and carries the computed buy amount up into the Sell input (cap-for-input precision; empty if zero). The ArrowsDownUp icon (18px) rotates via a motion value.
- Aim the caret at an EXACT multiple of 180 every click: keep a flipCount ref, target = flipCount × 180, STOP any in-flight spring before starting the next so rapid clicks re-target the clean grid and self-correct (never compound a fractional off-axis offset). Spring stiffness 320, damping 22. Instant set under reduced motion. Stop the animation on unmount.
- Pointer-only hover: scale 1.08 + faint fill lighten (spring 400/24). whileTap scale 0.9. Inert (0.6 opacity, no-op) while confirming.

TOKEN-SELECTION RULES
- Pick the token currently on the OTHER side → auto-flip (this preserves the trade, so the amount is NOT reset).
- Pick a brand-new SELL token → switch it and RESET the Sell amount to the default "1" (a stale amount like "525 BTC" shouldn't carry to a different token; Buy recomputes from 1).
- Pick a new BUY token → just switch it (Buy is computed from Sell, so the Sell amount is untouched).
- Re-pick the same token → no change, picker just closes.

SWAP BUTTON STATE MACHINE
- Full-width, height 48px, rounded-3xl, 16px bold, periwinkle fill with near-black text.
- Disabled (no amount) → muted fill (#26262A dark / #DCDCD8 light) + muted text + label "Enter an amount" (cursor not-allowed). With an amount → label "Swap".
- On click (idle + has amount): go idle → "swapping" for SWAP_SWAPPING_MS = 900ms (label "Swapping…" with a spinning 18px ring border made of swapText with a transparent top, linear 0.8s loop) → "success" held for SWAP_SUCCESS_MS = 1600ms (the success state shows a green fill with near-black text, the label "Swapped!", and a CheckCircle weight="fill" 22px that springs in with overshoot [stiffness 520, damping 16, delay 0.04] + a one-shot burst of 6 evenly-spaced tiny 4px sparks flying out ~22px + a soft green "bloom" ring that expands to box-shadow spread 14px and fades over 0.7s) → reset to idle. Amounts are kept across the cycle.
- Drive the button FILL by status (not the disabled flag) so swapping/success never inherit the disabled grey: ease the background into green on success (0.32s), and a quick scale pop [1,1.04,1] over 0.42s when success lands. Labels crossfade (AnimatePresence mode="wait", small y, 0.18s). Reduced motion → plain crossfades, no spinner spin, no sparks, no bloom, no pop.
- While confirming (swapping/success), the whole trade is LOCKED: flip, pills, Max, and the picker all go inert so the trade can't mutate mid-confirmation.

LIVE PRICE DRIFT (skip entirely under reduced motion)
- Every PRICE_DRIFT_MS = 3000ms, nudge each non-stablecoin price by ±0.3% (USDC/USDT stay pegged) and recompute change24h as ((price − basePrice) / basePrice) × 100 so the caret/percentage tracks the live number. Also jitter the network fee within ~$1.60–$3.20. Clear the interval on cleanup. The Buy amount + fee animate smoothly but the sub-perceptible drift ticks should NOT continuously restart the number tween (see the <0.1% skip above).

CONSTANTS RECAP
PRICE_DRIFT_MS 3000 · SWAP_SWAPPING_MS 900 · SWAP_SUCCESS_MS 1600 · POOL_DEPTH_USD 25_000_000 · IMPACT_FLOOR 0.0005 · IMPACT_CAP 0.05 · NETWORK_FEE_BASE_USD 2.4 · DEFAULT_SLIPPAGE 0.005 (Auto) · slippage options [Auto 0.005, 0.1% 0.001, 0.5% 0.005, 1.0% 0.01] · default sell "1" · picker ROW_HEIGHT 48, VISIBLE_ROWS 3, ROW_GAP 4, dropdown gap 8 · flip spring 320/22 · caret/toggle springs 360/26 · pill hover spring 400/26 · flip hover spring 400/24 · success check spring 520/16 · slippage popover spring 420/30 · picker open spring 360/30 · periwinkle #AEB6EC dark / #9AA6EA light · page #0A0A0A / #E6E6E3 · tray #141416 / #FFFFFF · inner #1D1D20 / #F2F2EF.

Make it feel like a real, polished DEX swap widget: smooth, responsive, accessible, and gorgeous in BOTH light and dark.`

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Before building, verify the project is set up for this stack and scaffold anything missing:
- Tailwind CSS v4 (CSS-first \`@theme\`, no tailwind.config.js), TypeScript, and React must all be configured.
- If the project isn't initialized for this, use the shadcn CLI to scaffold the base (e.g. \`npx shadcn@latest init\`) so Tailwind v4 + TS + React are wired up before you write the component.
- Install deps: \`npm install framer-motion @phosphor-icons/react\`.

Then build the component. Inline EVERYTHING into a single file: one default-exported component, all helpers, types, the token table, and the inlined coin SVGs in the same module. Trust idiomatic React + Framer Motion; you don't need scaffolding files or comments explaining basics.

${SPEC}`,
  Lovable: SPEC,
  V0: SPEC,
}
