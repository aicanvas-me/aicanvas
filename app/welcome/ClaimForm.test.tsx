// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { ClaimForm } from './ClaimForm'

const signInWithOtp = vi.fn()
vi.mock('../lib/supabase/client', () => ({
  createClient: () => ({ auth: { signInWithOtp } }),
}))

const email = () => screen.getByLabelText('Email you used at checkout') as HTMLInputElement

beforeEach(() => {
  cleanup()
  signInWithOtp.mockReset()
  render(<ClaimForm />)
})

describe('ClaimForm', () => {
  it('clears the rate-limit message when the user edits the email', async () => {
    // A 429 is the only error this form ever shows; anything else stays neutral.
    signInWithOtp.mockResolvedValue({ error: { status: 429, message: 'rate limit exceeded' } })
    fireEvent.change(email(), { target: { value: 'buyer@example.com' } })
    fireEvent.submit(email().closest('form')!)
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/too many requests/i))

    fireEvent.change(email(), { target: { value: 'buyer2@example.com' } })
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
