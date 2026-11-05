'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bug } from '@/app/_icons/icons/bug'
import { MessageCircleText } from '@/app/_icons/icons/message-circle-text'
import { CircleCheck } from '@/app/_icons/icons/circle-check'
import { CreditCard } from '@/app/_icons/icons/credit-card'
import { CircleEllipsis } from '@/app/_icons/icons/circle-ellipsis'
import { Lightbulb } from '@/app/_icons/icons/lightbulb'
import { Button } from '../components/Button'
import { buttonClasses } from '../components/buttonClasses'
import { CARD, EYEBROW, PageHero, PageShell } from '../components/PageKit'

// ─── /feedback ────────────────────────────────────────────────────────────────
// The category-first feedback form. Sibling of /contact, deliberately a separate
// page with a different job:
//
//   /contact   "I need a human to answer me"  → email required, reply expected
//   /feedback  "here is one thing to improve" → email OPTIONAL, no reply promised
//
// Making email optional is the whole point. It is the single biggest lever on
// completion for feedback (vs contact), because leaving an address reads as a
// commitment to a conversation the person may not want.
//
// Posts to /api/feedback, which prefixes the email subject with the category
// ([Bug], [Billing], …) so Gmail filters do the triage. There is no database:
// the inbox IS the backlog until it stops being readable.
//
// Deep links preset the form: /feedback?type=bug&from=scroll-wipe-gallery
//
// Layout: the shared page shell (homepage column, footer, wordmark) with the
// hero centred over one form card, kept in step with /contact.

// Inputs sit one step lighter than the card in light and one step darker in
// dark, so a field reads as a well in the surface in both themes. The focus
// border is the accent, which stays dark enough on sand-50 to mark focus on
// its own.
const INPUT_CLASS =
  'block w-full rounded-control border border-sand-300 bg-sand-50 px-4 py-2.5 text-base text-sand-900 outline-none transition-[border-color,box-shadow] placeholder:text-sand-600 hover:border-sand-400 focus:border-accent focus:ring-4 focus:ring-accent/15 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-50 dark:placeholder:text-sand-500 dark:hover:border-sand-700 dark:focus:ring-accent/20 md:text-sm'
const LABEL_CLASS = `mb-2 block ${EYEBROW}`
// The form card: the v3 surface, centred under the hero, rising in on the
// hero's stagger so the page arrives as one sequence.
const CARD_CLASS = `aic-hero-rise relative mx-auto mt-12 w-full max-w-2xl overflow-hidden sm:mt-14 ${CARD}`

// A thin accent light on the card's top edge, the same mark the "Still have a
// question?" card carries on the pages that link to /contact.
function CardLight() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px w-40 bg-gradient-to-r from-transparent via-accent to-transparent"
    />
  )
}

type CategoryId = 'general' | 'bug' | 'billing' | 'other'

const CATEGORIES: { id: CategoryId; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: 'General feedback', icon: <MessageCircleText size={18} /> },
  { id: 'bug', label: 'Found a bug', icon: <Bug size={18} /> },
  { id: 'billing', label: 'Payment or subscription', icon: <CreditCard size={18} /> },
  { id: 'other', label: 'Something else', icon: <CircleEllipsis size={18} /> },
]

// Rating rail, red → amber → success green. Same visual language as the mood-tracker
// standalone (colored rail, white puck with an accent ring) but built on a
// native range input, so drag, touch, arrow keys, Home/End and the screen-reader
// slider semantics all come from the platform instead of pointer handlers.
const RAIL = 'linear-gradient(90deg, #B4553A 0%, #C08A3E 35%, #C8B44A 65%, var(--color-success) 100%)'

// The ring takes the rail's own color at the current stop, so the puck reads as
// picking up whatever it is sitting on. Eleven fixed samples of RAIL rather than
// a gradient interpolator: there are exactly eleven positions, so a lookup is
// both shorter and exact. Regenerate this alongside any change to RAIL.
const RING = [
  '#B4553A', '#B7643B', '#BB733C', '#BE823D', '#C19140', '#C49F44',
  '#C7AD48', '#C3B54A', '#BAB64B', '#B1B84C', 'var(--color-success)',
]

