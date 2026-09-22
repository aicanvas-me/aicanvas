// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { SignUpFormFields } from './SignUpFormFields'

const signUp = vi.fn()
vi.mock('../../lib/supabase/client', () => ({
  createClient: () => ({ auth: { signUp } }),
}))
// The wording of a Supabase error is not under test; pass it straight through.
vi.mock('../../lib/auth-errors', () => ({ formatAuthError: (e: { message: string }) => e.message }))
vi.mock('../../lib/analytics', () => ({ track: () => {} }))
vi.mock('./NerdToHero', () => ({ NerdToHero: () => null }))
vi.mock('../../account/GoogleSignInButton', () => ({ GoogleSignInButton: () => null }))
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))

const email = () => screen.getByLabelText('Email') as HTMLInputElement
const password = () => screen.getByLabelText('Password') as HTMLInputElement

async function submitAndFail(message: string) {
  signUp.mockResolvedValue({ data: {}, error: { message } })
  fireEvent.change(email(), { target: { value: 'taken@example.com' } })
  fireEvent.change(password(), { target: { value: 'long-enough-1' } })
  fireEvent.submit(email().closest('form')!)
  await waitFor(() => expect(screen.getByText(message)).toBeTruthy())
}

beforeEach(() => {
  cleanup()
  signUp.mockReset()
  render(<SignUpFormFields next="/" />)
})

describe('SignUpFormFields', () => {
  it('clears a sign-up error when the email is edited', async () => {
    await submitAndFail('User already registered')
    fireEvent.change(email(), { target: { value: 'other@example.com' } })
    expect(screen.queryByText('User already registered')).toBeNull()
  })

  it('clears a sign-up error when the password is edited', async () => {
    await submitAndFail('Password should be at least 8 characters')
    fireEvent.change(password(), { target: { value: 'long-enough-12' } })
    expect(screen.queryByText('Password should be at least 8 characters')).toBeNull()
  })
})
