// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { ForgotPasswordForm } from './ForgotPasswordForm'

const resetPasswordForEmail = vi.fn()
vi.mock('../../lib/supabase/client', () => ({
  createClient: () => ({ auth: { resetPasswordForEmail } }),
}))
// The wording of a Supabase error is not under test; pass it straight through.
vi.mock('../../lib/auth-errors', () => ({ formatAuthError: (e: { message: string }) => e.message }))
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))
vi.mock('../AuthPagePopup', () => ({ AuthPagePopup: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }))

const email = () => screen.getByLabelText('Email') as HTMLInputElement

beforeEach(() => {
  cleanup()
  resetPasswordForEmail.mockReset()
  render(<ForgotPasswordForm />)
})

describe('ForgotPasswordForm', () => {
  it('clears a server error as soon as the user corrects the address', async () => {
    resetPasswordForEmail.mockResolvedValue({ error: { message: 'Unable to validate email address' } })
    fireEvent.change(email(), { target: { value: 'not-an-address' } })
    fireEvent.submit(email().closest('form')!)
    await waitFor(() => expect(screen.getByText('Unable to validate email address')).toBeTruthy())

    fireEvent.change(email(), { target: { value: 'me@example.com' } })
    expect(screen.queryByText('Unable to validate email address')).toBeNull()
  })
})
