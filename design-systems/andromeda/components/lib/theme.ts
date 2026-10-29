'use client';

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export type ColorSpec = Record<string, readonly [name: string, fallback: string]>;

type Resolved<T extends ColorSpec> = { [K in keyof T]: string };

function fallbacks<T extends ColorSpec>(spec: T): Resolved<T> {
  const out = {} as Resolved<T>;
  for (const key in spec) out[key] = spec[key][1];
  return out;
}

function read<T extends ColorSpec>(el: Element, spec: T): Resolved<T> {
  const cs = getComputedStyle(el);
  const out = {} as Resolved<T>;
  for (const key in spec) {
    out[key] = cs.getPropertyValue(spec[key][0]).trim() || spec[key][1];
  }
  return out;
}

// Only <html> is watched; a theme changed on an inner element is not observed.
// Watch class and style: a theme's class can land before its --andromeda-theme-* vars.
export function subscribeToTheme(onChange: () => void) {
  if (typeof MutationObserver === 'undefined') return () => {};
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
  return () => mo.disconnect();
}

// Starts on the dark fallbacks so server and client HTML match; resolves after mount.
export function useResolvedColors<T extends ColorSpec>(
  ref: RefObject<Element | null>,
  spec: T,
): Resolved<T> {
  const [colors, setColors] = useState<Resolved<T>>(() => fallbacks(spec));
  // spec may be a new object each render; the ref keeps it out of the effect deps.
  const specRef = useRef(spec);
  specRef.current = spec;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      const next = read(el, specRef.current);
      setColors((prev) => {
        for (const key in next) if (prev[key] !== next[key]) return next;
        return prev;
      });
    };
    sync();
    return subscribeToTheme(sync);
  }, [ref]);

  return colors;
}
