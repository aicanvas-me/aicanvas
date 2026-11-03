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

// Returns seconds: Framer Motion takes seconds, tokens store ms.
const toSeconds = (ms: string) => parseInt(ms, 10) / 1000;
// Mirrors tokens.motion.easing.standard; change both.
const EASE_STANDARD: [number, number, number, number] = [0.4, 0, 0.2, 1];

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

export function useUserMenuPanel(initialOpen = false, staticOpen = false) {
  const [open, setOpen] = useState(initialOpen || staticOpen);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
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

  // Never in staticOpen: every pinned menu would pull page focus on load.
  useEffect(() => {
    if (!open || staticOpen) return;
    const first = wrapperRef.current?.querySelector<HTMLElement>('[role="menu"] button[role="menuitem"]');
    if (first) first.focus();
  }, [open, staticOpen]);

  useEffect(() => {
    if (open || staticOpen) return;
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (target) target.focus();
  }, [open, staticOpen]);

  const toggle = (e?: ReactMouseEvent<HTMLElement>) => {
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
        // Phone guard: without this cap a wide panel pushes the page into sideways scroll.
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

// Hover and active need !important: the item buttons set background and color inline.
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
        // wrapperRef must wrap trigger and panel: outside-click and first-item focus read it.
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
