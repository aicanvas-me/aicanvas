// The docs page kit: one header, one body type ladder, the "On this page" list
// and the previous / next links, so every docs page reads the same. The shape
// follows ui.shadcn.com/docs: title, one-line description, page actions, then
// h2 sections that the right-hand list is built from.
//
// Server-safe: the interactive pieces (copy buttons, tabs, the nav) are their
// own client files.

import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Info } from '@phosphor-icons/react/dist/ssr'
import { SITE_URL } from '../../lib/config'
import { docPosition } from '../_lib/nav'
import { Toc, type TocItem } from './Toc'

export type { TocItem }

const LINK = 'font-semibold text-olive-600 underline-offset-4 hover:text-olive-800 hover:underline dark:text-olive-400 dark:hover:text-olive-300'

// "Open in Claude" and "Open in ChatGPT" are plain links with a prefilled
// prompt that points at this page, the way shadcn's docs do it: no API, the
// assistant reads the page itself.
function askLinks(href: string) {
  const prompt = `I'm reading this AI Canvas documentation: ${SITE_URL}${href}. Help me understand it and apply it to my project. Be ready to explain, give examples, or help debug based on it.`
  const q = encodeURIComponent(prompt)
  return [
    { label: 'Open in Claude', url: `https://claude.ai/new?q=${q}` },
    { label: 'Open in ChatGPT', url: `https://chatgpt.com/?q=${q}` },
  ]
}

export function DocPage({
  href,
  title,
  lead,
  toc,
  children,
}: {
  href: string
  title: string
  lead: ReactNode
  toc: TocItem[]
  children: ReactNode
}) {
  const { section, prev, next } = docPosition(href)
  return (
    <div className="flex gap-10">
      <article className="min-w-0 max-w-3xl flex-1">
        <header className="border-b border-sand-200 pb-8 dark:border-sand-800">
          {section && (
            <p className="text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">
              {section}
            </p>
          )}
          <h1 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-sand-900 sm:text-4xl dark:text-sand-50">
            {title}
          </h1>
          <p className="mt-3 text-pretty text-lg leading-relaxed text-sand-600 dark:text-sand-400">{lead}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {askLinks(href).map((a) => (
              <a
                key={a.label}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-control border border-sand-200 px-3 py-1.5 text-xs font-semibold text-sand-700 transition-colors hover:border-sand-300 hover:text-sand-900 dark:border-sand-800 dark:text-sand-300 dark:hover:border-sand-700 dark:hover:text-sand-50"
              >
                {a.label}
                <ArrowUpRight weight="regular" size={12} />
              </a>
            ))}
          </div>
        </header>

        <div className="pt-2">{children}</div>

        {(prev || next) && (
          <nav aria-label="Previous and next" className="mt-16 grid gap-3 border-t border-sand-200 pt-8 sm:grid-cols-2 dark:border-sand-800">
            {prev ? (
              <Link
                href={prev.href}
                className="group rounded-card border border-sand-200 p-4 transition-colors hover:border-sand-300 dark:border-sand-800 dark:hover:border-sand-700"
              >
                <span className="flex items-center gap-1.5 text-xs font-semibold text-sand-600 dark:text-sand-400">
                  <ArrowLeft weight="regular" size={12} />
                  Previous
                </span>
                <span className="mt-1 block font-semibold text-sand-900 dark:text-sand-50">{prev.title}</span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next && (
              <Link
                href={next.href}
                className="group rounded-card border border-sand-200 p-4 text-right transition-colors hover:border-sand-300 dark:border-sand-800 dark:hover:border-sand-700"
              >
                <span className="flex items-center justify-end gap-1.5 text-xs font-semibold text-sand-600 dark:text-sand-400">
                  Next
                  <ArrowRight weight="regular" size={12} />
                </span>
                <span className="mt-1 block font-semibold text-sand-900 dark:text-sand-50">{next.title}</span>
              </Link>
            )}
          </nav>
        )}
      </article>

      {toc.length > 0 && (
        <aside className="hidden w-52 shrink-0 xl:block">
          <div className="sticky top-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">On this page</p>
            <Toc items={toc} />
          </div>
        </aside>
      )}
    </div>
  )
}

// ── Body type ladder ─────────────────────────────────────────────────────────

export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mt-12 scroll-mt-6 text-2xl font-bold tracking-tight text-sand-900 dark:text-sand-50">
      <a href={`#${id}`} className="hover:underline hover:underline-offset-4">
        {children}
      </a>
    </h2>
  )
}

export function H3({ children }: { children: ReactNode }) {
  return <h3 className="mt-8 text-lg font-bold text-sand-900 dark:text-sand-50">{children}</h3>
}

export function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 leading-7 text-sand-700 dark:text-sand-300">{children}</p>
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-sand-700 marker:text-sand-400 dark:text-sand-300 dark:marker:text-sand-600">{children}</ul>
}

export function OL({ children }: { children: ReactNode }) {
  return <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7 text-sand-700 marker:text-sand-600 dark:text-sand-300 dark:marker:text-sand-400">{children}</ol>
}

/** A file name, command or identifier inside a sentence. */
export function C({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-chip border border-sand-200 bg-sand-100 px-1.5 py-0.5 font-mono text-[0.85em] text-sand-800 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-200">
      {children}
    </code>
  )
}

/** An in-site link (Next prefetch) or an outside one (new tab). */
export function A({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith('/')) {
    return (
      <Link href={href} className={LINK}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
      {children}
    </a>
  )
}

/** A short aside the reader should not miss: a requirement, a trap. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 flex gap-3 rounded-inset border border-sand-200 bg-sand-100 px-4 py-3 text-sm leading-6 text-sand-700 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300">
      <Info weight="regular" size={16} className="mt-1 shrink-0 text-sand-600 dark:text-sand-400" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}

/** A plain reference table: a header row, then rows of cells. */
export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="mt-5 overflow-x-auto rounded-inset border border-sand-200 dark:border-sand-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-sand-100 dark:bg-sand-900">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-2.5 font-semibold text-sand-900 dark:text-sand-50">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-sand-200 dark:border-sand-800">
              {r.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 align-top leading-6 text-sand-700 dark:text-sand-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Link cards to the next places to read, the shadcn "Next steps" grid. */
export function Cards({ items }: { items: { title: string; href: string; body: string }[] }) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {items.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className="rounded-card border border-sand-200 bg-sand-100 p-4 transition-colors hover:border-sand-300 dark:border-sand-800 dark:bg-sand-900 dark:hover:border-sand-700"
        >
          <span className="font-semibold text-sand-900 dark:text-sand-50">{it.title}</span>
          <span className="mt-1 block text-sm leading-6 text-sand-600 dark:text-sand-400">{it.body}</span>
        </Link>
      ))}
    </div>
  )
}
