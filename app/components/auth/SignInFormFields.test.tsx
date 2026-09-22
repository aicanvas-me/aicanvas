// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { SignInFormFields } from './SignInFormFields'

// The form's job here is what it shows, what it tells the user and when it
// stops telling them. Everything behind it (Supabase, the intro animation, the
// Google button, next/link) is replaced with the smallest stand-in that renders.
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
const passwordIfAny = () => screen.queryByLabelText('Password')
const button = (name: string) => screen.getByRole('button', { name })
const buttonIfAny = (name: string) => screen.queryByRole('button', { name })
const form = () => email().closest('form')!
const alertText = () => screen.queryByRole('alert')?.textContent ?? null

beforeEach(() => {
  cleanup()
  signInWithPassword.mockReset()
  signInWithOtp.mockReset()
})

describe('SignInFormFields, link mode', () => {
  it('shows only the email field once "Email me a sign-in link" is pressed', () => {
    mount()
    expect(passwordIfAny()).not.toBeNull()
    fireEvent.click(button('Email me a sign-in link'))

    expect(passwordIfAny()).toBeNull()
    expect(screen.queryByText('Forgot password?')).toBeNull()
    expect(button('Send sign-in link')).toBeTruthy()
    expect(button('Use a password instead')).toBeTruthy()
    expect(buttonIfAny('Sign in')).toBeNull()
    expect(document.activeElement).toBe(email())
    expect(alertText()).toBeNull()
  })

  it('carries the email typed so far across the switch, both ways', () => {
    mount()
    fireEvent.change(email(), { target: { value: 'a@b.co' } })
    fireEvent.click(button('Email me a sign-in link'))
    expect(email().value).toBe('a@b.co')

    fireEvent.click(button('Use a password instead'))
    expect(email().value).toBe('a@b.co')
    expect(passwordIfAny()).not.toBeNull()
    expect(button('Sign in')).toBeTruthy()
  })

  it('sends the link on submit and never touches the password sign-in', async () => {
    signInWithOtp.mockResolvedValue({ error: null })
    mount()
    fireEvent.click(button('Email me a sign-in link'))
    fireEvent.change(email(), { target: { value: 'a@b.co' } })
    fireEvent.submit(form())

    expect(signInWithOtp).toHaveBeenCalledTimes(1)
    expect(signInWithOtp.mock.calls[0][0]).toMatchObject({ email: 'a@b.co' })
    expect(signInWithPassword).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.getByText(/check your inbox/i)).toBeTruthy())
  })

  it('asks for the email on an empty submit, announces it, and clears it on typing', () => {
    mount()
    fireEvent.click(button('Email me a sign-in link'))
    fireEvent.submit(form())
    expect(alertText()).toBe('Enter your email to get a sign-in link.')
    expect(document.activeElement).toBe(email())
    expect(signInWithOtp).not.toHaveBeenCalled()

    fireEvent.change(email(), { target: { value: 'a@b.co' } })
    expect(alertText()).toBeNull()
  })

  it('drops a stale message when the mode is switched', () => {
    mount()
    fireEvent.change(email(), { target: { value: 'a@b.co' } })
    fireEvent.submit(form())
    expect(alertText()).toBe('Enter your password, or use "Email me a sign-in link" below.')

    fireEvent.click(button('Email me a sign-in link'))
    expect(alertText()).toBeNull()
  })
})

describe('SignInFormFields, password mode', () => {
  it('does not mark the password as required, so Enter cannot demand it natively', () => {
    mount()
    expect(password().required).toBe(false)
    expect(email().required).toBe(true)
    expect((button('Email me a sign-in link') as HTMLButtonElement).type).toBe('button')
  })

  it('answers an empty-password submit with its own message and clears it on typing', () => {
    mount()
    fireEvent.change(email(), { target: { value: 'a@b.co' } })
    fireEvent.submit(form())
    expect(alertText()).toBe('Enter your password, or use "Email me a sign-in link" below.')
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
    fireEvent.submit(form())
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
    expect(signInWithPassword).toHaveBeenCalledWith({ email: 'a@b.co', password: 'hunter22' })
    expect(signInWithOtp).not.toHaveBeenCalled()
    expect(alertText()).toBeNull()
  })

  it('clears a pre-seeded callback error the moment the user edits a field', () => {
    render(<SignInFormFields next="/" onSuccess={() => {}} initialError="That link has expired." />)
    expect(screen.getByText('That link has expired.')).toBeTruthy()
    fireEvent.change(email(), { target: { value: 'a' } })
    expect(screen.queryByText('That link has expired.')).toBeNull()
  })
})
