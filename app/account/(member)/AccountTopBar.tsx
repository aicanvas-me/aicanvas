'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from '@phosphor-icons/react'
import { HeaderSocials } from '../../components/HeaderSocials'

export function AccountTopBar() {
  const router = useRouter()
  return (
    <div className="sticky top-0 z-10 hidden h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-sand-200 bg-sand-50 px-6 dark:border-sand-800 dark:bg-sand-950 md:grid">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-sand-700 transition-colors hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-200"
      >
        <ArrowLeft weight="regular" size={15} />
        Back
      </button>
      <span className="text-sm font-semibold text-olive-500">/Account</span>
      <div className="flex justify-end">
        <HeaderSocials />
      </div>
    </div>
  )
}
