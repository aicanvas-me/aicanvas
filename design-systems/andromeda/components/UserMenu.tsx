// ============================================================
// COMPONENT: UserMenu
// Avatar-trigger user menu. Click the avatar (with a small
// CaretUpDown indicator) to open a popover with Profile /
// Preferences / Sign Out etc. Pair with `UserCard` when the
// trigger needs to also show the user's name and role.
//
// Follows the Andromeda popover spec (the Andromeda interaction-states rules):
//  - position: relative wrapper, position: absolute panel
//  - solid `surface.raised` panel, `0 8px 32px surface.base` shadow
//  - frame is a single 1px `border.base` — no CornerMarkers (the
//    "border OR corners, never both" rule applies; menu-style
//    popovers default to the simple border).
//  - ESC / outside-click close (listeners only attached while open)
//  - the only animation is the trigger's caret rotation; the panel
//    itself does NOT fade in.
//
// Internals (`useUserMenuPanel`, `UserMenuPanel`) are exported so
// `UserCard` can compose the same panel with a different trigger.
// Consumers of the system should reach for `UserMenu` / `UserCard`,
// not the internals.
// ============================================================

'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import type {
  ComponentPropsWithoutRef,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react';
import { motion } from 'framer-motion';
import { CaretUpDown } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { tokens } from '../tokens';
import { Avatar } from './Avatar';
import { andromedaVars, themeColor } from './lib/utils';
import { mq } from './lib/responsive';

// Motion locals — framer-motion takes seconds + a 4-tuple bezier, but
// `tokens.motion` exposes ms strings and CSS cubic-bezier() strings.
// These two helpers keep every value traceable to a token while
// adapting to framer's shape (same convention as Drawer.tsx).
const toSeconds = (ms: string) => parseInt(ms, 10) / 1000;
const EASE_STANDARD: [number, number, number, number] = [0.4, 0, 0.2, 1]; // tokens.motion.easing.standard

// Roving arrow-key navigation for the `role="menu"` panel. Queries the
// menuitem buttons, finds the focused one, and moves focus up/down with
// wrap-around; Home/End jump to first/last. Separators are ignored because
// they are not `role="menuitem"` buttons. Bound to the panel's onKeyDown.
function handleMenuKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
  const itemsList = Array.from(
    e.currentTarget.querySelectorAll<HTMLElement>('button[role="menuitem"]'),
  );
  if (itemsList.length === 0) return;
  const idx = itemsList.indexOf(document.activeElement as HTMLElement);

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    itemsList[idx < 0 ? 0 : (idx + 1) % itemsList.length].focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    itemsList[idx < 0 ? itemsList.length - 1 : (idx - 1 + itemsList.length) % itemsList.length].focus();
  } else if (e.key === 'Home') {
    e.preventDefault();
    itemsList[0].focus();
  } else if (e.key === 'End') {
    e.preventDefault();
    itemsList[itemsList.length - 1].focus();
  }
}

/**
 * @typedef {object} UserMenuItem
 * @property {string}   [id]           Stable key for the row, falling back to its array index.
 * @property {string}   [label]        Text shown on the menu item, rendered uppercase.
 * @property {React.ComponentType<{ size?: number, weight?: string }>} [icon] Icon component rendered before the label.
 * @property {() => void} [onSelect]   Handler called when the item is chosen; the menu closes after.
 * @property {boolean}  [destructive]  Renders the item in the destructive red color.
 * @property {'separator'} [type]      Set to 'separator' to render a divider instead of an item.
 */

export type UserMenuItem = {
  id?: string;
  label?: string;
  icon?: Icon;
  onSelect?: () => void;
  destructive?: boolean;
  type?: 'separator';
};

/**
 * Shared state hook — owns the open/close lifecycle, the wrapper ref,
 * and the listeners for outside-click + Escape. Used by both
 * `UserMenu` and `UserCard` so the trigger behavior stays identical.
 *
 * `initialOpen` lets callers render the menu pre-opened (showcases /
 * docs); outside-click and Escape still dismiss it.
 *
 * `staticOpen` pins the panel open: the outside-click + Escape dismissers
 * are not attached, so it survives clicks elsewhere on the page. For
 * showcases / docs where several popovers are shown open at once and one
 * must not close the others. The trigger can still toggle it.
 */
