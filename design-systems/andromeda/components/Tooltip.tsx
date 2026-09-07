// ============================================================
// COMPONENT: Tooltip
// Wraps any child and shows a floating label on hover.
// Positioned above by default; pass position="bottom" to flip.
// Sharp corners, surface.overlay background — no arrow.
// Inline in the trigger's own stacking context by default; pass
// portal to lift it to <body> when the trigger sits in a panel
// that clips or scrolls.
// Uses inline hover state (onMouseEnter/Leave) so it works without
// a class-based stylesheet.
// ============================================================

'use client';

import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Transition } from 'framer-motion';
import { tokens } from '../tokens';
import { andromedaVars, inheritedThemeVars, themeColor } from './lib/utils';
import { useReducedMotion } from './lib/motion';

// Layout effect on the client (measure + correct before paint, no flash),
// plain effect on the server (avoids the useLayoutEffect SSR warning).
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Keep the clamped tooltip this far (token) clear of either viewport edge.
const EDGE_INSET = parseInt(tokens.spacing[2], 10); // 8px
// Standoff between the trigger and the label, the same token the inline
// `calc(100% + …)` offsets use, in the px the portal path needs.
const GAP = parseInt(tokens.spacing[2], 10); // 8px

const ms = (v: string) => parseInt(v, 10) / 1000;
const ENTER_TX: Transition = { duration: ms(tokens.motion.duration.normal), ease: [0, 0, 0.2, 1] }; // easing.out
const EXIT_TX: Transition  = { duration: ms(tokens.motion.duration.fast),   ease: [0.4, 0, 1, 1] }; // easing.in

/**
 * @typedef {object} TooltipProps
 * @property {React.ReactNode} label     Content shown in the tooltip.
 * @property {'top'|'bottom'} [position='top']
 * @property {boolean} [portal=false]    Render the label into <body> instead of the trigger.
 * @property {React.ReactNode} children  The trigger element.
 * @property {string} [className]
 * @property {React.CSSProperties} [style]
 */

export type TooltipProps = ComponentPropsWithoutRef<'div'> & {
  label: ReactNode;
  position?: 'top' | 'bottom';
  portal?: boolean;
};

