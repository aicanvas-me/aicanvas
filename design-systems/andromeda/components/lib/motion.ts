'use client';

import { useReducedMotion as fmUseReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { tokens } from '../../tokens';

// Returns seconds: Framer Motion takes seconds, tokens store ms.
const toSeconds = (msString: string) => parseInt(msString, 10) / 1000;

export const useReducedMotion = fmUseReducedMotion;

// Mirrors tokens.motion.easing.out; change both.
const EASE_OUT: [number, number, number, number] = [0, 0, 0.2, 1];

export function useCascadeProps(index = 0, opts?: { distance?: number }) {
  const distance = opts?.distance ?? 8;
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return { initial: false };
  }

  return {
    initial: { opacity: 0, y: distance },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: toSeconds(tokens.motion.duration.cascade),
      ease: EASE_OUT,
      delay: index * toSeconds(tokens.motion.stagger.cascade),
    },
  };
}

export const cascadeContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: toSeconds(tokens.motion.stagger.cascade),
    },
  },
};

export const cascadeItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: toSeconds(tokens.motion.duration.cascade),
      ease: EASE_OUT,
    },
  },
};

export const rowContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: toSeconds(tokens.motion.stagger.row),
    },
  },
};

// Opacity only: a transform on <motion.tr> can flash a scrollbar in overflow-x containers.
export const rowItem: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: toSeconds(tokens.motion.duration.row),
      ease: EASE_OUT,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: toSeconds(tokens.motion.duration.normal),
      // Mirrors tokens.motion.easing.in; change both.
      ease: [0.4, 0, 1, 1] as [number, number, number, number],
    },
  },
};

// Returns ms for setTimeout, unlike the seconds the variants above use.
export function useStaggeredDelay(index: number, paddingMs = 0) {
  const staggerMs = parseInt(tokens.motion.stagger.cascade, 10);
  const cascadeMs = parseInt(tokens.motion.duration.cascade, 10);
  return index * staggerMs + cascadeMs + paddingMs;
}
