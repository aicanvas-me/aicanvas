// ============================================================
// COMPONENT: UserCard
// User card menu — the same popover as `UserMenu`, but the trigger
// is a wider card showing the user's avatar, name, and role
// alongside the CaretUpDown chevron. Designed for the bottom of a
// sidebar where there is room to spell the user identity out;
// reach for `UserMenu` instead when the trigger has to fit beside
// other top-bar controls.
//
// Defaults `placement="top"` and `align="stretch"` because the
// canonical home is a bottom-of-sidebar slot: the menu opens
// upward so it doesn't run off-screen and stretches to the card's
// width so the panel sits flush.
//
// Follows the same popover rules as `UserMenu` — see that file's
// header and the Andromeda interaction-states rules. Panel state + items rendering
// are reused from `./UserMenu` so the two components can never
// drift apart visually.
// ============================================================

'use client';

import { forwardRef, useState } from 'react';
import type { ComponentProps, ComponentPropsWithoutRef, RefObject } from 'react';
import { motion } from 'framer-motion';
import { CaretUpDown } from '@phosphor-icons/react';
import { tokens } from '../tokens';
import { Avatar } from './Avatar';
import { andromedaVars, easingArray, themeColor } from './lib/utils';
import {
  UserMenuPanel,
  UserMenuStyles,
  useUserMenuPanel,
} from './UserMenu';

// Motion locals — same convention as Drawer / UserMenu: keep every
// duration + easing referenced to a token while adapting to the shape
// framer-motion expects (seconds + 4-tuple bezier).
const toSeconds = (ms: string) => parseInt(ms, 10) / 1000;
// framer boundary: derived from tokens, cannot follow runtime var overrides
const EASE_STANDARD = easingArray(tokens.motion.easing.standard);

/**
 * @typedef {object} UserCardProps
 * @property {string} name Shown as the card's primary label and used for the avatar initials.
 * @property {string} [role]           Subtitle under the name (e.g. "Flight Director").
 * @property {string} [src] Optional avatar image URL; falls back to initials when absent.
 * @property {'online'|'caution'|'fault'|'offline'} [status] Presence status shown as a dot on the avatar. Passed verbatim to Avatar, whose enum this is; any other value renders no dot.
 * @property {'sm'|'md'|'lg'} [avatarSize='md'] Size of the avatar shown in the card.
 * @property {UserMenuItem[]} items Entries rendered in the popover menu.
 * @property {'top'|'bottom'} [placement='top'] Which side of the card the menu opens toward.
 * @property {'start'|'end'|'stretch'} [align='stretch'] How the panel aligns to the card; stretch matches its width.
 * @property {boolean} [defaultOpen=false] Render the menu pre-opened (showcases / docs). Outside-click and Escape still dismiss it.
 * @property {boolean} [staticOpen=false] Render pre-opened AND pinned; outside-click / Escape do not dismiss it. For showcases / docs where several popovers are shown open at once and one must not close the others.
 * @property {string} [ariaLabel='User menu'] Accessible label for the trigger button and menu.
 * @property {string} [className] Extra class names for the card's root element.
 * @property {React.CSSProperties} [style] Inline styles merged onto the card's root element.
 */

export type UserCardProps = ComponentPropsWithoutRef<'div'> & {
  name: string;
  role?: string;
  src?: string;
  status?: 'online' | 'caution' | 'fault' | 'offline';
  avatarSize?: 'sm' | 'md' | 'lg';
  items: ComponentProps<typeof UserMenuPanel>['items'];
  placement?: 'top' | 'bottom';
  align?: 'start' | 'end' | 'stretch';
  defaultOpen?: boolean;
  staticOpen?: boolean;
  ariaLabel?: string;
};

/** @type {React.ForwardRefExoticComponent<UserCardProps>} */
export const UserCard = forwardRef<HTMLDivElement, UserCardProps>(function UserCard(
  {
    name,
    role,
    src,
    status,
    avatarSize = 'md',
    items,
    placement = 'top',
    align = 'stretch',
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
      ref={(node: HTMLDivElement | null) => {
        (wrapperRef as RefObject<HTMLDivElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="user-card"
      className={className}
      style={{ ...andromedaVars(), position: 'relative', display: 'block', width: '100%', ...style }}
      {...props}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        {...(triggerProps as ComponentPropsWithoutRef<'button'>)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        style={{
          all: 'unset',
          boxSizing: 'border-box',
          position: 'relative',
          width: '100%',
          padding: tokens.spacing[3],
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          cursor: 'pointer',
          background: highlight ? themeColor.surface.hover : 'transparent',
          transition: `background var(--andromeda-duration-fast, ${tokens.motion.duration.fast}) var(--andromeda-easing-standard, ${tokens.motion.easing.standard})`,
        }}
      >
        <Avatar name={name} src={src} status={status} size={avatarSize} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              fontWeight: tokens.typography.weight.semibold,
              color: themeColor.text.primary,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.wider,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </div>
          {role ? (
            <div
              style={{
                fontFamily: tokens.typography.fontMono,
                fontSize: tokens.typography.size.xs,
                color: themeColor.text.muted,
                textTransform: 'uppercase',
                letterSpacing: tokens.typography.tracking.wide,
              }}
            >
              {role}
            </div>
          ) : null}
        </div>
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
            transition: `color var(--andromeda-duration-fast, ${tokens.motion.duration.fast}) var(--andromeda-easing-standard, ${tokens.motion.easing.standard})`,
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
