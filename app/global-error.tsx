'use client'

import { useEffect } from 'react'
import { Manrope } from 'next/font/google'
import './globals.css'
import { Button } from './components/Button'

const manrope = Manrope({ variable: '--font-manrope', subsets: ['latin'], weight: ['400', '600', '700'] })

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    reportError(error)
  }, [error])

  return (
    <html lang="en" className={`${manrope.variable} dark h-full antialiased`}>
      <body className="h-full">
        <title>Something went wrong</title>
        <main className="flex min-h-full flex-col items-center justify-center bg-sand-50 px-6 py-20 text-center dark:bg-sand-950">
          <h1 className="text-2xl font-bold text-sand-900 dark:text-sand-50">Something went wrong</h1>
          <p className="mt-2 text-sm text-sand-700 dark:text-sand-300">Reload the page to try again.</p>
          <Button variant="primary" size="md" className="mt-6" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </main>
      </body>
    </html>
  )
}
