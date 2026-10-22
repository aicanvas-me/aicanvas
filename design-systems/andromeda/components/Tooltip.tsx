'use client';

import { forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { Transition } from 'framer-motion';
import { tokens } from '../tokens';
import { andromedaVars, inheritedThemeVars, themeColor } from './lib/utils';
import { useReducedMotion } from './lib/motion';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const EDGE_INSET = parseInt(tokens.spacing[2], 10);
const GAP = parseInt(tokens.spacing[2], 10);

// Returns seconds: Framer Motion takes seconds, tokens store ms.
const ms = (v: string) => parseInt(v, 10) / 1000;
// The ease arrays mirror tokens.motion.easing.out and .in; change both.
const ENTER_TX: Transition = { duration: ms(tokens.motion.duration.normal), ease: [0, 0, 0.2, 1] };
const EXIT_TX: Transition  = { duration: ms(tokens.motion.duration.fast),   ease: [0.4, 0, 1, 1] };

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

type Anchor = { left: number; top: number | null; bottom: number | null };

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  { label, position = 'top', portal = false, children, className, style, onKeyDown, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();
  const [shiftX, setShiftX] = useState(0);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const floatRef = useRef<HTMLDivElement | null>(null);
  // Stable callback: a new one each render would detach and re-attach the forwarded ref.
  const setWrap = useCallback((node: HTMLDivElement | null) => {
    wrapRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
  }, [ref]);

  const inlineOffset =
    position === 'bottom'
      ? { top: `calc(100% + ${tokens.spacing[2]})` }
      : { bottom: `calc(100% + ${tokens.spacing[2]})` };

  // Position from the trigger's rect, never the label's: it lags the x shift and loops.
  useIsomorphicLayoutEffect(() => {
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

      setShiftX(Math.round(next));

      if (!portal) return;
      setAnchor({
        left: Math.round(centre),
        top: position === 'bottom' ? Math.round(wr.bottom + GAP) : null,
        bottom: position === 'bottom' ? null : Math.round(window.innerHeight - wr.top + GAP),
      });
    };
    // The body portal copies its theme vars from the trigger, or light pages get dark labels.
    if (portal && floatRef.current && wrapRef.current) {
      for (const [name, value] of Object.entries(inheritedThemeVars(wrapRef.current))) {
        floatRef.current.style.setProperty(name, value);
      }
    }
    measure();
    window.addEventListener('resize', measure);
    if (portal) window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      if (portal) window.removeEventListener('scroll', measure, true);
    };
    // mounted: a portaled label can only measure once its node exists.
  }, [visible, label, position, portal, mounted]);

  const floatSkin: CSSProperties = {
    pointerEvents: 'none',
    width: 'max-content',
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

  const slide = reducedMotion ? 0 : position === 'bottom' ? -4 : 4;
  const motionProps = {
    role: 'tooltip' as const,
    initial: { opacity: 0, y: slide },
    animate: { opacity: 1, y: 0, transition: ENTER_TX },
    exit: { opacity: 0, y: slide, transition: EXIT_TX },
  };

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
      onKeyDown={(event) => {
        if (event.key === 'Escape') setVisible(false);
        onKeyDown?.(event);
      }}
      {...props}
    >
      {children}

      {/* AnimatePresence stays inside the portal, or the exit animation never runs. */}
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
