import { Check } from '@/app/_icons/icons/check'
import { CARD, EYEBROW, PILL } from '../components/PageKit'
import { Reveal } from '../home/Reveal'
import { InstallPanel } from './InstallPanel'
import { ClaudeCodeMark, ClaudeMark, CodexMark } from '../mcp/InstallCards'
import type { SkillEntry } from './_lib/entries'

export const WORKS_CHIP =
  'inline-flex items-center gap-1.5 rounded-chip border border-sand-200 bg-sand-50 px-2 py-1 text-xs font-semibold text-sand-700 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300'

// Claude marks keep Claude's own orange; the OpenAI mark takes the ink.
const CLAUDE_ORANGE = 'text-[#D97757] [&>svg]:size-3.5'
const INK_MARK = 'text-sand-900 dark:text-sand-50 [&>svg]:size-3.5'
const AGENT_MARKS: Partial<Record<string, React.ReactNode>> = {
  'Claude Code': <span className={CLAUDE_ORANGE}><ClaudeCodeMark /></span>,
  Codex: <span className={INK_MARK}><CodexMark /></span>,
}

export function AgentChips({ entry }: { entry: SkillEntry }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {entry.worksWith.map((w) => (
        <span key={w} className={WORKS_CHIP}>
          {AGENT_MARKS[w]}
          {w}
        </span>
      ))}
    </div>
  )
}

// Where the skill works, and the models it does its best work with, side by side.
export function WorksWith({ entry }: { entry: SkillEntry }) {
  return (
    <div className="grid max-w-2xl divide-y divide-sand-200 rounded-card border border-sand-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-sand-800 dark:border-sand-800">
      <div className="p-4 sm:p-5">
        <p className={EYEBROW}>Works with</p>
        <div className="mt-3">
          <AgentChips entry={entry} />
        </div>
        {entry.worksWithNote && (
          <p className="mt-2.5 text-xs font-semibold text-sand-600 dark:text-sand-400">{entry.worksWithNote}</p>
        )}
      </div>
      {entry.bestWith && (
        <div className="p-4 sm:p-5">
          <p className={EYEBROW}>Best results with</p>
          <ul className="mt-3 space-y-2.5">
            {entry.bestWith.map((g) => (
              <li key={g.maker} className="flex items-center gap-2.5">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-sand-200 bg-sand-50 dark:border-sand-800 dark:bg-sand-900 ${g.maker === 'claude' ? CLAUDE_ORANGE : INK_MARK}`}>
                  {g.maker === 'claude' ? <ClaudeMark /> : <CodexMark />}
                </span>
                <span className="text-sm font-semibold text-sand-900 dark:text-sand-50">{g.models.join(' · ')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

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

const VISUALS: Partial<Record<string, () => React.ReactNode>> = { memoryhd: RecallSnippet }

// intro=false when the section heading already carries the hook and body.
export function EntryCard({ entry, intro = true }: { entry: SkillEntry; intro?: boolean }) {
  const live = entry.status === 'live'
  const Visual = VISUALS[entry.slug]
  return (
    <article id={entry.slug} className={`${CARD} scroll-mt-24 p-6 sm:p-8`}>
      <div className={`grid gap-8 ${Visual ? 'lg:grid-cols-[1fr_1.1fr] lg:items-center' : ''}`}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={PILL}>{entry.kind}</span>
            {!live && <span className={PILL}>Coming next</span>}
          </div>
          <h3 className="mt-4 text-2xl font-bold tracking-tight text-sand-900 dark:text-sand-50">{entry.name}</h3>
          {intro && (
            <>
              <p className="mt-2 text-lg font-bold text-sand-900 dark:text-sand-50">{entry.hook}</p>
              <p className="mt-3 text-[15px] leading-relaxed text-sand-600 dark:text-sand-400">{entry.body}</p>
            </>
          )}
          <ul className="mt-5 space-y-4">
            {entry.points.map((p) => (
              <li key={p.body} className="flex gap-2.5">
                <Check size={14} className="mt-1 shrink-0 text-success" aria-hidden />
                <span>
                  {p.title && <span className="block text-[15px] font-semibold text-sand-900 dark:text-sand-50">{p.title}</span>}
                  <span className="block text-sm leading-relaxed text-sand-600 dark:text-sand-400">{p.body}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <AgentChips entry={entry} />
          </div>
          {live && (
            <div className="mt-6">
              <InstallPanel entry={entry} id={`${entry.slug}-install`} />
            </div>
          )}
        </div>
        {Visual && <Visual />}
      </div>
    </article>
  )
}
