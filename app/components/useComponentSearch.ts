'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * The component-grid search box, shared by the desktop rail and the mobile
 * drawer. Local state is the source of truth while typing; the URL is written
 * on a debounce so fast keystrokes cannot fight themselves.
 */
export function useComponentSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''
  const [searchValue, setSearchValue] = useState(urlQuery)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [, startTransition] = useTransition()

  // Tracks the last value pushed into the URL. When urlQuery matches, the
  // change came from here, so local state stays. When it doesn't match,
  // it's an external change (back/forward, category click): sync.
  const lastPushed = useRef(urlQuery)

  useEffect(() => {
    // Never overwrite while the user is actively editing. Fast typing can put
    // two debounced pushes in flight; if the older Transition commits after
    // lastPushed advances to the newer value, a naive check would misread it
    // as external and clobber the input ("last letter disappears, then
    // reappears"). While focused, the input is the source of truth, any URL
    // change is either our own push landing or will be reconciled on blur.
    if (document.activeElement === searchInputRef.current) return
    if (urlQuery === lastPushed.current) return
    setSearchValue(urlQuery)
    lastPushed.current = urlQuery
  }, [urlQuery])

  // Debounced write: local searchValue → URL.
  useEffect(() => {
    if (searchValue === urlQuery) return
    const timer = setTimeout(() => {
      lastPushed.current = searchValue
      const params = new URLSearchParams(searchParams.toString())
      if (searchValue) params.set('q', searchValue)
      else params.delete('q')
      const qs = params.toString()
      startTransition(() => {
        router.replace(qs ? `/components?${qs}` : '/components', { scroll: false })
      })
    }, 150)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  const clearSearch = () => {
    setSearchValue('')
    searchInputRef.current?.focus()
  }

  return { searchValue, setSearchValue, searchInputRef, clearSearch }
}
