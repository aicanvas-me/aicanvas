import { Check } from '@/app/_icons/icons/check'
import { ExternalLink } from '@/app/_icons/icons/external-link'
import { buttonClasses } from '../components/buttonClasses'
import { CARD, PILL } from '../components/PageKit'
import { Reveal } from '../home/Reveal'
import { InstallPanel } from './InstallPanel'
import type { SkillEntry } from './_lib/entries'

export const FREE_CHIP =
  'rounded-full border border-free/30 bg-free/10 px-2 py-0.5 text-xs font-semibold text-free'
export const WORKS_CHIP =
  'rounded-chip border border-sand-200 bg-sand-50 px-2 py-1 text-xs font-semibold text-sand-700 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300'

// memoryHD's visual: what a recall looks like when the words match.
function RecallSnippet() {
  return (
    <div
      role="img"
      aria-label="Example of memoryHD recalling two notes"
      className="overflow-x-auto rounded-inset border border-sand-200 bg-sand-50 p-4 font-mono text-[12px] leading-relaxed text-sand-700 dark:border-sand-800 dark:bg-sand-950 dark:text-sand-300"
    >
      <Reveal y={6}>
        <p className="whitespace-pre text-sand-900 dark:text-sand-50">you  how do we deploy again?</p>
      </Reveal>
      <Reveal y={6} delay={0.15} className="mt-3">
        <p className="whitespace-pre">{'<memory-recall>'}</p>
        <p className="whitespace-pre">[deploy-runbook] deploy, ship, release, roll back</p>
        <p className="whitespace-pre">
          {'  deploy-runbook.md '}
          <span className="text-sand-600 dark:text-sand-400">(4 days ago)</span>
        </p>
      </Reveal>
      <Reveal y={6} delay={0.3}>
        <p className="whitespace-pre">[old-config] env vars, secrets, ports</p>
        <p className="whitespace-pre">
          {'  old-config.md '}
          <span className="text-sand-600 dark:text-sand-400">(stale, 240 days old, verify first)</span>
        </p>
      </Reveal>
    </div>
  )
}

const VISUALS: Record<string, () => React.ReactNode> = { memoryhd: RecallSnippet }

export function EntryCard({ entry, wide }: { entry: SkillEntry; wide: boolean }) {
  const live = entry.status === 'live'
  const Visual = VISUALS[entry.slug]
  return (
    <article id={entry.slug} className={`${CARD} scroll-mt-24 p-6 sm:p-8`}>
      <div className={wide ? 'grid gap-8 md:grid-cols-2 md:items-center' : 'grid gap-6'}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={PILL}>{entry.kind}</span>
            {live ? (
              <>
                <span className={FREE_CHIP}>Free</span>
                <span className="text-xs font-semibold text-sand-600 dark:text-sand-400">{entry.licence}</span>
              </>
            ) : (
              <span className={PILL}>Coming next</span>
            )}
          </div>
          <h3 className="mt-4 text-3xl font-bold tracking-tight text-sand-900 dark:text-sand-50">{entry.name}</h3>
          <p className="mt-2 text-lg font-bold text-sand-900 dark:text-sand-50">{entry.hook}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-sand-600 dark:text-sand-400">{entry.body}</p>
          <ul className="mt-5 space-y-2.5">
            {entry.points.map((p) => (
              <li key={p.body} className="flex gap-2.5 text-[15px] leading-relaxed text-sand-700 dark:text-sand-300">
                <Check size={14} className="mt-1 shrink-0 text-success" aria-hidden />
                <span>{p.body}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {entry.worksWith.map((w) => (
              <span key={w} className={WORKS_CHIP}>
                {w}
              </span>
            ))}
            {!live && (
              <span className="text-xs font-semibold text-sand-600 dark:text-sand-400">Free · {entry.licence}</span>
            )}
          </div>
          {live && (
            <div className="mt-6 space-y-3">
              {entry.install.length > 0 && <InstallPanel entry={entry} id={`${entry.slug}-install`} />}
              {entry.repo && !entry.install.length && (
                <a
                  href={entry.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses({ variant: 'outline', size: 'md' })}
                >
                  View on GitHub
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          )}
        </div>
        {Visual && <Visual />}
      </div>
    </article>
  )
}
