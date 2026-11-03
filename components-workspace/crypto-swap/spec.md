# Crypto Swap — spec

- **Slug:** `crypto-swap`
- **design-system:** standalone
- **Status:** visually approved 2026-06-14 (synced to shipped state)

## Description
A functional Uniswap-style **crypto→crypto** token-swap card. Enter an amount, pick two
tokens, get a live conversion with price impact + fees, flip the direction, and swap with
animated feedback. The dollar figures are reference valuations, not a fiat payout.

## Layout
One unified rounded container (near-black, borderless) with **uniform 8px padding + gaps**
holding four blocks:
1. **Sell** card — editable amount, token pill (real coin icon + symbol + state-aware caret),
   bottom row: 24h trend chip (left) + balance + Max chip (right).
2. **Buy** card — computed amount (animated), token pill, 24h trend chip.
3. **Details accordion** (collapsed by default) — rate line `1 ETH = … USDC` (tap to invert),
   and on expand: Price impact, Network fee, Max slippage (editable), Min received.
4. **Swap** button (periwinkle CTA, ~48px, matches the rate-row height).
A circular **flip** button straddles the Sell/Buy seam.

## Behaviour
- Editable Sell amount with **adaptive decimal precision**: clean 2 decimals for normal
  amounts, more significant digits for tiny values (never a misleading "0"); fractional
  high-value tokens are enterable.
- Buy = `sellAmount × (sellPrice/buyPrice) × (1 − priceImpact)`; animated number transitions.
- **Price impact** scales with trade size (pool-depth model); separate **network-fee** gas
  estimate; **slippage** (Auto 0.5% / 0.1% / 0.5% / 1.0%) drives **Min received**.
- **24h trend** per token (green ▲ / red ▼, no +/− sign), recomputed from a base price so it
  stays in sync with the live price drift.
- **Flip** swaps sides + carries the amount; caret animates to an exact multiple of 180°
  (no off-axis drift on rapid clicks). Changing the **Sell** token resets the amount to 1.
- **Token picker**: a compact, component-bounded dropdown (~3 rows + visible scrollbar),
  opens under the pill, flips up when needed, re-anchors to its trigger on reflow. Full
  listbox a11y (roles, arrow-key nav, focus move-in + restore). Re-clicking the pill toggles
  it; picking the other side's token auto-flips (no duplicates).
- **Swap** button: idle → "Swapping…" (spinner) → green "Swapped!" (check + glow + sparks) →
  reset. Trade-defining inputs lock while a swap is in flight.
- Subtle live **price drift** so figures feel live.

## Visual / skin
- Near-black page `#0A0A0A` / light `#E6E6E3`; container `#141416` / `#FFFFFF`; inner blocks
  `#1D1D20` / `#F2F2EF`; **periwinkle accent** `#AEB6EC` (dark) / `#9AA6EA` (light) on the
  Swap CTA, Max chip, and active states. Borderless surfaces, soft shadows.
- Real **CC0 public-domain coin icons** (cryptocurrency-icons set), inlined as SVGs (no dep).
- Type scale 10/12/14/16/20/24/28 on a 2/4px spacing grid. Dual theme via inlined `useTheme`.

## Mobile / a11y
- Fluid, works at 320px; ≥44px touch targets; `inputMode="decimal"`. Listbox keyboard nav +
  focus management; WCAG-AA contrast in both themes; `prefers-reduced-motion` honored
  throughout (no scale/spring/glow/sparks; instant transitions).

## Tech notes
- React + TypeScript + Tailwind v4 + Framer Motion + AI Canvas icons. No external
  coin-icon dependency. Copy-paste single file, `min-h-screen` root only, default export
  `CryptoSwap`. `// npm install framer-motion`.

## Tags
- `Widgets` (accent), `Interactive`, `Motion`
