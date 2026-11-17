// @vitest-environment jsdom
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { IconsOverview } from './IconsOverview'
import { allIconsInstall, MASKED_INSTALL_TOKEN } from '../_lib/constants'
import { ICON_STYLES } from '../_lib/icon-utils'

const state = vi.hoisted(() => ({
  blocked: vi.fn(() => false),
  masked: false,
  token: 'aic_test' as string | null,
  copy: vi.fn(async () => true),
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('@/app/components/ThemeProvider', () => ({ useTheme: () => ({ theme: 'light' }) }))
vi.mock('@/app/components/PageCrumbs', () => ({ PageCrumbs: () => null, useTopBarLeft: () => {} }))
vi.mock('@/app/components/CopyPage', () => ({ CopyPage: () => null }))
vi.mock('@/app/components/RailFooter', () => ({ RailFooter: () => null }))
vi.mock('@/app/_components/DesignSystemPage', () => ({
  PAGE_TOP: '',
  PageFrame: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))
vi.mock('@/app/components/useCopied', () => ({ copyText: state.copy }))
vi.mock('@/app/_lib/useInstallToken', () => ({ useInstallToken: () => state.token }))
vi.mock('./useInstallGate', () => ({ useInstallGate: () => state }))
vi.mock('./useIconVariant', () => ({ useIconVariant: () => ({ data: {}, loading: false }) }))
vi.mock('../_lib/categories', async (importOriginal) => ({
  ...await importOriginal<typeof import('../_lib/categories')>(),
  ICON_COUNT: 820,
}))

afterEach(() => {
  cleanup()
  localStorage.clear()
  state.blocked.mockReset().mockReturnValue(false)
  state.copy.mockClear()
  state.masked = false
  state.token = 'aic_test'
})

describe('overview bulk install', () => {
  it('follows the picker and copies each full set, including from a category page', async () => {
    render(<IconsOverview icons={[]} lineIcons={{}} loadFullLine={false} category="interface" />)
    for (const style of ICON_STYLES) {
      fireEvent.click(screen.getByRole('radio', { name: `${style.label}, ${style.tier}` }))
      const button = screen.getByRole('button', { name: `Copy the install command for every ${style.label} icon` })
      expect(button.textContent).toContain(`${style.label} · 820 icons`)
      expect(button.title).toBe(allIconsInstall(style.id, MASKED_INSTALL_TOKEN))
      expect(button.textContent).not.toContain(state.token)
      fireEvent.click(button)
      await waitFor(() => expect(state.copy).toHaveBeenLastCalledWith(allIconsInstall(style.id, state.token)))
    }
    expect(screen.getByText('Size, weight and colour apply to SVG downloads. In code, set them on each icon.')).toBeTruthy()
  })

  it('shows a masked token and does not copy when the install gate blocks', () => {
    state.masked = true
    state.token = null
    state.blocked.mockReturnValue(true)
    render(<IconsOverview icons={[]} lineIcons={{}} loadFullLine={false} />)
    fireEvent.click(screen.getByRole('radio', { name: 'Solid, Premium' }))
    const button = screen.getByRole('button', { name: 'Copy the install command for every Solid icon' })
    expect(button.title).toBe(allIconsInstall('solid', MASKED_INSTALL_TOKEN))
    fireEvent.click(button)
    expect(state.blocked).toHaveBeenCalledOnce()
    expect(state.copy).not.toHaveBeenCalled()
  })
})