// Dark core + colored ring, so the puck reads as a hole punched in the rail rather
// than a light dot floating over a dark page. The shadow is two layers: a tight
// contact shadow that seats it on the rail, plus a wider soft one that lifts it.
//
// Every class below must stay a COMPLETE literal string. Tailwind scans source
// text for finished class names, so composing one with a template literal
// (shadow-[${VAR}]) silently generates no CSS at all.
// The ring color arrives as --thumb-ring, set inline on the input: custom
// properties inherit into pseudo-elements, which is the only way to drive a
// ::-webkit-slider-thumb from React state.
const THUMB = [
  '[&::-webkit-slider-thumb]:h-6',
  '[&::-webkit-slider-thumb]:w-6',
  '[&::-webkit-slider-thumb]:appearance-none',
  '[&::-webkit-slider-thumb]:rounded-full',
  '[&::-webkit-slider-thumb]:border-4',
  '[&::-webkit-slider-thumb]:border-[color:var(--thumb-ring)]',
  '[&::-webkit-slider-thumb]:bg-sand-950',
  '[&::-webkit-slider-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.9),0_8px_18px_rgba(0,0,0,0.75)]',
  '[&::-moz-range-thumb]:h-6',
  '[&::-moz-range-thumb]:w-6',
  '[&::-moz-range-thumb]:rounded-full',
  '[&::-moz-range-thumb]:border-4',
  '[&::-moz-range-thumb]:border-[color:var(--thumb-ring)]',
  '[&::-moz-range-thumb]:bg-sand-950',
  '[&::-moz-range-thumb]:shadow-[0_2px_4px_rgba(0,0,0,0.9),0_8px_18px_rgba(0,0,0,0.75)]',
].join(' ')

// Selectable chip. Wraps a visually hidden native radio so keyboard support,
// arrow-key roving and form semantics come free instead of being reimplemented
// with role="radio" and a keydown handler.
//
// Layout utilities (gap, padding, direction) stay at the call site: the two chip
// rows want different ones, and this repo has no twMerge helper, so overlapping
// utilities in one string would resolve by CSS order rather than by intent.
//
// Unselected chips share the inputs' well colour so the whole form reads as one
// set of fields; the selected one takes the accent hairline and an accent icon.
const CHIP_BASE =
  'flex cursor-pointer items-center rounded-control border px-4 text-sm font-semibold transition-colors has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-accent/20'

function chipTone(selected: boolean): string {
  return selected
    ? 'border-accent bg-accent/10 text-sand-900 dark:text-sand-50'
    : 'border-sand-300 bg-sand-50 text-sand-700 hover:border-sand-400 hover:text-sand-900 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-300 dark:hover:border-sand-700 dark:hover:text-sand-100'
}

