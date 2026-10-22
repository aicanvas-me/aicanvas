'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../components/Button'

// A plain HTML form POST, so it works before hydration and survives a deploy
// between page load and click. The only script is the double-submit guard: a
// second POST would abort the first navigation (whose response carries the new
// session) and land on "link already used" instead.

type Props = {
  tokenHash: string
  type: string
  next: string
}

export function ContinueForm({ tokenHash, type, next }: Props) {
  const sent = useRef(false)
  const [submitting, setSubmitting] = useState(false)

  // Back button restores this page from the back-forward cache with the
  // button still disabled; re-arm it so the page is never a dead end.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return
      sent.current = false
      setSubmitting(false)
    }
    window.addEventListener('pageshow', onShow)
    return () => window.removeEventListener('pageshow', onShow)
  }, [])

  return (
    <form
      method="post"
      action="/account/auth/confirm"
      className="mt-6"
      onSubmit={(e) => {
        if (sent.current) {
          e.preventDefault()
          return
        }
        sent.current = true
        setSubmitting(true)
      }}
    >
      <input type="hidden" name="token_hash" value={tokenHash} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="next" value={next} />
      <Button type="submit" variant="primary" size="md" fullWidth disabled={submitting} autoFocus>
        {submitting ? 'Continuing…' : 'Continue'}
      </Button>
    </form>
  )
}
