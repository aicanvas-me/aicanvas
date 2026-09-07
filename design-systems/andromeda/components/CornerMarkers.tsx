// ============================================================
// COMPONENT: CornerMarkers
// shadcn/ui-aligned API: forwardRef, className, ...props.
// Defining motif of Andromeda — four L-shaped brackets that hug
// each corner of the nearest position:relative ancestor.
// Geometry comes from `tokens.marker.{size,offset,borderWidth}`.
// Color defaults to `themeColor.border.bright` — every bracket
// in the system uses this same value so the motif stays consistent.
//
// Each bracket curves at its OUTER corner to match the system frame
// radius (--andromeda-radius-frame). At the default 0 the brackets are
// sharp right angles (the classic look); raising the corner radius bows
// each L inward so a bracket-framed panel — which has no border for a
// normal border-radius to round — still reads as rounded. This is how the
// corner-radius knob reaches surfaceless (transparent) panels.
// ============================================================

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

/** @type {React.ForwardRefExoticComponent<CornerMarkersProps & React.HTMLAttributes<HTMLDivElement>>} */
export const CornerMarkers = forwardRef<HTMLDivElement, CornerMarkersProps>(function CornerMarkers(
  { size, offset, borderWidth, color, radius, className, ...props },
  ref,
) {
  const s  = size        ?? tokens.marker.size;
  const o  = offset      ?? tokens.marker.offset;
  // Explicit prop beats the theme var; without the prop, the theme var (with
  // the token default as fallback) drives the stroke. An ancestor always
  // defines --andromeda-marker-width via andromedaVars(), so the var form
  // would silently swallow a passed prop.
  const bw = borderWidth != null ? `${borderWidth}px` : `var(--andromeda-marker-width, ${tokens.marker.borderWidth}px)`;
  // The defining motif must follow a theme like its own stroke width does;
  // the explicit color prop still wins (var only when no prop given).
  const c  = color       ?? `var(--andromeda-border-bright, ${themeColor.border.bright})`;
  // Corner curve. Same explicit-prop-wins-over-var rule as the stroke width.
  // The bracket is `s` px square, so the browser clamps the curve to that box
  // — a large frame radius just fills the bracket into a quarter-round.
  const r  = radius != null ? `${radius}px` : `var(--andromeda-radius-frame, 0px)`;

  // Each marker is an L-shape: only the two borders that meet at its corner,
  // and the OUTER corner (where they meet) carries the curve.
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
