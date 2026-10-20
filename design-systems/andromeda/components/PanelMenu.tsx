'use client';

import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type {
  CSSProperties,
  ComponentPropsWithoutRef,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { CaretRight, DotsThreeVertical } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { tokens } from '../tokens';
import { IconButton } from './IconButton';
import { andromedaVars, inheritedThemeVars, themeColor } from './lib/utils';

/**
 * @typedef {object} MenuItem
 * @property {string}   [label] Text shown for the menu item.
 * @property {React.ComponentType<{ size?: number, weight?: string }>} [icon] Icon rendered to the left of the label.
 * @property {() => void} [onSelect] Handler called when the item is chosen (ignored on items with a submenu).
 * @property {MenuItem[]} [submenu] Nested items opened as a flyout submenu.
 * @property {boolean}  [selected] Marks the item as the active choice, styling it accordingly.
 * @property {boolean}  [destructive] Renders the item label in the destructive red color.
 * @property {'separator'} [type] Set to 'separator' to render a divider rule instead of a clickable item.
 */

/**
 * @typedef {object} PanelMenuProps
 * @property {MenuItem[]} items Entries rendered in the menu, in order.
 * @property {'left'|'right'} [align='right'] Edge of the trigger the menu aligns to.
 * @property {string} [ariaLabel='Panel options'] Accessible label for the kebab trigger button.
 * @property {boolean} [defaultOpen=false] Render the menu pre-opened. Useful in
 *   showcases / docs so the consumer can see the menu contents without first
 *   having to click the trigger. Click-outside and Escape still dismiss it.
 * @property {boolean} [staticOpen=false] Like defaultOpen, but the menu stays
 *   open: the click-outside and Escape dismissers are not attached. For
 *   showcases / docs where the menu must remain visible as the reader scrolls
 *   past, so the component reads as a menu without any interaction. The trigger
 *   can still toggle it. Not for product UI; a real overflow menu must dismiss.
 * @property {string} [className] Extra class applied to the wrapper element.
 * @property {React.CSSProperties} [style] Inline styles merged onto the wrapper element.
 */

type MenuItem = {
  label?: string;
  icon?: Icon;
  onSelect?: () => void;
  submenu?: MenuItem[];
  selected?: boolean;
  destructive?: boolean;
  type?: 'separator';
};

type PanelMenuProps = ComponentPropsWithoutRef<'div'> & {
  items: MenuItem[];
  align?: 'left' | 'right';
  ariaLabel?: string;
  defaultOpen?: boolean;
  staticOpen?: boolean;
};

type Timer = ReturnType<typeof setTimeout>;

const ITEM_HEIGHT = 26;

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const MENU_PANEL_STYLE: CSSProperties = {
  minWidth: '160px',
  maxWidth: `calc(100vw - ${tokens.spacing[4]})`,
  maxHeight: `calc(100vh - ${tokens.spacing[4]})`,
  overflowY: 'auto',
  boxSizing: 'border-box',
  background: themeColor.surface.overlay,
  border: `${tokens.border.thin} ${themeColor.border.bright}`,
  borderRadius: tokens.radius.frame,
  padding: tokens.spacing[1],
  zIndex: 1000,
  boxShadow: 'var(--andromeda-shadow-md, 0 8px 21.6px rgba(0, 0, 0, 0.45))',
};

function handleMenuKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
  const container = e.currentTarget;
  // Matches MenuItem's wrapper div > button; change both or arrow keys stop working.
  const itemsList = Array.from(
    container.querySelectorAll<HTMLElement>(':scope > div > button[role="menuitem"]'),
  );
  if (itemsList.length === 0) return;

  const current = document.activeElement;
  const idx = itemsList.indexOf(current as HTMLElement);

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    e.stopPropagation();
    const next = idx < 0 ? 0 : (idx + 1) % itemsList.length;
    itemsList[next].focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    e.stopPropagation();
    const prev = idx < 0 ? itemsList.length - 1 : (idx - 1 + itemsList.length) % itemsList.length;
    itemsList[prev].focus();
  } else if (e.key === 'Home') {
    e.preventDefault();
    e.stopPropagation();
    itemsList[0].focus();
  } else if (e.key === 'End') {
    e.preventDefault();
    e.stopPropagation();
    itemsList[itemsList.length - 1].focus();
  }
}

