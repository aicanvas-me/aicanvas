'use client';

import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import { cn, themeColor } from './lib/utils';
import { tokens } from '../tokens';

/**
 * @typedef {object} CornerMarkersProps
 * @property {number} [size]        px square the bracket lives inside; defaults to tokens.marker.size
 * @property {number} [offset]      px inset from the corner; defaults to tokens.marker.offset
 * @property {number} [borderWidth] px stroke thickness; defaults to tokens.marker.borderWidth
 * @property {string} [color]       any CSS color; defaults to themeColor.border.bright
 * @property {number} [radius]      px corner curve; defaults to the --andromeda-radius-frame token
 * @property {string} [className]
 */

export type CornerMarkersProps = ComponentPropsWithoutRef<'div'> & {
  size?: number;
  offset?: number;
  borderWidth?: number;
  color?: string;
  radius?: number;
};

type MarkerRadiusProp = Extract<
  keyof CSSProperties,
  'borderTopLeftRadius' | 'borderTopRightRadius' | 'borderBottomLeftRadius' | 'borderBottomRightRadius'
>;

type MarkerPosition = {
  key: string;
  radiusProp: MarkerRadiusProp;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export const CornerMarkers = forwardRef<HTMLDivElement, CornerMarkersProps>(function CornerMarkers(
  { size, offset, borderWidth, color, radius, className, ...props },
  ref,
) {
  const s  = size        ?? tokens.marker.size;
  const o  = offset      ?? tokens.marker.offset;
  // Props bypass var(): an ancestor's andromedaVars() sets these vars and would win.
  const bw = borderWidth != null ? `${borderWidth}px` : `var(--andromeda-marker-width, ${tokens.marker.borderWidth}px)`;
  const c  = color       ?? `var(--andromeda-border-bright, ${themeColor.border.bright})`;
  const r  = radius != null ? `${radius}px` : `var(--andromeda-radius-frame, 0px)`;

  const positions: MarkerPosition[] = [
    { key: 'tl', radiusProp: 'borderTopLeftRadius',     top:    o, left:  o },
    { key: 'tr', radiusProp: 'borderTopRightRadius',    top:    o, right: o },
    { key: 'bl', radiusProp: 'borderBottomLeftRadius',  bottom: o, left:  o },
    { key: 'br', radiusProp: 'borderBottomRightRadius', bottom: o, right: o },
  ];

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-slot="corner-markers"
      className={cn('contents', className)}
      {...props}
    >
      {positions.map(({ key, radiusProp, ...coords }) => (
        <span
          key={key}
          className="absolute pointer-events-none"
          style={{
            width:             `${s}px`,
            height:            `${s}px`,
            borderStyle:       'solid',
            borderColor:       c,
            borderTopWidth:    key.startsWith('t') ? bw : 0,
            borderBottomWidth: key.startsWith('b') ? bw : 0,
            borderLeftWidth:   key.endsWith('l')   ? bw : 0,
            borderRightWidth:  key.endsWith('r')   ? bw : 0,
            [radiusProp]:      r,
            ...coords,
          }}
        />
      ))}
    </div>
  );
});