export function useUserMenuPanel(initialOpen = false, staticOpen = false) {
  const [open, setOpen] = useState(initialOpen || staticOpen);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  // The element to return focus to on close — captured when the trigger
  // toggles the menu open (interactive open only).
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open || staticOpen) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node | null)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, staticOpen]);

  // Focus the first menuitem when the panel opens — NEVER in staticOpen mode,
  // where multiple pinned menus would fight over focus. Queried from the
  // wrapper (which both UserMenu and UserCard set) so the panel ref does not
  // need threading through every trigger component.
  useEffect(() => {
    if (!open || staticOpen) return;
    const first = wrapperRef.current?.querySelector<HTMLElement>('[role="menu"] button[role="menuitem"]');
    if (first) first.focus();
  }, [open, staticOpen]);

  // Return focus to the trigger when the panel closes after an interactive
  // open. Skipped in staticOpen mode (no focus stealing on showcase pages).
  useEffect(() => {
    if (open || staticOpen) return;
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (target) target.focus();
  }, [open, staticOpen]);

  const toggle = (e?: ReactMouseEvent<HTMLElement>) => {
    // Capture the trigger as the focus-return target before opening.
    if (!open && !staticOpen) {
      returnFocusRef.current = e?.currentTarget ?? (document.activeElement as HTMLElement | null);
    }
    setOpen((o) => !o);
  };
  const close = () => setOpen(false);
  const triggerProps = {
    'aria-haspopup': 'menu' as const,
    'aria-expanded': open,
    'data-state': open ? 'open' : 'closed',
    onClick: toggle,
  };

  return { open, toggle, close, wrapperRef, triggerProps };
}

function UserMenuItemRow({ item, onClose }: { item: UserMenuItem; onClose: () => void }) {
  if (item.type === 'separator') {
    return (
      <div
        role="separator"
        style={{
          height: '1px',
          margin: `${tokens.spacing[1]} 0`,
          background: themeColor.border.subtle,
        }}
      />
    );
  }
  const Icon = item.icon;
  const baseColor = item.destructive ? themeColor.red[300] : themeColor.text.secondary;
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => { item.onSelect?.(); onClose(); }}
      className="andromeda-user-menu-item"
      data-destructive={item.destructive ? 'true' : 'false'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[3],
        width: '100%',
        padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: tokens.typography.fontMono,
        fontSize: tokens.typography.size.xs,
        fontWeight: tokens.typography.weight.medium,
        color: baseColor,
        textAlign: 'left',
        textTransform: 'uppercase',
        letterSpacing: tokens.typography.tracking.wide,
        whiteSpace: 'nowrap',
        transition: `background ${tokens.motion.duration.fast} ${tokens.motion.easing.standard}, color ${tokens.motion.duration.fast} ${tokens.motion.easing.standard}`,
      }}
    >
      {Icon ? <Icon size={14} weight="regular" /> : <span style={{ width: '14px' }} />}
      <span style={{ flex: 1 }}>{item.label}</span>
    </button>
  );
}

/**
 * Shared panel — renders the floating menu surface and its items.
 * Visibility, placement, and alignment are controlled by props so
 * each trigger component can pick its own canonical defaults.
 */
export function UserMenuPanel({ open, items, placement = 'bottom', align = 'start', panelMinWidth = 200, ariaLabel = 'User menu', onClose }: {
  open: boolean;
  items: UserMenuItem[];
  placement?: 'top' | 'bottom';
  align?: 'start' | 'end' | 'stretch';
  panelMinWidth?: number;
  ariaLabel?: string;
  onClose: () => void;
}) {
  if (!open) return null;
  const vertical =
    placement === 'top'
      ? { bottom: `calc(100% + ${tokens.spacing[2]})` }
      : { top: `calc(100% + ${tokens.spacing[2]})` };
  const horizontal =
    align === 'stretch'
      ? { left: 0, right: 0 }
      : align === 'end'
        ? { right: 0 }
        : { left: 0 };
  return (
    <div
      role="menu"
      aria-label={ariaLabel}
      onKeyDown={handleMenuKeyDown}
      className="andromeda-user-menu-panel"
      data-align={align}
      style={{
        position: 'absolute',
        ...vertical,
        ...horizontal,
        minWidth: `${panelMinWidth}px`,
        // Cap to a token-inset of the viewport so the absolutely-positioned
        // panel can never push past the screen and force horizontal page
        // scroll on a phone. box-sizing keeps the border inside that cap.
        maxWidth: `calc(100vw - ${tokens.spacing[4]})`,
        boxSizing: 'border-box',
        background: themeColor.surface.raised,
        border: `${tokens.border.thin} ${themeColor.border.base}`,
        borderRadius: tokens.radius.frame,
        padding: tokens.spacing[1],
        zIndex: 1000,
        boxShadow: 'var(--andromeda-shadow-md, 0 8px 21.6px rgba(0, 0, 0, 0.45))',
      }}
    >
      {items.map((item, i) => (
        <UserMenuItemRow key={item.id ?? i} item={item} onClose={onClose} />
      ))}
    </div>
  );
}

