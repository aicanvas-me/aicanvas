'use client'

// The two Pro files of the image pack. A resolved non-premium visitor gets the
// paywall; premium (and the in-flight unknown window) downloads, and a 402 from
// the route still falls back to the paywall, so the server stays the gate.
import { useState } from 'react'
import { DownloadSimple, LockSimple } from '@phosphor-icons/react'
import { usePaywallModal } from '../../../components/billing/PaywallModalProvider'
import { usePremiumStatus } from '../../../components/billing/usePremiumStatus'
import { buttonClasses } from '../../../components/buttonClasses'
import { IMAGE_PACK_PRO_FILES, type ImagePackProFile } from '../../../_lib/andromeda-pro/image-pack'
import { SystemTierChip } from '../../../_components/SystemTierChip'

export function ImagePackProFiles() {
  const { open: openPaywall } = usePaywallModal()
  const status = usePremiumStatus()
  const [failed, setFailed] = useState<ImagePackProFile | null>(null)

  async function download(file: ImagePackProFile, name: string) {
    setFailed(null)
    if (status === 'not-premium') {
      openPaywall({ reason: 'premium-only' })
      return
    }
    try {
      const res = await fetch(`/api/andromeda-pro/image-pack/${file}`)
      if (res.status === 402) {
        openPaywall({ reason: 'premium-only' })
        return
      }
      if (!res.ok) throw new Error(String(res.status))
      const url = URL.createObjectURL(await res.blob())
      const link = document.createElement('a')
      link.href = url
      link.download = name
      link.click()
      // Revoking in the same tick can cancel the save in some browsers.
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch {
      setFailed(file)
    }
  }

  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {IMAGE_PACK_PRO_FILES.map((f) => (
        <div
          key={f.file}
          className="flex flex-col rounded-2xl border border-sand-300 bg-sand-100 p-4 dark:border-sand-800 dark:bg-sand-900"
        >
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-sand-900 dark:text-sand-50">{f.name}</h3>
            <SystemTierChip tier="pro" />
          </div>
          <p className="mt-1.5 flex-1 text-xs leading-relaxed text-sand-600 dark:text-sand-400">{f.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => download(f.file, f.name)}
              className={buttonClasses({ variant: 'outline', size: 'sm' })}
            >
              {status === 'not-premium' ? (
                <LockSimple weight="regular" size={14} />
              ) : (
                <DownloadSimple weight="regular" size={14} />
              )}
              {status === 'not-premium' ? 'Unlock with Pro' : 'Download'}
            </button>
            {/* Always mounted, so a screen reader announces the text change. */}
            <span role="status" className="text-xs text-sand-600 dark:text-sand-400">
              {failed === f.file ? 'Download failed. Try again.' : ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
