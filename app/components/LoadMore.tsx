'use client'

import { ArrowDown } from '@phosphor-icons/react'
import { Button } from './Button'

// ─── Constants ───────────────────────────────────────────────────────────────

export const INITIAL_LOAD = 48
export const LOAD_MORE_SIZE = 24

// ─── LoadMore ────────────────────────────────────────────────────────────────

interface LoadMoreProps {
  hasMore: boolean
  remaining: number
  onLoadMore: () => void
}

export function LoadMore({ hasMore, remaining, onLoadMore }: LoadMoreProps) {
  if (!hasMore) return null

  return (
    <div className="flex flex-col items-center gap-2 pt-10 pb-2">
      <Button variant="outline" size="lg" onClick={onLoadMore}>
        <ArrowDown weight="regular" size={15} />
        Load more
      </Button>
      <span className="text-xs text-sand-600 dark:text-sand-600">
        {remaining} more component{remaining !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
