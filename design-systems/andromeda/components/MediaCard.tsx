// ============================================================================
// MEDIACARD
// An image-backed content tile for routines, channels, and featured items where
// a strong visual preview needs concise identity, metadata, and one clear action.
//
// Props provide the image, code, title, and metadata; select play, CTA, or no
// action; control play state and action handling; and size or style the card.
// ============================================================================

'use client';

import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import { Play, Pause, ArrowUpRight } from '@phosphor-icons/react';
import { tokens } from '../tokens';
import { cn, andromedaVars } from './lib/utils';
import { Card } from './Card';
import { Tag } from './Tag';
import { IconButton } from './IconButton';

const DEFAULT_IMAGE =
  'https://ik.imagekit.io/aitoolkit/andromeda/signal-room/mix-01.webp';
const NOOP = () => {};
const EMPTY_STYLE: CSSProperties = {};

/**
 * @typedef {object} MediaCardProps
 * @property {string} [image=DEFAULT_IMAGE] Background image URL for the full-bleed media.
 * @property {string} [code='MIX-01'] Mono identifier shown in the top-left tag; a falsy value hides it.
 * @property {string} [title='Your Mix'] Primary title shown over the lower image edge.
 * @property {string} [meta='Updates daily'] Uppercase metadata shown beneath the title.
 * @property {'play' | 'cta' | 'none'} [action='play'] Selects the card's single action treatment.
 * @property {string} [ctaLabel='Open'] Accessible label for the CTA action's arrow icon button.
 * @property {boolean} [playing=false] Shows the active pause control when the play action is selected.
 * @property {() => void} [onAction=NOOP] Called when the selected play or CTA control is pressed.
 * @property {number | string} [height=200] CSS height of the card.
 * @property {string} [className=''] Additional class names applied to the Card root.
 * @property {React.CSSProperties} [style=EMPTY_STYLE] Inline styles merged onto the Card root.
 */
type MediaCardOwnProps = {
  image?: string;
  code?: string;
  title?: string;
  meta?: string;
  action?: 'play' | 'cta' | 'none';
  ctaLabel?: string;
  playing?: boolean;
  onAction?: () => void;
  height?: number | string;
  className?: string;
  style?: CSSProperties;
};

type MediaCardProps = MediaCardOwnProps & Omit<ComponentPropsWithoutRef<'div'>, keyof MediaCardOwnProps>;

/** @type {React.ForwardRefExoticComponent<MediaCardProps & React.HTMLAttributes<HTMLDivElement>>} */
export const MediaCard = forwardRef<HTMLDivElement, MediaCardProps>(function MediaCard(
  {
    image = DEFAULT_IMAGE,
    code = 'MIX-01',
    title = 'Your Mix',
    meta = 'Updates daily',
    action = 'play',
    ctaLabel = 'Open',
    playing = false,
    onAction = NOOP,
    height = 200,
    className = '',
    style = EMPTY_STYLE,
    ...props
  },
  ref,
) {
  const actionElement =
    action === 'play' ? (
      <IconButton
        variant={playing ? 'default' : 'outline'}
        size="md"
        icon={playing ? Pause : Play}
        aria-label={playing ? `Pause ${title}` : `Play ${title}`}
        onClick={(e) => { e.stopPropagation(); onAction(); }}
      />
    ) : action === 'cta' ? (
      // Accent-filled arrow icon button, same md size as the play action, so
      // both action treatments read as one corner control. ctaLabel becomes
      // the accessible label since the glyph carries no visible text.
      <IconButton
        variant="default"
        size="md"
        icon={ArrowUpRight}
        aria-label={ctaLabel}
        onClick={(e) => { e.stopPropagation(); onAction(); }}
      />
    ) : null;

  return (
    <Card
      ref={ref}
      markers={false}
      className={cn('andromeda-media-card', className)}
      // The whole card is the action target when there is one: clicking
      // anywhere triggers onAction (the play/CTA), not just the corner button.
      onClick={action !== 'none' ? onAction : undefined}
      style={{
        ...andromedaVars(),
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[3],
        padding: tokens.spacing[3],
        height,
        position: 'relative',
        overflow: 'hidden',
        cursor: action !== 'none' ? 'pointer' : undefined,
        ...style,
      }}
      {...props}
    >
      <div
        aria-hidden="true"
        className="andromeda-media-card-image"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${JSON.stringify(image)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.85,
          filter: 'grayscale(35%) contrast(1.05)',
          pointerEvents: 'none',
          transformOrigin: 'center',
          transition: `transform ${tokens.motion.duration.slow} ${tokens.motion.easing.out}`,
        }}
      />

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          // The photo is the ground here, not the theme: the scrim and the ink on
          // top of it stay dark-theme literals in both themes so titles never
          // paint dark-on-dark over an image.
          background: `linear-gradient(180deg, transparent 0%, transparent 55%, ${tokens.color.surface.alpha} 100%)`,
          pointerEvents: 'none',
        }}
      />

      {code ? (
        <div style={{ position: 'relative', alignSelf: 'flex-start' }}>
          <Tag variant="default">{code}</Tag>
        </div>
      ) : null}

      <div style={{ flex: 1 }} />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: tokens.spacing[2],
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[1],
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontFamily: tokens.typography.fontSans,
              fontSize: tokens.typography.size.lg,
              fontWeight: tokens.typography.weight.semibold,
              color: tokens.color.text.primary,
              letterSpacing: tokens.typography.tracking.tight,
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontFamily: tokens.typography.fontMono,
              fontSize: tokens.typography.size.xs,
              color: tokens.color.text.muted,
              textTransform: 'uppercase',
              letterSpacing: tokens.typography.tracking.wider,
            }}
          >
            {meta}
          </span>
        </div>

        {actionElement}
      </div>

      {/* Hover zoom on the image only (the card frame + text hold still) — the
          overflow:hidden root clips the scaled photo. Held steady under
          prefers-reduced-motion. */}
      <style>{`
        .andromeda-media-card:hover .andromeda-media-card-image {
          transform: scale(1.12);
        }
        @media (prefers-reduced-motion: reduce) {
          .andromeda-media-card-image { transition: none !important; }
          .andromeda-media-card:hover .andromeda-media-card-image { transform: none !important; }
        }
      `}</style>
    </Card>
  );
});

MediaCard.displayName = 'MediaCard';
