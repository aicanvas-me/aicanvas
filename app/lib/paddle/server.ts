import 'server-only'

/**
 * Single source of truth for the server-side Paddle environment. Falls back
 * to the client flag so the two halves can never point at different Paddle
 * environments (server defaulting to production while the overlay ran in
 * sandbox made activation 403 silently). Defaults to sandbox — production is
 * an explicit opt-in.
 */
function paddleEnv(): 'sandbox' | 'production' {
  const v = process.env.PADDLE_ENV ?? process.env.NEXT_PUBLIC_PADDLE_ENV ?? 'sandbox'
  return v === 'production' ? 'production' : 'sandbox'
}

export function paddleApiBase(): string {
  return paddleEnv() === 'production'
    ? 'https://api.paddle.com'
    : 'https://sandbox-api.paddle.com'
}