/** Viewport coords for the portaled label; null until measured. */
type Anchor = { left: number; top: number | null; bottom: number | null };

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  { label, position = 'top', portal = false, children, className, style, onKeyDown, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();
  // Horizontal correction (px) applied on top of the -50% centre transform so a
  // centred-but-clamped label on a trigger near a screen edge stays inside the
  // viewport instead of overflowing it and forcing horizontal page scroll. 0 in
  // the common (mid-screen) case; measured only while visible.
  const [shiftX, setShiftX] = useState(0);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  // The portal target does not exist during SSR or the first client render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const floatRef = useRef<HTMLDivElement | null>(null);
  // Stable across renders: a fresh callback ref each render makes React detach
  // (null) and re-attach the forwarded ref on every state change, and this
  // component re-renders on every measure.
  const setWrap = useCallback((node: HTMLDivElement | null) => {
    wrapRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
  }, [ref]);

  const inlineOffset =
    position === 'bottom'
      ? { top: `calc(100% + ${tokens.spacing[2]})` }
      : { bottom: `calc(100% + ${tokens.spacing[2]})` };

  // Edge-clamp: a tooltip centred on a trigger near a screen edge would
  // overflow it and force horizontal page scroll, so it is nudged back inside
  // by a viewport inset. The correction is folded into framer's `x` (framer
  // owns the transform, we never mutate node.style.transform out from under
  // it), which means it lands on framer's own render frame, not synchronously.
  //
  // So the correction must NEVER be measured off the floating box's own rect.
  // A layout effect that sets state re-renders before the browser yields a
  // frame, so the shift is still unpainted on the next pass: the box measures
  // exactly where it did before, the same correction is added again, and it
  // compounds until React kills the tree at its update-depth limit. That is a
  // hard crash, and it fires on every hover of a trigger that needs a clamp.
  //
  // The trigger wrapper's rect is never transformed, and offsetWidth is a
  // layout box that transforms cannot touch. Centre plus half-width is all a
  // centred box's edges are, so the result reads only layout, comes out
  // identical on every pass, and keeps `shiftX` out of the deps.
  //
  // The same rect gives the portaled label its viewport coords, so both modes
  // measure once, in one place. Portaled coords are `fixed`, which does not
  // follow the trigger on its own: the capture-phase scroll listener re-runs
  // the measure so the label tracks scrolling in ANY ancestor, not just the page.
  useIsomorphicLayoutEffect(() => {
    // Nothing to reset on close. The float stays mounted through its exit
    // animation, and nulling the anchor there would hide a portaled label
    // mid-fade (its visibility rides on the anchor), while zeroing shiftX
    // would jump an inline one sideways as it fades. Both are re-measured,
    // before paint, on the next open.
    if (!visible || !label) return undefined;
    const measure = () => {
      const wrap = wrapRef.current;
      const node = floatRef.current;
      if (!wrap || !node) return;

      const wr = wrap.getBoundingClientRect();
      const centre = wr.left + wr.width / 2;
      const half = node.offsetWidth / 2;
      const limit = window.innerWidth - EDGE_INSET;

      let next = 0;
      if (centre - half < EDGE_INSET) next = EDGE_INSET - (centre - half);
      else if (centre + half > limit) next = limit - (centre + half);

      // React bails out of the re-render when the rounded value is unchanged,
      // which is what ends the pass.
      setShiftX(Math.round(next));

      if (!portal) return;
      // `bottom` for a label above the trigger, so the box never has to know
      // its own height to sit a fixed gap clear of it.
      setAnchor({
        left: Math.round(centre),
        top: position === 'bottom' ? Math.round(wr.bottom + GAP) : null,
        bottom: position === 'bottom' ? null : Math.round(window.innerHeight - wr.top + GAP),
      });
    };
    // The body portal sits outside whatever ancestor defines the theme
    // channel, so the label wears the channel it inherited at the trigger.
    // Written to the DOM here, before paint; React never manages these keys.
    if (portal && floatRef.current && wrapRef.current) {
      for (const [name, value] of Object.entries(inheritedThemeVars(wrapRef.current))) {
        floatRef.current.style.setProperty(name, value);
      }
    }
    measure();
    window.addEventListener('resize', measure);
    if (portal) window.addEventListener('scroll', measure, true); // capture: any ancestor
    return () => {
      window.removeEventListener('resize', measure);
      if (portal) window.removeEventListener('scroll', measure, true);
    };
    // `mounted` is a dep so a portaled label measures once its node exists.
  }, [visible, label, position, portal, mounted]);

  // Everything the label looks like, shared by both modes — only the
  // positioning differs between them.
  const floatSkin: CSSProperties = {
    pointerEvents: 'none',
    // Size to the label, never to the trigger. An absolutely positioned box
    // shrink-to-fits against its containing block, which in the inline mode is
    // the trigger wrapper less the 50% inset: on a 24px icon button that leaves
    // about 12px, so the label broke after every word. max-content sizes to the
    // text instead, and it is the trigger-width independence that matters, not
    // a nowrap rule.
    width: 'max-content',
    // Clamp to the viewport so a long centred label can't overflow a screen
    // edge and force horizontal page scroll on a phone. A label that outgrows
    // the clamp wraps (overflowWrap) rather than pushing the document wider;
    // short labels still sit on one line.
    maxWidth: `calc(100vw - ${tokens.spacing[4]})`,
    boxSizing: 'border-box',
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
    textAlign: 'center',
    zIndex: 100,
    padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
    background: themeColor.surface.overlay,
    border: `${tokens.border.thin} ${themeColor.border.base}`,
    fontFamily: tokens.typography.fontMono,
    fontSize: tokens.typography.size.xs,
    color: themeColor.text.secondary,
    letterSpacing: tokens.typography.tracking.wider,
    textTransform: 'uppercase',
  };

  // 4px of travel toward the trigger on entry, back out on exit. Under
  // prefers-reduced-motion the slide is dropped and only the fade remains,
  // which is the motion foundation's rule for decorative entrances.
  const slide = reducedMotion ? 0 : position === 'bottom' ? -4 : 4;
  const motionProps = {
    role: 'tooltip' as const,
    initial: { opacity: 0, y: slide },
    animate: { opacity: 1, y: 0, transition: ENTER_TX },
    exit: { opacity: 0, y: slide, transition: EXIT_TX },
  };

  // Centre horizontally — the box's own -50% pulls it back by half its width,
  // and shiftX (px, measured) is the viewport-edge correction folded into the
  // same framer-owned `x` transform. Inline mode centres on the trigger with
  // left:50%; portaled mode centres on the measured viewport coord.
  const inlineFloat = (
    <motion.div
      ref={floatRef}
      {...motionProps}
      style={{
        position: 'absolute',
        ...inlineOffset,
        left: '50%',
        x: `calc(-50% + ${shiftX}px)`,
        ...floatSkin,
      }}
    >
      {label}
    </motion.div>
  );

  const portalFloat = (
    <motion.div
      ref={floatRef}
      {...motionProps}
      style={{
        ...andromedaVars(),
        position: 'fixed',
        left: anchor ? anchor.left : 0,
        top: anchor && anchor.top !== null ? anchor.top : undefined,
        bottom: anchor && anchor.bottom !== null ? anchor.bottom : undefined,
        // Hidden for the one frame before the first measure lands, so the
        // label never flashes at the top-left corner of the viewport.
        visibility: anchor ? 'visible' : 'hidden',
        x: `calc(-50% + ${shiftX}px)`,
        ...floatSkin,
      }}
    >
      {label}
    </motion.div>
  );

  return (
    <div
      ref={setWrap}
      className={className}
      style={{ ...andromedaVars(), position: 'relative', display: 'inline-flex', ...style }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      // Escape dismisses an open label without moving focus, as the WAI-ARIA
      // tooltip pattern asks; the caller's own handler still runs after it.
      onKeyDown={(event) => {
        if (event.key === 'Escape') setVisible(false);
        onKeyDown?.(event);
      }}
      {...props}
    >
      {children}

      {/* AnimatePresence lives INSIDE the portal, never around it: it tracks
          its own children to run an exit, and a portal element is not the
          motion child it is looking for. */}
      {portal ? (
        mounted
          ? createPortal(
              <AnimatePresence>{visible && label ? portalFloat : null}</AnimatePresence>,
              document.body,
            )
          : null
      ) : (
        <AnimatePresence>{visible && label ? inlineFloat : null}</AnimatePresence>
      )}
    </div>
  );
});
