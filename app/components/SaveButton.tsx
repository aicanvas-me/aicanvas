'use client'

import { Heart } from '@phosphor-icons/react'
import { usePathname } from 'next/navigation'
import { useSession } from './auth/SessionProvider'
import { useAuthModal } from './auth/AuthModalProvider'
import { Button } from './Button'

// ─── SaveButton ───────────────────────────────────────────────────────────────
// Heart toggle for saving a component. Renders as a 32×32 icon-only Button
// from the unified system (size="sm") so it aligns with the sm label buttons
// it sits next to in the component action bar. Saved-state styling (olive
// heart) is layered on top via className.
//
// Always rendered, even signed out — clicking it while signed out opens the
// same soft-gate modal the account-gated Copy CLI uses (mirrors that
// aesthetic with save-specific copy) instead of hiding the affordance.

type SaveButtonProps = {
  slug: string
  system?: string | null
  className?: string
  size?: number
}

export function SaveButton({ slug, system = null, className = '', size = 15 }: SaveButtonProps) {
  const { user, savedSlugs, toggleSaved } = useSession()
  const { open: openAuthModal } = useAuthModal()
  const pathname = usePathname()

  const saved = !!user && savedSlugs.has(slug)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      openAuthModal({
        mode: 'gate',
        next: pathname ?? '/',
        title: 'Save this component.',
        subtitle: 'Sign in or create an account to save it and build your own collection of components.',
      })
      return
    }
    void toggleSaved(slug, system)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      iconOnly
      onClick={handleClick}
      aria-label={saved ? 'Unsave component' : 'Save component'}
      aria-pressed={saved}
      className={`${saved ? 'text-olive-500 dark:text-olive-400' : ''} ${className}`.trim()}
    >
      <Heart weight={saved ? 'fill' : 'regular'} size={size} />
    </Button>
  )
}
