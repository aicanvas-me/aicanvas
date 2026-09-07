// ============================================================
// COMPONENT: Drawer
// shadcn/ui-aligned API: controlled (`open`/`onOpenChange`),
// `side`, compound parts (DrawerHeader / Body / Footer / Title /
// Description). Uses React Portal so the panel escapes any
// transformed/clipped ancestor. ESC closes; outside-click on
// the backdrop closes; body scroll is locked while open.
//
// Animation: framer-motion's <AnimatePresence> handles the open/
// close lifecycle. Backdrop fades opacity; panel slides in from
// `side`. Both use `tokens.motion.duration.slow` and the brand's
// ease-out (entrance) / ease-in (exit). No setTimeout-driven
// unmount, no raw timing strings.
//
//   <Drawer open={open} onOpenChange={setOpen} side="right">
//     <DrawerHeader>
//       <DrawerTitle>Settings</DrawerTitle>
//       <DrawerDescription>Mission parameters</DrawerDescription>
//     </DrawerHeader>
//     <DrawerBody>…</DrawerBody>
//     <DrawerFooter><Button>Save</Button></DrawerFooter>
//   </Drawer>
// ============================================================

'use client';

import {
  forwardRef,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  createContext,
} from 'react';
import type {
  CSSProperties,
  ComponentPropsWithoutRef,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cn, andromedaVars, inheritedThemeVars, easingArray } from './lib/utils';
import { CornerMarkers } from './CornerMarkers';
import { tokens } from '../tokens';

// Shares the dialog's accessible-name / description ids from the Drawer root
// down to DrawerTitle / DrawerDescription so they can wire `id` ↔ `aria-*`.
const DrawerContext = createContext<{ titleId?: string; descId?: string }>({ titleId: undefined, descId: undefined });

// Focusable-element selector for the focus trap + initial focus move-in.
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const ms = (v: string) => parseInt(v, 10) / 1000;
const PANEL_DURATION = ms(tokens.motion.duration.slow);
// framer boundary: derived from tokens, cannot follow runtime var overrides
const EASE_OUT = easingArray(tokens.motion.easing.out);
const EASE_IN  = easingArray(tokens.motion.easing.in);

type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

const SIDE_MAP: Record<DrawerSide, { axis: 'x' | 'y'; sign: number; position: string }> = {
  right:  { axis: 'x', sign:  1, position: 'right-0 top-0 bottom-0 h-full' },
  left:   { axis: 'x', sign: -1, position: 'left-0 top-0 bottom-0 h-full'  },
  top:    { axis: 'y', sign: -1, position: 'top-0 left-0 right-0 w-full'   },
  bottom: { axis: 'y', sign:  1, position: 'bottom-0 left-0 right-0 w-full' },
};

/**
 * @typedef {object} DrawerProps
 * @property {boolean} open Whether the drawer is open.
 * @property {(next: boolean) => void} [onOpenChange] Handler called with the next open state when the drawer requests to close (ESC or backdrop click).
 * @property {'left'|'right'|'top'|'bottom'} [side='right'] Screen edge the panel slides in from.
 * @property {number|string} [size=420] Width (left/right) or height (top/bottom). Number → px, string passed through.
 * @property {React.ReactNode} [children] Panel content, typically the Drawer compound parts (Header, Body, Footer).
 * @property {string} [className] Extra classes merged onto the panel element.
 * @property {React.CSSProperties} [style] Inline styles merged onto the panel element.
 */

