'use client'

import Link from 'next/link'
import { ArrowLeft } from '@/app/_icons/icons/arrow-left'

export function BackButton({ slug }: { slug: string }) {
  return (
    <Link
      href={`/components/${slug}`}
      className="absolute top-4 left-4 z-[100] flex items-center gap-1.5 rounded-control border border-sand-700 bg-sand-900/80 px-3 py-1.5 text-xs font-semibold text-sand-400 backdrop-blur-sm transition-colors hover:border-sand-600 hover:text-sand-200"
    >
      <ArrowLeft size={13} />
      Back
    </Link>
  )
}
