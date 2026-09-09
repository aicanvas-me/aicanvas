// ============================================================
// COMPONENT: PanelHeader
// Title row that sits at the top of a panel — sentence-case mono
// title on the left, optional `actions` slot on the right (typically
// PanelMenu / IconButton). Bottom border uses the inset divider
// pattern: `border.subtle` line inset by spacing[3] from each edge.
//
//   <PanelHeader title="Capacity" actions={<PanelMenu items={…} />} />
//
// Distinct from CardHeader (uppercase widest mono, smaller padding,
// inset divider). PanelHeader is for top-level panels in dashboards;
// CardHeader is for nested compositions inside Card.
// ============================================================

'use client';

import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { tokens } from '../tokens';
import { andromedaVars, cn, themeColor } from './lib/utils';
import { mq } from './lib/responsive';

/**
 * @typedef {object} PanelHeaderProps
 * @property {React.ReactNode} title             Sentence-case mono title.
 * @property {React.ReactNode} [actions]         Right-aligned slot (PanelMenu, IconButton, Button, etc.).
 * @property {string}          [className]
 * @property {React.CSSProperties} [style]
 */

export type PanelHeaderProps = Omit<ComponentPropsWithoutRef<'div'>, 'title'> & {
  title: ReactNode;
  actions?: ReactNode;
};

/** @type {React.ForwardRefExoticComponent<PanelHeaderProps & React.HTMLAttributes<HTMLDivElement>>} */
export const PanelHeader = forwardRef<HTMLDivElement, PanelHeaderProps>(function PanelHeader(
  { title, actions, className, style, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="panel-header"
      className={cn('am-panel-header', className)}
      style={{
        ...andromedaVars(),
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        // Title + actions stay on ONE row at every width, actions pushed right
        // by the spacer. The title truncates (min-width:0 + ellipsis below) so a
        // long title shortens rather than wrapping the actions down to their own
        // line — panel titles are short by design and a wrapped kebab reads as
        // broken (its menu then opens off the left edge). See <style> for the
        // phone padding step-down.
        gap: 'var(--andromeda-3, 12px)',
        padding: 'var(--andromeda-4, 16px) var(--andromeda-5, 20px)',
        ...style,
      }}
      {...props}
    >
      <span
        className="am-panel-header-title"
        style={{
          // min-width:0 lets the title shrink and the spacer keep working;
          // a long title truncates rather than blowing the row out.
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontFamily: tokens.typography.fontSans,
          fontSize: 'var(--andromeda-text-xl, 18px)',
          fontWeight: tokens.typography.weight.semibold,
          color: 'var(--andromeda-text-primary, #F5F5F5)',
          letterSpacing: 'var(--andromeda-tracking-tight, 0)',
        }}
      >
        {title}
      </span>
      {actions ? (
        <>
          <div className="am-panel-header-spacer" style={{ flex: 1 }} />
          <div className="am-panel-header-actions" style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
            {actions}
          </div>
        </>
      ) : null}
      {/* Inset divider — 12px from each edge, matches CardHeader convention. */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: tokens.spacing[3],
          right: tokens.spacing[3],
          bottom: 0,
          height: 'var(--andromeda-border-width, 1px)',
          background: themeColor.border.subtle,
          pointerEvents: 'none',
        }}
      />
      <style>{`
        ${mq.md} {
          /* Phones keep the single row (title left, actions right) — only the
             horizontal padding steps down a notch for density. The title
             truncates via its base ellipsis style, so the actions slot never
             gets pushed onto its own line. Wrapping the row (the previous
             behaviour) dropped the kebab to the left edge and opened its menu
             off-screen, which read as broken. The inset divider still sits
             spacing[3] from each edge. */
          .am-panel-header {
            padding-left: ${tokens.spacing[4]} !important;
            padding-right: ${tokens.spacing[4]} !important;
          }
        }
      `}</style>
    </div>
  );
});