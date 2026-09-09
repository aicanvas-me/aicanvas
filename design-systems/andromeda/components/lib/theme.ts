// ============================================================
// THEME RESOLUTION (for sinks that cannot read a CSS var)
//
// Most of Andromeda follows the theme for free: colors ship as
// var(--andromeda-theme-*, <dark literal>) and the cascade does the
// rest (see themed / themeColor in ./utils).
//
// Three sinks never get that far, because var() is only substituted
// for CSS declarations:
//   - SVG presentation ATTRIBUTES (stroke=, fill=, stopColor=),
//     usually fixable by moving the color into `style` instead
//   - libraries that hand their props to those attributes (recharts)
//   - anything leaving CSS entirely: three.js, canvas 2d, framer
//     color animation
//
// Those need a concrete value, so they read the RESOLVED custom
// property off a live element and re-read it when the theme moves.
// ============================================================

'use client';

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

/** [custom property name, value to use before/without a resolved one]. */
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

/**
 * subscribeToTheme — run `onChange` whenever the page theme may have moved.
 *
 * Two attributes are watched on <html>, and both matter. A host app flips a
 * theme by changing a CLASS; the --andromeda-theme-* properties that class
 * drives land in the inline STYLE, possibly a tick later. Watching only the
 * class can therefore read the old palette back. Watching both means the
 * later of the two always gets the last word.
 *
 * A theme applied to some inner ancestor instead of <html> is not observed;
 * such a subtree resolves correctly on mount and re-resolves on the next
 * document-level change.
 *
 * @param {() => void} onChange
 * @returns {() => void} unsubscribe
 */
export function subscribeToTheme(onChange: () => void) {
  if (typeof MutationObserver === 'undefined') return () => {};
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
  return () => mo.disconnect();
}

/**
 * useResolvedColors — concrete color values for var()-incapable sinks.
 *
 * Renders the dark fallbacks on the server and on the first client paint
 * (so hydration matches), then resolves the real values from `ref` and
 * re-resolves on every theme change. On a dark page every resolved value
 * equals its fallback, so nothing re-renders and nothing moves.
 *
 * @param {RefObject<Element | null>} ref an element inside the themed subtree
 * @param {ColorSpec} spec key → [custom property, dark literal]
 * @returns {Record<string, string>} the same keys, resolved
 */
export function useResolvedColors<T extends ColorSpec>(
  ref: RefObject<Element | null>,
  spec: T,
): Resolved<T> {
  const [colors, setColors] = useState<Resolved<T>>(() => fallbacks(spec));
  // The spec is rebuilt every render (it holds token literals), so it is read
  // through a ref instead of being an effect dependency. Otherwise the
  // observer would be torn down and rebuilt on every render.
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
