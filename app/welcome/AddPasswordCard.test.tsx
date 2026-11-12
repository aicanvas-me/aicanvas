// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { AddPasswordCard } from './AddPasswordCard'

const updateUser = vi.fn()
vi.mock('../lib/supabase/client', () => ({
  createClient: () => ({ auth: { updateUser } }),
}))

beforeEach(() => {
  cleanup()
  updateUser.mockReset()
  updateUser.mockResolvedValue({ data: { user: {} }, error: null })
  render(<AddPasswordCard email="buyer@example.com" />)
})

const field = (label: string) => screen.getByLabelText(label) as HTMLInputElement

describe('AddPasswordCard', () => {
  it('saves exactly the password typed, and clears the hidden-password flag', async () => {
    fireEvent.change(field('Password'), { target: { value: 'Canvas-Test-2026' } })
    fireEvent.change(field('Confirm password'), { target: { value: 'Canvas-Test-2026' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save password' }))
    await waitFor(() => expect(updateUser).toHaveBeenCalledTimes(1))
    expect(updateUser).toHaveBeenCalledWith({ password: 'Canvas-Test-2026', data: { password_unknown: null } })
    expect((await screen.findByRole('status')).textContent).toContain('Password saved')
  })

  it('saves nothing when the two fields differ', () => {
    fireEvent.change(field('Password'), { target: { value: 'Canvas-Test-2026' } })
    fireEvent.change(field('Confirm password'), { target: { value: 'Canvas-Test-2027' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save password' }))
    expect(updateUser).not.toHaveBeenCalled()
    expect(screen.getByRole('alert').textContent).toBe("Passwords don't match.")
  })

  it('carries the email for password managers', () => {
    const user = document.querySelector('input[autocomplete="username"]') as HTMLInputElement
    expect(user.value).toBe('buyer@example.com')
  })
})
