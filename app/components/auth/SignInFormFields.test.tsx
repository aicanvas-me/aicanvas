// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { SignInFormFields } from './SignInFormFields'

// The form's job here is what it tells the user and when it stops telling
// them. Everything behind it (Supabase, the intro animation, the Google
// button, next/link) is replaced with the smallest stand-in that renders.
const signInWithPassword = vi.fn()
const signInWithOtp = vi.fn()
vi.mock('../../lib/supabase/client', () => ({
  createClient: () => ({ auth: { signInWithPassword, signInWithOtp } }),
}))
vi.mock('./TerminatorReveal', () => ({ TerminatorReveal: () => null }))
vi.mock('../../account/GoogleSignInButton', () => ({ GoogleSignInButton: () => null }))
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}))
// The icon barrel is thousands of modules the form never needs in a test;
// stubbing it keeps the import graph small. PasswordInput itself still renders.
vi.mock('@phosphor-icons/react', () => ({ Eye: () => null, EyeSlash: () => null }))

function mount(onSuccess: () => void = () => {}) {
  return render(<SignInFormFields next="/" onSuccess={onSuccess} />)
}
const email = () => screen.getByLabelText('Email') as HTMLInputElement
const password = () => screen.getByLabelText('Password') as HTMLInputElement
const magicButton = () => screen.getByRole('button', { name: 'Email me a sign-in link' })
const alertText = () => screen.queryByText(/enter your (email|password)/i)

beforeEach(() => {
  cleanup()
  signInWithPassword.mockReset()
  signInWithOtp.mockReset()
})

describe('SignInFormFields', () => {
  it('clears the magic-link error as soon as the user types an email', () => {
    mount()
    fireEvent.click(magicButton())
    expect(alertText()?.textContent).toBe('Enter your email to get a sign-in link.')
    expect(document.activeElement).toBe(email())

    fireEvent.change(email(), { target: { value: 'a@b.co' } })
    expect(alertText()).toBeNull()
  })

  it('sends the link once an email is present, without touching the password', () => {
    signInWithOtp.mockResolvedValue({ error: null })
    mount()
    fireEvent.change(email(), { target: { value: 'a@b.co' } })
    fireEvent.click(magicButton())
    expect(signInWithOtp).toHaveBeenCalledTimes(1)
    expect(signInWithOtp.mock.calls[0][0]).toMatchObject({ email: 'a@b.co' })
    expect(signInWithPassword).not.toHaveBeenCalled()
  })

  it('does not mark the password as required, so Enter cannot demand it natively', () => {
    mount()
    expect(password().required).toBe(false)
    expect(email().required).toBe(true)
    expect((magicButton() as HTMLButtonElement).type).toBe('button')
  })

  it('answers an empty-password submit with its own message and clears it on typing', () => {
    mount()
    fireEvent.change(email(), { target: { value: 'a@b.co' } })
    fireEvent.submit(email().closest('form')!)
    expect(alertText()?.textContent).toBe('Enter your password, or use "Email me a sign-in link" below.')
    expect(document.activeElement).toBe(password())
    expect(signInWithPassword).not.toHaveBeenCalled()

    fireEvent.change(password(), { target: { value: 'hunter22' } })
    expect(alertText()).toBeNull()
  })

  it('still signs in normally when both fields are filled', async () => {
    signInWithPassword.mockResolvedValue({ error: null })
    const onSuccess = vi.fn()
    mount(onSuccess)
    fireEvent.change(email(), { target: { value: 'a@b.co' } })
    fireEvent.change(password(), { target: { value: 'hunter22' } })
    fireEvent.submit(email().closest('form')!)
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
    expect(signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.co', password: 'hunter22' })
    expect(alertText()).toBeNull()
  })

  it('announces the message to assistive tech', () => {
    mount()
    fireEvent.click(magicButton())
    expect(screen.getByRole('alert').textContent).toBe('Enter your email to get a sign-in link.')
  })

  it('clears a pre-seeded callback error the moment the user edits a field', () => {
    render(<SignInFormFields next="/" onSuccess={() => {}} initialError="That link has expired." />)
    expect(screen.getByText('That link has expired.')).toBeTruthy()
    fireEvent.change(email(), { target: { value: 'a' } })
    expect(screen.queryByText('That link has expired.')).toBeNull()
  })
})