function MenuItem({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const itemRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const submenuRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<Timer | null>(null);

  useEffect(() => () => clearTimeout(closeTimer.current ?? undefined), []);

  const submenuOpenedByKey = useRef(false);
  useEffect(() => {
    if (submenuOpen && submenuOpenedByKey.current && submenuRef.current) {
      const first = submenuRef.current.querySelector<HTMLElement>('button[role="menuitem"]');
      if (first) first.focus();
    }
    if (!submenuOpen) submenuOpenedByKey.current = false;
  }, [submenuOpen]);

  const [flipLeft, setFlipLeft] = useState(false);
  const [subPos, setSubPos] = useState<{ top: number; left: number; right: number } | null>(null);
  useIsomorphicLayoutEffect(() => {
    if (!submenuOpen) {
      setSubPos(null);
      return;
    }
    const decide = () => {
      const itemEl = itemRef.current;
      const sub = submenuRef.current;
      if (!itemEl || !sub) return;
      const margin = parseInt(tokens.spacing[2], 10) || 8;
      const gap = parseInt(tokens.spacing[1], 10) || 4;
      const ir = itemEl.getBoundingClientRect();
      const w = sub.getBoundingClientRect().width;
      const rightOverflows = ir.right + gap + w > window.innerWidth - margin;
      const leftFits = ir.left - gap - w >= margin;
      setFlipLeft(rightOverflows && leftFits);
      // Measured from 0,0: a transformed or blurred ancestor re-bases fixed coords.
      const prev = { left: sub.style.left, top: sub.style.top, transform: sub.style.transform };
      sub.style.left = '0px';
      sub.style.top = '0px';
      sub.style.transform = 'none';
      const origin = sub.getBoundingClientRect();
      sub.style.left = prev.left;
      sub.style.top = prev.top;
      sub.style.transform = prev.transform;
      setSubPos({ top: ir.top - origin.top, left: ir.right - origin.left, right: ir.left - origin.left });
    };
    decide();
    window.addEventListener('resize', decide);
    window.addEventListener('scroll', decide, true);
    return () => {
      window.removeEventListener('resize', decide);
      window.removeEventListener('scroll', decide, true);
    };
  }, [submenuOpen]);

  if (item.type === 'separator') {
    return (
      <div
        role="separator"
        style={{
          height: '1px',
          margin: `${tokens.spacing[1]} 0`,
          background: themeColor.border.base,
        }}
      />
    );
  }

  const Icon = item.icon;
  const hasSub = Array.isArray(item.submenu) && item.submenu.length > 0;

  function handleEnter() {
    clearTimeout(closeTimer.current ?? undefined);
    if (hasSub) setSubmenuOpen(true);
  }
  function handleLeave() {
    if (hasSub) {
      closeTimer.current = setTimeout(() => setSubmenuOpen(false), 120);
    }
  }

  function handleClick() {
    if (hasSub) {
      setSubmenuOpen((o) => !o);
      return;
    }
    item.onSelect?.();
    onClose();
  }

  function handleButtonKeyDown(e: ReactKeyboardEvent<HTMLButtonElement>) {
    if (hasSub && e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      submenuOpenedByKey.current = true;
      setSubmenuOpen(true);
    }
  }

  function handleSubmenuKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      setSubmenuOpen(false);
      buttonRef.current?.focus();
    }
  }

  const color = item.destructive
    ? themeColor.red[300]
    : item.selected
      ? themeColor.text.primary
      : themeColor.text.secondary;

  return (
    <div
      ref={itemRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ position: 'relative' }}
    >
      <button
        ref={buttonRef}
        type="button"
        role="menuitem"
        aria-haspopup={hasSub ? 'menu' : undefined}
        aria-expanded={hasSub ? submenuOpen : undefined}
        onClick={handleClick}
        onKeyDown={handleButtonKeyDown}
        className="andromeda-panel-menu-item"
        data-selected={item.selected ? 'true' : 'false'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          width: '100%',
          height: `${ITEM_HEIGHT}px`,
          padding: `0 ${tokens.spacing[3]}`,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontFamily: tokens.typography.fontMono,
          fontSize: tokens.typography.size.sm,
          fontWeight: item.selected ? tokens.typography.weight.medium : tokens.typography.weight.regular,
          color,
          textAlign: 'left',
          textTransform: 'uppercase',
          letterSpacing: tokens.typography.tracking.wide,
          whiteSpace: 'nowrap',
          transition: `background ${tokens.motion.duration.fast} ${tokens.motion.easing.standard}, color ${tokens.motion.duration.fast} ${tokens.motion.easing.standard}`,
        }}
      >
        {Icon ? <Icon size={14} weight="regular" /> : <span style={{ width: '14px' }} />}
        <span style={{ flex: 1 }}>{item.label}</span>
        {hasSub ? <CaretRight size={10} weight="bold" /> : null}
      </button>

      {hasSub && submenuOpen ? (
        <div
          ref={submenuRef}
          role="menu"
          className="andro-submenu"
          onKeyDown={(e) => {
            handleSubmenuKeyDown(e);
            handleMenuKeyDown(e);
          }}
          style={{
            ...MENU_PANEL_STYLE,
            position: 'fixed',
            top: `${subPos?.top ?? 0}px`,
            ...(flipLeft
              ? {
                  left: `${(subPos?.right ?? 0) - (parseInt(tokens.spacing[1], 10) || 4)}px`,
                  transform: 'translateX(-100%)',
                }
              : { left: `${(subPos?.left ?? 0) + (parseInt(tokens.spacing[1], 10) || 4)}px` }),
            visibility: subPos ? 'visible' : 'hidden',
            zIndex: 1001,
          }}
        >
          {item.submenu!.map((sub, i) => (
            <MenuItem key={i} item={sub} onClose={onClose} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export const PanelMenu = forwardRef<HTMLDivElement, PanelMenuProps>(function PanelMenu(
  { items, align = 'right', ariaLabel = 'Panel options', defaultOpen = false, staticOpen = false, className, style, ...props },
  ref,
) {
  const [open, setOpen] = useState(defaultOpen || staticOpen);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => setMounted(true), []);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  // Never in staticOpen: every pinned menu would pull page focus on load.
  useEffect(() => {
    if (!open || staticOpen) return;
    const first = menuRef.current?.querySelector<HTMLElement>('button[role="menuitem"]');
    if (first) first.focus();
  }, [open, staticOpen]);

  useEffect(() => {
    if (open || staticOpen) return;
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    if (target) target.focus();
  }, [open, staticOpen]);

  useEffect(() => {
    if (!open || staticOpen) return;
    function onClick(e: MouseEvent) {
      const inWrapper = wrapperRef.current && wrapperRef.current.contains(e.target as Node);
      const inMenu = menuRef.current && menuRef.current.contains(e.target as Node);
      if (!inWrapper && !inMenu) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, staticOpen]);

  useIsomorphicLayoutEffect(() => {
    if (staticOpen) return;
    if (!open) { setCoords(null); return; }
    // The body portal copies its theme vars from the trigger, or light pages get dark menus.
    const trigger0 = wrapperRef.current;
    const menu0 = menuRef.current;
    if (trigger0 && menu0) {
      for (const [name, value] of Object.entries(inheritedThemeVars(trigger0))) menu0.style.setProperty(name, value);
    }
    const reposition = () => {
      const trigger = wrapperRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) return;
      const margin = parseInt(tokens.spacing[2], 10) || 8;
      const tr = trigger.getBoundingClientRect();
      const mr = menu.getBoundingClientRect();
      const fitsDown = tr.bottom + margin + mr.height <= window.innerHeight - margin;
      const fitsUp = tr.top - margin - mr.height >= margin;
      let top = !fitsDown && fitsUp ? tr.top - margin - mr.height : tr.bottom + margin;
      top = Math.max(margin, Math.min(top, window.innerHeight - mr.height - margin));
      let left = align === 'right' ? tr.right - mr.width : tr.left;
      left = Math.max(margin, Math.min(left, window.innerWidth - mr.width - margin));
      setCoords({ top, left });
    };
    reposition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
    // mounted: a defaultOpen menu can only measure once its portal exists.
  }, [open, staticOpen, align, mounted]);

  return (
    <div
      ref={(node) => {
        wrapperRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="panel-menu"
      className={className}
      style={{ ...andromedaVars(), position: 'relative', display: 'inline-flex', ...style }}
      {...props}
    >
      <IconButton
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        variant="ghost"
        size="sm"
        icon={DotsThreeVertical}
        onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
          if (!open && !staticOpen) returnFocusRef.current = e.currentTarget;
          setOpen((o) => !o);
        }}
        data-state={open ? 'open' : 'closed'}
        style={open ? {
          background: themeColor.surface.active,
          color: themeColor.text.primary,
        } : undefined}
      />

      {open ? (
        staticOpen ? (
          <div
            ref={menuRef}
            role="menu"
            onKeyDown={handleMenuKeyDown}
            style={{
              position: 'absolute',
              top: `calc(100% + ${tokens.spacing[2]})`,
              [align === 'right' ? 'right' : 'left']: 0,
              ...MENU_PANEL_STYLE,
            }}
          >
            {items.map((item, i) => (
              <MenuItem key={i} item={item} onClose={() => setOpen(false)} />
            ))}
          </div>
        ) : mounted ? (
          createPortal(
            <div
              ref={menuRef}
              role="menu"
              onKeyDown={handleMenuKeyDown}
              style={{
                ...andromedaVars(),
                position: 'fixed',
                top: coords ? coords.top : 0,
                left: coords ? coords.left : 0,
                visibility: coords ? 'visible' : 'hidden',
                ...MENU_PANEL_STYLE,
              }}
            >
              {items.map((item, i) => (
                <MenuItem key={i} item={item} onClose={() => setOpen(false)} />
              ))}
            </div>,
            document.body,
          )
        ) : null
      ) : null}

      <style>{`
        /* !important is required: the menuitem button carries inline
           style={{ background:'transparent', color }} which would otherwise
           beat any class rule on hover/active. Same precedence trap as
           DateRangePicker — see the Andromeda interaction-states rules. */
        .andromeda-panel-menu-item:hover {
          background: var(--andromeda-surface-hover) !important;
          color: var(--andromeda-text-primary) !important;
        }
        .andromeda-panel-menu-item:active {
          background: var(--andromeda-surface-active) !important;
          color: var(--andromeda-text-primary) !important;
        }
        .andromeda-panel-menu-item[data-selected="true"] {
          background: var(--andromeda-surface-active) !important;
          color: var(--andromeda-text-primary) !important;
        }
        .andromeda-panel-menu-item:focus-visible {
          outline: none;
          box-shadow: inset 0 0 0 1px var(--andromeda-accent-400);
        }
      `}</style>
    </div>
  );
});
