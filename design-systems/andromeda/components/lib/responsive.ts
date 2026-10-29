'use client';

import { useEffect, useState } from 'react';
import { tokens } from '../../tokens';

const bp = tokens.breakpoints;

// The breakpoint tokens must stay in px: parseInt drops any other unit.
export const breakpointPx = {
  sm: parseInt(bp.sm, 10),
  md: parseInt(bp.md, 10),
  lg: parseInt(bp.lg, 10),
};

// @media cannot read var(), so these interpolate the token values as literals.
export const mq = {
  sm: `@media (max-width: ${bp.sm})`,
  md: `@media (max-width: ${bp.md})`,
  lg: `@media (max-width: ${bp.lg})`,
  coarse: '@media (pointer: coarse)',
};

// Reports desktop until mounted; style with mq instead or phones flash one desktop frame.
export function useBreakpoint() {
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const read = () => setWidth(window.innerWidth);
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  const w = width ?? breakpointPx.lg + 1;

  return {
    width,
    isMobile: w <= breakpointPx.md,
    isTablet: w > breakpointPx.md && w <= breakpointPx.lg,
    isDesktop: w > breakpointPx.lg,
  };
}
