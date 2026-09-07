// ============================================================
// SHARED MOTION PRIMITIVES (framer-motion grounded)
//
// Andromeda's motion stack:
//  - framer-motion as the runtime — already a project dependency
//  - tokens.motion as the source of every duration / easing / stagger
//  - this file as the bridge: hooks + variants the templates consume
//
// Why framer-motion: the design system needs more than CSS transitions
// can elegantly express — staggered cascades, whileHover/whileTap
// physics, AnimatePresence for unmount, and reduced-motion handled at
// the source. Pure CSS works for trivial cases; framer-motion scales.
//
// See the Andromeda motion rules for philosophy and approved patterns.
// ============================================================

'use client';

import { useReducedMotion as fmUseReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { tokens } from '../../tokens';

// Helper — token strings like '400ms' or '60ms' parsed to seconds for
// framer-motion (which expects seconds, not ms).
const toSeconds = (msString: string) => parseInt(msString, 10) / 1000;

// Re-export framer-motion's reduced-motion hook so consumers don't need
// to import from two places.
export const useReducedMotion = fmUseReducedMotion;

// ── Cascade easing curve ────────────────────────────────────────────────────
// Token-driven equivalent of tokens.motion.easing.out — the standard
// entrance curve (fast start, soft landing). Framer-motion accepts an
// array of four numbers as a cubic-bezier.
const EASE_OUT: [number, number, number, number] = [0, 0, 0.2, 1];

/**
 * useCascadeProps — returns framer-motion props for an element entering
 * via the staggered top-to-bottom cascade. Triggered on mount, not on
 * scroll: the cascade is the *page composing itself* — once it plays,
 * every section is at rest in its final position before the user
 * starts scrolling.
 *
 * Spread onto a `motion.X` element:
 *
 *   const sidebarMotion = useCascadeProps(0);
 *   <motion.aside {...sidebarMotion}>...</motion.aside>
 *
 * The element fades + slides 8px up over `tokens.motion.duration.cascade`
 * (500ms). Stagger between siblings is `tokens.motion.stagger.cascade`
 * (60ms). For a 6-element cascade the final element settles at ~860ms.
 *
 * Important: this primitive does NOT trigger when scrolling. Below-fold
 * sections are at their final positions from the start, not waiting to
 * slide in. The user scrolling sees content already laid out — they
 * don't watch sections slide into empty viewport space. The scroll-
 * triggered behaviour belongs to individual primitives (`ProgressBar`,
 * `StatTile`, `RadarChart`) whose internal animations gate themselves
 * on `useInView`. Cascade and internal motion are different concerns.
 *
 * Reduced motion: returns `{ initial: false }` so the element starts in
 * its final state with no animation. The cascade is decoration in the
 * strict sense (it doesn't carry data meaning), so users who opt out
 * see the still version immediately.
 *
 * @param {number} index           Order in the cascade (0 = first)
 * @param {object} [opts]
 * @param {number} [opts.distance] Translate distance in px (default 8)
 * @returns {object}               Spread onto a `motion.X` element
 */
export function useCascadeProps(index = 0, opts?: { distance?: number }) {
  const distance = opts?.distance ?? 8;
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return { initial: false };
  }

  return {
    initial: { opacity: 0, y: distance },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: toSeconds(tokens.motion.duration.cascade),
      ease: EASE_OUT,
      delay: index * toSeconds(tokens.motion.stagger.cascade),
    },
  };
}

/**
 * cascadeVariants — alternative to `useCascadeProps` for cases where you
 * want a parent to orchestrate child stagger via `staggerChildren`.
 *
 * Usage:
 *   <motion.div variants={cascadeContainer} initial="hidden" animate="visible">
 *     <motion.div variants={cascadeItem}>...</motion.div>
 *     <motion.div variants={cascadeItem}>...</motion.div>
 *   </motion.div>
 *
 * Use this when siblings in the cascade are children of the same parent.
 * For cascades that cross parent boundaries (Mission Control's Sidebar +
 * Header live in separate columns), use `useCascadeProps(index)` instead.
 */
export const cascadeContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: toSeconds(tokens.motion.stagger.cascade),
    },
  },
};

export const cascadeItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: toSeconds(tokens.motion.duration.cascade),
      ease: EASE_OUT,
    },
  },
};

/**
 * Row stagger — for rows inside a table, log, or list that share a
 * parent and should reveal in sequence when the parent scrolls into
 * view. Tighter than `cascadeItem` because rows are smaller visual
 * elements; the section cascade's 500ms / 60ms feels heavy at row
 * granularity.
 *
 * Usage (scroll-triggered):
 *   <motion.tbody
 *     variants={rowContainer}
 *     initial="hidden"
 *     whileInView="visible"
 *     viewport={{ once: true, amount: 0.2 }}
 *   >
 *     {items.map(item => (
 *       <motion.tr key={item.id} variants={rowItem}>...</motion.tr>
 *     ))}
 *   </motion.tbody>
 *
 * `whileInView` on the parent makes the stagger trigger on viewport
 * intersection, not on mount — long tables below the fold reveal as
 * the user scrolls to them, not invisibly off-screen.
 */
export const rowContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: toSeconds(tokens.motion.stagger.row),
    },
  },
};

// Opacity-only fade. We tried adding a 6px translateY for a subtle slide-up
// but it caused layout jitter on table rows — `<motion.tr>` with a transform
// can trigger sub-pixel reflow and brief horizontal scrollbar flashes when
// the table sits inside an `overflow-x: auto` container. Opacity-only sidesteps
// that entirely; the stagger timing carries the reveal on its own.
export const rowItem: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: toSeconds(tokens.motion.duration.row),
      ease: EASE_OUT,
    },
  },
  // Exit variant — used when a row is being removed from a list inside
  // <AnimatePresence>. Mirror the entrance: opacity-only, no transform
  // (same table-layout caveat as rowItem). Slightly faster + ease-in so
  // the row "leaves the field" rather than lingering.
  exit: {
    opacity: 0,
    transition: {
      duration: toSeconds(tokens.motion.duration.normal),
      ease: [0.4, 0, 1, 1] as [number, number, number, number], // tokens.motion.easing.in
    },
  },
};

/**
 * useStaggeredDelay — bare delay accessor for elements that already have
 * their own motion (StatTile count-up, ProgressBar segment fill) but
 * need to wait for the entrance cascade to settle before starting.
 * Returns the delay in ms as a number so consumers can pass it to
 * setTimeout / RAF.
 *
 * @param {number} index            Section's cascade index
 * @param {number} [paddingMs=0]    Extra wait after the slide-in completes
 * @returns {number}                Delay in ms
 */
export function useStaggeredDelay(index: number, paddingMs = 0) {
  const staggerMs = parseInt(tokens.motion.stagger.cascade, 10);
  const cascadeMs = parseInt(tokens.motion.duration.cascade, 10);
  return index * staggerMs + cascadeMs + paddingMs;
}
