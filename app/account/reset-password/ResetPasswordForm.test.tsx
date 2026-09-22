// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { ResetPasswordForm } from './ResetPasswordForm'

const updateUser = vi.fn()
vi.mock('../../lib/supabase/client', () => ({
  createClient: () => ({ auth: { updateUser } }),
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))
vi.mock('../AuthPagePopup', () => ({ AuthPagePopup: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }))
// The icon barrel is thousands of modules the form never needs in a test.
vi.mock('@phosphor-icons/react', () => ({ Eye: () => null, EyeSlash: () => null }))

const password = () => screen.getByLabelText('New password') as HTMLInputElement
const confirm = () => screen.getByLabelText('Confirm new password') as HTMLInputElement
const submit = () => fireEvent.submit(password().closest('form')!)

beforeEach(() => {
  cleanup()
  updateUser.mockReset()
  render(<ResetPasswordForm hasRecoveryMarker />)
})

describe('ResetPasswordForm', () => {
  it('drops "Passwords don\'t match." the moment the user edits either field', () => {
    fireEvent.change(password(), { target: { value: 'correct-horse' } })
    fireEvent.change(confirm(), { target: { value: 'correct-hors' } })
    submit()
    expect(screen.getByRole('alert').textContent).toBe("Passwords don't match.")
    expect(updateUser).not.toHaveBeenCalled()

    fireEvent.change(confirm(), { target: { value: 'correct-horse' } })
    expect(screen.queryByText("Passwords don't match.")).toBeNull()
  })

  it('drops the length message once the user keeps typing', () => {
    fireEvent.change(password(), { target: { value: 'short' } })
    fireEvent.change(confirm(), { target: { value: 'short' } })
    submit()
    expect(screen.getByText('Use at least 8 characters.')).toBeTruthy()

    fireEvent.change(password(), { target: { value: 'shorter-no-more' } })
    expect(screen.queryByText('Use at least 8 characters.')).toBeNull()
  })
})