type DrawerOwnProps = {
  open: boolean;
  onOpenChange?: (next: boolean) => void;
  side?: DrawerSide;
  size?: number | string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export type DrawerProps = DrawerOwnProps & Omit<HTMLMotionProps<'div'>, keyof DrawerOwnProps>;

/** @type {React.ForwardRefExoticComponent<DrawerProps & React.HTMLAttributes<HTMLDivElement>>} */
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  {
    open,
    onOpenChange,
    side = 'right',
    size = 420,
    children,
    className,
    style,
    ...props
  },
  ref,
) {
  // SSR / portal target gate. Tracks whether we have a document to portal into.
  const [canPortal, setCanPortal] = useState(false);
  useEffect(() => { setCanPortal(typeof document !== 'undefined'); }, []);

  // Accessible-name / description ids, shared via context to Title/Description.
  const reactId = useId();
  const titleId = `${reactId}-title`;
  const descId = `${reactId}-desc`;

  // Panel node + the element focused before opening (to restore focus on close).
  const panelRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  // The body portal sits outside whatever ancestor defines the theme channel,
  // so the root wears the channel the anchor inherited. Written to the DOM
  // before the first paint; React never manages these keys.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!open || !root) return;
    for (const [name, value] of Object.entries(inheritedThemeVars(anchorRef.current))) root.style.setProperty(name, value);
  }, [open, canPortal]);

  // ── Focus return — capture the trigger on open, restore it on close. ─────
  // Capturing in a layout-ish effect keyed on `open` grabs document.activeElement
  // (the trigger) just as the drawer opens, and the cleanup restores it on
  // close/unmount, guarding for a null or detached element.
  useEffect(() => {
    if (!open) return undefined;
    previouslyFocusedRef.current =
      typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;
    return () => {
      const el = previouslyFocusedRef.current;
      previouslyFocusedRef.current = null;
      if (el && typeof el.focus === 'function' && document.contains(el)) {
        el.focus();
      }
    };
  }, [open]);

  // ── Focus move-in — once the panel is in the DOM, move focus into it. ────
  // Focus the first focusable child, else the panel container itself
  // (it carries tabIndex={-1} so it can receive programmatic focus).
  useEffect(() => {
    if (!open || !canPortal) return;
    const panel = panelRef.current;
    if (!panel) return;
    const first = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    if (first && typeof first.focus === 'function') {
      first.focus();
    } else if (typeof panel.focus === 'function') {
      panel.focus();
    }
  }, [open, canPortal]);

  // ── Focus trap — wrap Tab / Shift+Tab so focus can't leave the panel. ────
  const onPanelKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((el) => el.offsetParent !== null || el === panel);
    if (focusable.length === 0) {
      // Nothing focusable inside — keep focus pinned to the panel itself.
      e.preventDefault();
      panel.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (e.shiftKey) {
      if (active === first || !panel.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last || !panel.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  };

  // ── Body scroll lock — engaged whenever the drawer is open. ──────────────
  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, [open]);

  // ── ESC to close ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange?.(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  // The drawer itself lives in a <body> portal, outside whatever ancestor
  // defines the theme channel. This inert anchor stays where the Drawer was
  // placed, so the channel can be read off it and carried into the portal.
  const anchor = <span ref={anchorRef} hidden data-slot="drawer-anchor" />;
  if (!canPortal) return anchor;

  const cfg = SIDE_MAP[side] ?? SIDE_MAP.right;
  const closedOffset = cfg.sign * 100;
  const sizeValue = typeof size === 'number' ? `${size}px` : size;
  // Cap the panel to the viewport on phones: a left/right drawer wider than
  // the screen (size=420 on a 320px phone) must never exceed the viewport and
  // force horizontal page scroll. min() keeps the desktop size on wide screens
  // and clamps to a token-sized inset from the edge below it. tokens.spacing[6]
  // (24px) leaves the backdrop peeking so the drawer still reads as an overlay.
  const sizeStyle =
    cfg.axis === 'x'
      ? { width: `min(${sizeValue}, calc(100% - var(--andromeda-6, 24px)))` }
      : { height: `min(${sizeValue}, calc(100% - var(--andromeda-6, 24px)))` };
  const panelInitial = { [cfg.axis]: `${closedOffset}%`, opacity: 1 };
  const panelAnimate = { [cfg.axis]: 0, opacity: 1 };
  const panelExit    = { [cfg.axis]: `${closedOffset}%`, opacity: 1 };

  return (
    <>
      {anchor}
      {createPortal(
    <DrawerContext.Provider value={{ titleId, descId }}>
      <AnimatePresence>
        {open ? (
          <div
            key="drawer-root"
            ref={rootRef}
            data-slot="drawer-root"
            style={{ ...andromedaVars() } as CSSProperties}
            className="fixed inset-0 z-[1000]"
          >
            {/* Backdrop */}
            <motion.div
              aria-hidden="true"
              onClick={() => onOpenChange?.(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: PANEL_DURATION, ease: EASE_OUT }}
              className={cn(
                'absolute inset-0 bg-[color:var(--andromeda-surface-alpha)]',
                '[backdrop-filter:blur(2px)] [-webkit-backdrop-filter:blur(2px)]',
              )}
            />
            {/* Panel */}
            <motion.div
              ref={(node) => {
                panelRef.current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) ref.current = node;
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descId}
              tabIndex={-1}
              onKeyDown={onPanelKeyDown}
              data-slot="drawer-panel"
              initial={panelInitial}
              animate={panelAnimate}
              exit={{ ...panelExit, transition: { duration: PANEL_DURATION, ease: EASE_IN } }}
              transition={{ duration: PANEL_DURATION, ease: EASE_OUT }}
              className={cn(
                'absolute',
                cfg.position,
                'flex flex-col',
                'bg-[color:var(--andromeda-surface-raised)]',
                '[backdrop-filter:blur(8px)] [-webkit-backdrop-filter:blur(8px)]',
                'rounded-[var(--andromeda-radius-frame,0px)]',
                // The shadow primitive, not the page colour: a light ground
                // would otherwise cast a white glow.
                'shadow-[0_0_60px_var(--andromeda-shadow-color)]',
                'outline-none',
                className,
              )}
              style={{
                ...sizeStyle,
                ...style,
              }}
              {...props}
            >
              <CornerMarkers />
              {children}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </DrawerContext.Provider>,
    document.body,
      )}
    </>
  );
});

export const DrawerHeader = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function DrawerHeader(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="drawer-header"
      className={cn(
        'flex flex-col gap-[2px]',
        'px-[var(--andromeda-3)] py-[var(--andromeda-3)]',
        'border-b-[length:var(--andromeda-border-width,1px)] border-solid border-[color:var(--andromeda-border-subtle)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export const DrawerTitle = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function DrawerTitle(
  { className, children, id, ...props },
  ref,
) {
  const { titleId } = useContext(DrawerContext);
  return (
    <div
      ref={ref}
      id={id ?? titleId}
      data-slot="drawer-title"
      className={cn(
        '[font-family:var(--andromeda-font-mono)]',
        'text-[length:var(--andromeda-text-md)]',
        'font-[number:var(--andromeda-weight-medium)]',
        'uppercase [letter-spacing:var(--andromeda-tracking-wider)]',
        'text-[color:var(--andromeda-text-primary)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export const DrawerDescription = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function DrawerDescription(
  { className, children, id, ...props },
  ref,
) {
  const { descId } = useContext(DrawerContext);
  return (
    <div
      ref={ref}
      id={id ?? descId}
      data-slot="drawer-description"
      className={cn(
        '[font-family:var(--andromeda-font-sans)]',
        'text-[length:var(--andromeda-text-xs)]',
        'text-[color:var(--andromeda-text-secondary)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export const DrawerBody = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function DrawerBody(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="drawer-body"
      className={cn(
        'flex-1 min-h-0 overflow-auto',
        'p-[var(--andromeda-3)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export const DrawerFooter = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(function DrawerFooter(
  { className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="drawer-footer"
      className={cn(
        'flex items-center justify-end gap-[var(--andromeda-3)]',
        'px-[var(--andromeda-3)] py-[var(--andromeda-3)]',
        'border-t-[length:var(--andromeda-border-width,1px)] border-solid border-[color:var(--andromeda-border-subtle)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});
