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
        gap: 'var(--andromeda-3, 12px)',
        padding: 'var(--andromeda-4, 16px) var(--andromeda-5, 20px)',
        ...style,
      }}
      {...props}
    >
      <span
        className="am-panel-header-title"
        style={{
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