// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { isPreview } from '../_lib/preview'
import type { IconStyle } from '../_lib/types'
import { useIconVariant } from './useIconVariant'

const LINE = { search: '<path d="line" />' }

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('useIconVariant', () => {
  it('holds a preview, never Line, until a paid style has loaded', async () => {
    let answer: (response: Response) => void = () => {}
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => { answer = resolve })))
    const { result } = renderHook(() => useIconVariant(LINE, 'duotone'))
    expect(isPreview(result.current.data.search)).toBe(true)
    expect(result.current.ready).toBe(false)

    answer(new Response(JSON.stringify({ search: '<path d="duotone" />' })))
    await waitFor(() => expect(result.current.ready).toBe(true))
    expect(result.current.data.search).toBe('<path d="duotone" />')
  })

  it('keeps a failed style unexportable, and retries it after a style change', async () => {
    const fetchIcons = vi.fn().mockRejectedValue(new Error('offline'))
    vi.stubGlobal('fetch', fetchIcons)
    const { result, rerender } = renderHook(({ style }) => useIconVariant(LINE, style), {
      initialProps: { style: 'solid' as IconStyle },
    })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.ready).toBe(false)
    expect(isPreview(result.current.data.search)).toBe(true)
    expect(fetchIcons).toHaveBeenCalledTimes(1)

    rerender({ style: 'line' })
    rerender({ style: 'solid' })
    await waitFor(() => expect(fetchIcons).toHaveBeenCalledTimes(2))
  })
})