export default function FeedbackPage() {
  const [category, setCategory] = useState<CategoryId>('general')
  // The rating is optional, but a range input always holds a value. `rated`
  // tracks whether it was actually touched, so an untouched slider sends
  // nothing instead of silently reporting a 5.
  const [score, setScore] = useState(5)
  const [rated, setRated] = useState(false)
  const [message, setMessage] = useState('')
  const [where, setWhere] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot — must stay empty
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Deep-link presets, read from window rather than useSearchParams so the page
  // needs no Suspense boundary and keeps static rendering.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const type = params.get('type')
    if (type && CATEGORIES.some((c) => c.id === type)) setCategory(type as CategoryId)
    const from = params.get('from')
    if (from) setWhere(from.slice(0, 200))
  }, [])

  // "How is it going" is tone-deaf to someone who was charged twice.
  const showScore = category !== 'billing'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          score: showScore && rated ? score : null,
          message,
          where,
          email,
          website,
          // Attached silently. Asking a person for their browser version is
          // friction and they get it wrong anyway.
          context: {
            referrer: document.referrer || '',
            viewport: `${window.innerWidth}x${window.innerHeight}`,
          },
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again.')
        return
      }
      setSent(true)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell>
      <PageHero
        pill="Shape what's next"
        pillIcon={<Lightbulb size={12} className="text-accent" aria-hidden />}
        title="Feedback"
        size="md"
        sub={
          // Balanced, so the centred lines break evenly instead of leaving
          // a short last line under the column.
          <span className="block text-balance">
            One thing we should fix, build, or stop doing. Pick a category and
            say it in a sentence. We read every one, and this is what decides
            what we work on next.
          </span>
        }
      />

      <div className="pb-12 sm:pb-20">
        {sent ? (
          <div
            className={`${CARD_CLASS} px-6 py-12 text-center sm:px-12 sm:py-14`}
            style={{ animationDelay: '0.05s' }}
          >
            <CardLight />
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-success/30 bg-success/10">
              <CircleCheck size={24} className="text-success" />
            </span>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-sand-900 dark:text-sand-50">Got it, thank you</h2>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-sand-700 dark:text-sand-300">
              We read every single one. If it needs an answer we&apos;ll
              write to <strong className="font-semibold text-sand-900 dark:text-sand-50">{email}</strong>.
            </p>
            <Link
              href="/components"
              className={`mt-8 ${buttonClasses({ variant: 'outline', size: 'lg' })}`}
            >
              Back to components
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className={`${CARD_CLASS} space-y-7 p-6 sm:p-10`}
            style={{ animationDelay: '0.42s' }}
          >
            <CardLight />

            {/* Honeypot: off-screen, hidden from humans and assistive tech. */}
            <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <fieldset>
              <legend className={LABEL_CLASS}>What&apos;s this about?</legend>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {CATEGORIES.map((c) => (
                  <label key={c.id} className={`${CHIP_BASE} gap-2.5 py-3 ${chipTone(category === c.id)}`}>
                    <input
                      type="radio"
                      name="category"
                      value={c.id}
                      checked={category === c.id}
                      onChange={() => setCategory(c.id)}
                      className="sr-only"
                    />
                    <span
                      className={`shrink-0 transition-colors ${category === c.id ? 'text-accent' : ''}`}
                    >
                      {c.icon}
                    </span>
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {showScore && (
              <div>
                <div className="flex items-baseline justify-between">
                  <label htmlFor="score" className={LABEL_CLASS}>
                    How has AI Canvas been so far?
                  </label>
                  <span
                    className={`text-xs font-semibold tabular-nums ${rated ? 'text-accent' : 'text-sand-600 dark:text-sand-500'}`}
                  >
                    {rated ? `${score} / 10` : 'optional'}
                  </span>
                </div>

                {/* Alignment rule: track height == thumb height == input
                    height (all h-6), then the input and the rail are each
                    centred on the box. WebKit aligns the thumb's TOP to the
                    track's top rather than centring it, so any track taller
                    than the thumb pushes the puck above the rail. Keeping the
                    three equal makes top-aligned and centred the same thing,
                    which is why there is no margin offset here to drift. */}
                <div className="relative mt-1 h-9 w-full rounded-full has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40">
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full transition-opacity ${rated ? 'opacity-100' : 'opacity-40'}`}
                    style={{ background: RAIL }}
                  />
                  <input
                    id="score"
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={score}
                    onChange={(e) => {
                      setScore(Number(e.target.value))
                      setRated(true)
                    }}
                    aria-valuetext={rated ? `${score} out of 10` : 'not rated'}
                    style={{ '--thumb-ring': RING[score] } as React.CSSProperties}
                    className={`absolute inset-x-0 top-1/2 m-0 h-6 w-full -translate-y-1/2 cursor-pointer appearance-none bg-transparent outline-none [&::-webkit-slider-runnable-track]:h-6 [&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:h-6 [&::-moz-range-track]:bg-transparent ${THUMB} ${rated ? '' : 'opacity-70'}`}
                  />
                </div>

                <div className="mt-1 flex justify-between text-xs text-sand-600 dark:text-sand-400">
                  <span>Rough</span>
                  <span>Great</span>
                </div>
              </div>
            )}

            {category === 'bug' && (
              <div>
                <label htmlFor="where" className={LABEL_CLASS}>
                  Where did it happen?
                </label>
                <input
                  id="where"
                  type="text"
                  maxLength={200}
                  placeholder="Component name or page URL"
                  value={where}
                  onChange={(e) => setWhere(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            )}

            <div>
              <label htmlFor="message" className={LABEL_CLASS}>
                {category === 'bug'
                  ? 'What happened, and what did you expect?'
                  : category === 'billing'
                    ? 'What went wrong?'
                    : 'Your feedback'}{' '}
                {/* Decorative: the required state itself comes from the input's
                    `required` attribute, which is what assistive tech reads. */}
                <span aria-hidden="true" className="text-accent">*</span>
              </label>
              <textarea
                id="message"
                required
                // No autoFocus: it would scroll the category chips out of view
                // on load and pop the mobile keyboard before the first choice.
                maxLength={5000}
                rows={6}
                placeholder={
                  category === 'bug'
                    ? 'I clicked the copy button and nothing happened. I expected the code on my clipboard.'
                    : 'Say it however you like. One sentence is plenty.'
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${INPUT_CLASS.replace('rounded-control', 'rounded-inset')} min-h-[160px] resize-y leading-relaxed`}
              />
            </div>

            <div>
              <label htmlFor="email" className={LABEL_CLASS}>
                {category === 'billing' ? 'Email used at checkout' : 'Email'}{' '}
                <span aria-hidden="true" className="text-accent">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                maxLength={200}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>

            {error && (
              <div role="alert" className="rounded-inset border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="space-y-4 pt-1">
              <Button type="submit" variant="primary" size="lg" fullWidth disabled={submitting}>
                {submitting ? 'Sending…' : 'Send feedback'}
              </Button>

              {/* The attached page/screen/browser details are spelled out in the
                  Feedback form section of /privacy rather than on the form, so
                  this link is the point-of-collection notice. Keep it. */}
              <div className="space-y-1.5 text-center">
                <p className="mx-auto max-w-md text-balance text-xs leading-relaxed text-sand-600 dark:text-sand-400">
                  Good or bad, we read and appreciate every message. Honest
                  feedback is what keeps pushing AI Canvas forward.
                </p>
                {/* Only true while the route uses the address for reply_to and
                    nothing else: no Brevo call, no list. If the form is ever
                    wired to the newsletter, this line has to change. */}
                <p className="text-xs leading-relaxed text-sand-600 dark:text-sand-400">
                  We only use your email to reply.{' '}
                  <Link href="/privacy" className="underline underline-offset-2 hover:text-sand-900 dark:hover:text-sand-200">
                    Privacy policy
                  </Link>
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </PageShell>
  )
}
