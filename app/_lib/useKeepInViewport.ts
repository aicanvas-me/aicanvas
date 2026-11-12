'use client'

import { useLayoutEffect, useRef } from 'react'

// Slides an open dropdown sideways so it stays 12px inside the screen on a phone.
export function useKeepInViewport<T extends HTMLElement>(open: boolean) {
  const ref = useRef<T>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!open || !el) return
    const fit = () => {
      el.style.translate = ''
      const { left, right } = el.getBoundingClientRect()
      const max = document.documentElement.clientWidth - 12
      const shift = left < 12 ? 12 - left : right > max ? max - right : 0
      if (shift) el.style.translate = `${shift}px 0`
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [open])
  return ref
}