// Hover/focus styles for the menuitem buttons. Marked `!important`
// because the buttons carry inline `style={{ background:'transparent' }}`
// which would otherwise beat any non-important class rule — same
// precedence trap covered in the Andromeda interaction-states rules.
function UserMenuStyles() {
  return (
    <style>{`
      .andromeda-user-menu-item:hover {
        background: var(--andromeda-surface-hover) !important;
        color: var(--andromeda-text-primary) !important;
      }
      .andromeda-user-menu-item[data-destructive="true"]:hover {
        background: var(--andromeda-surface-hover) !important;
        color: var(--andromeda-red-200) !important;
      }
      .andromeda-user-menu-item:active {
        background: var(--andromeda-surface-active) !important;
      }
      .andromeda-user-menu-item:focus-visible {
        outline: none;
        box-shadow: inset 0 0 0 1px var(--andromeda-accent-400);
      }
      /* Phone fit — a start-aligned (left:0) panel anchored to a trigger that
         sits in the right half of a phone would open off the right edge. Below
         sm, pin it to the trigger's RIGHT edge instead so it stays on-screen.
         stretch (left:0 + right:0) and end (right:0) are already viewport-safe.
         !important: left/right are inline styles (the Andromeda interaction-states rules). */
      ${mq.sm} {
        .andromeda-user-menu-panel[data-align="start"] {
          left: auto !important;
          right: 0 !important;
        }
      }
    `}</style>
  );
}

// Export so UserCard can mount the same stylesheet without
// duplicating it. Both components must end up with the same
// selectors active or hover state will silently regress.
export { UserMenuStyles };

/**
 * @typedef {object} UserMenuProps
 * @property {string} name             Display name; passed to Avatar for the initial fallback.
 * @property {string} [src]            Avatar image URL.
 * @property {'online'|'caution'|'fault'|'offline'} [status] Presence state; passed to Avatar for the status dot.
 * @property {'sm'|'md'|'lg'} [avatarSize='md'] Size of the trigger avatar.
 * @property {UserMenuItem[]} items The menu rows to render, including separators.
 * @property {'top'|'bottom'} [placement='bottom'] Whether the panel opens below or above the trigger.
 * @property {'start'|'end'} [align='end'] Which trigger edge the panel aligns to horizontally.
 * @property {boolean} [defaultOpen=false] Render the menu pre-opened (showcases / docs). Outside-click and Escape still dismiss it.
 * @property {boolean} [staticOpen=false] Render pre-opened AND pinned; outside-click / Escape do not dismiss it. For showcases / docs where several popovers are shown open at once and one must not close the others.
 * @property {string} [ariaLabel='User menu'] Accessible label for the trigger button and menu panel.
 * @property {string} [className] Class name applied to the wrapper element.
 * @property {React.CSSProperties} [style] Inline styles merged onto the wrapper element.
 */

export type UserMenuProps = ComponentPropsWithoutRef<'div'> & {
  name: string;
  src?: string;
  status?: 'online' | 'caution' | 'fault' | 'offline';
  avatarSize?: 'sm' | 'md' | 'lg';
  items: UserMenuItem[];
  placement?: 'top' | 'bottom';
  align?: 'start' | 'end';
  defaultOpen?: boolean;
  staticOpen?: boolean;
  ariaLabel?: string;
};

/** @type {React.ForwardRefExoticComponent<UserMenuProps>} */
export const UserMenu = forwardRef<HTMLDivElement, UserMenuProps>(function UserMenu(
  {
    name,
    src,
    status,
    avatarSize = 'md',
    items,
    placement = 'bottom',
    align = 'end',
    defaultOpen = false,
    staticOpen = false,
    ariaLabel = 'User menu',
    className,
    style,
    ...props
  },
  ref,
) {
  const { open, wrapperRef, triggerProps, close } = useUserMenuPanel(defaultOpen, staticOpen);
  const [hover, setHover] = useState(false);
  const highlight = open || hover;

  return (
    <div
      ref={(node) => {
        wrapperRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="user-menu"
      className={className}
      style={{ ...andromedaVars(), position: 'relative', display: 'inline-flex', ...style }}
      {...props}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        {...triggerProps}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        style={{
          all: 'unset',
          boxSizing: 'border-box',
          display: 'inline-flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
          cursor: 'pointer',
          background: highlight ? themeColor.surface.hover : 'transparent',
          transition: `background ${tokens.motion.duration.fast} ${tokens.motion.easing.standard}`,
        }}
      >
        <Avatar name={name} src={src} status={status} size={avatarSize} />
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={{
            duration: toSeconds(tokens.motion.duration.normal),
            ease: EASE_STANDARD,
          }}
          style={{
            display: 'inline-flex',
            color: highlight ? themeColor.text.secondary : themeColor.text.faint,
            transition: `color ${tokens.motion.duration.fast} ${tokens.motion.easing.standard}`,
          }}
        >
          <CaretUpDown size={14} weight="regular" />
        </motion.span>
      </button>

      <UserMenuPanel
        open={open}
        items={items}
        placement={placement}
        align={align}
        ariaLabel={ariaLabel}
        onClose={close}
      />
      <UserMenuStyles />
    </div>
  );
});
