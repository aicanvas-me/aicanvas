'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Check, Copy, DownloadSimple, Terminal } from '@phosphor-icons/react'
import { zipSync, strToU8 } from 'fflate'
import { Button } from '../../../components/Button'
import { BrainRender } from './BrainRender'
import { useCopied } from '@/app/components/useCopied'

// AI Canvas site tokens: sand neutrals + olive accent, Manrope UI + Geist mono for code.
// One flat palette per site theme, read through CSS variables (brainVars) so
// the reader follows the `dark` class on <html>. accent.fill/on are the one
// olive button: olive-500 with sand-950 ink in both themes, per the site rule.
const PALETTE = {
  dark: {
    'surface-base': '#0E0E0F', 'surface-raised': '#1B1B1C', 'surface-hover': '#232325', 'surface-active': '#2D2D2E',
    'text-primary': '#F4F4FA', 'text-secondary': '#9B9B9E', 'text-muted': '#9B9B9E', 'text-faint': '#7B7B7D',
    'accent-100': '#EAF0C8', 'accent-300': '#DAE4A0', 'accent-400': '#A8B94D', 'accent-500': '#869631', 'accent-fill': '#A8B94D', 'accent-on': '#0E0E0F',
    'border-subtle': '#2D2D2E', 'border-base': '#373738',
  },
  light: {
    'surface-base': '#F4F4FA', 'surface-raised': '#EEEEF3', 'surface-hover': '#DFDFE3', 'surface-active': '#CACACD',
    'text-primary': '#1B1B1C', 'text-secondary': '#575759', 'text-muted': '#575759', 'text-faint': '#7B7B7D',
    'accent-100': '#4A551A', 'accent-300': '#869631', 'accent-400': '#869631', 'accent-500': '#A8B94D', 'accent-fill': '#A8B94D', 'accent-on': '#0E0E0F',
    'border-subtle': '#DFDFE3', 'border-base': '#CACACD',
  },
} as const
type ReaderColor = keyof typeof PALETTE.dark
const v = (k: ReaderColor) => `var(--brain-${k})`
const C = {
  surface: { base: v('surface-base'), raised: v('surface-raised'), hover: v('surface-hover'), active: v('surface-active') },
  text: { primary: v('text-primary'), secondary: v('text-secondary'), muted: v('text-muted'), faint: v('text-faint') },
  accent: { 100: v('accent-100'), 300: v('accent-300'), 400: v('accent-400'), 500: v('accent-500'), fill: v('accent-fill'), on: v('accent-on') },
  border: { subtle: v('border-subtle'), base: v('border-base') },
}
const brainVars = (t: 'light' | 'dark') => (Object.keys(PALETTE[t]) as ReaderColor[]).map((k) => `--brain-${k}: ${PALETTE[t][k]};`).join(' ')
const SANS = "var(--font-sans), 'Manrope', system-ui, sans-serif"
const MONO = "var(--font-mono, var(--font-jetbrains-mono)), 'Geist Mono', monospace"
const FONT = SANS

export interface BrainFile {
  path: string
  content: string
}

interface Section {
  id: string
  label: string
  count: string
  files: BrainFile[]
}

function getDisplayName(f: BrainFile): string {
  const parts = f.path.split('/')
  const name = parts.at(-1) ?? ''
  if (name === 'rules.md') return 'Brain Index'
  if (name === 'SKILL.md') return parts.at(-2) ?? 'Skill'
  if (name.endsWith('.rules.md')) return name.replace('.rules.md', '')
  return name.replace('.md', '')
}

function getSectionKey(f: BrainFile): string {
  if (f.path.includes('/foundations/')) return 'foundations'
  if (f.path.includes('/components/')) return 'components'
  if (f.path.includes('/_skills/')) return 'skills'
  return 'index'
}

function categorize(files: BrainFile[]): Section[] {
  const groups: Record<string, BrainFile[]> = { index: [], foundations: [], components: [], skills: [] }
  for (const f of files) groups[getSectionKey(f)].push(f)
  groups.components.sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b)))

  const labels: Record<string, string> = {
    index: 'INDEX',
    foundations: 'FOUNDATIONS',
    components: 'COMPONENTS',
    skills: 'SKILLS',
  }
  return ['index', 'foundations', 'components', 'skills']
    .filter((k) => groups[k].length > 0)
    .map((k) => ({
      id: k,
      label: labels[k],
      count: groups[k].length > 1 ? `${groups[k].length}` : '',
      files: groups[k],
    }))
}

// ── Markdown renderer ──────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function inlineFmt(raw: string): string {
  const s = esc(raw)
  return s
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
      const internal = href.endsWith('.md') && !href.startsWith('http')
      if (internal) {
        return `<a data-brain-file="${href}" style="color:${C.accent[300]};text-decoration:underline;text-decoration-color:${C.accent[500]};cursor:pointer">${text}</a>`
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:${C.accent[300]};text-decoration:underline;text-decoration-color:${C.accent[500]}">${text}</a>`
    })
    .replace(/\*\*([^*]+)\*\*/g, (_, t) => `<strong style="color:${C.text.primary};font-weight:600">${t}</strong>`)
    .replace(/`([^`]+)`/g, (_, t) => `<code style="font-family:${MONO};color:${C.text.secondary};background:${C.surface.raised};padding:1px 6px;border-radius:4px;font-size:0.875em">${t}</code>`)
}

function stripFrontmatter(md: string): string {
  if (!md.startsWith('---\n')) return md
  const end = md.indexOf('\n---\n', 4)
  return end === -1 ? md : md.slice(end + 5).trimStart()
}

function renderMd(raw: string): string {
  const md = stripFrontmatter(raw)

  // Protect fenced code blocks first
  const blocks: string[] = []
  const text = md.replace(/```[\w]*\n([\s\S]*?)```/gm, (_, code) => {
    const i = blocks.length
    blocks.push(
      `<pre style="background:${C.surface.raised};border:1px solid ${C.border.subtle};padding:14px 18px;overflow-x:auto;font-size:12px;line-height:1.75;margin:14px 0;font-family:${MONO}"><code>${esc(code).trimEnd()}</code></pre>`,
    )
    return `\x00B${i}\x00`
  })

  const lines = text.split('\n')
  const out: string[] = []
  let inUl = false
  let pBuf: string[] = []

  const flushParagraph = () => {
    const joined = pBuf.join(' ').trim()
    if (joined) {
      out.push(`<p style="margin:0 0 14px;line-height:1.8;color:${C.text.secondary}">${inlineFmt(joined)}</p>`)
    }
    pBuf = []
  }
  const closeList = () => {
    if (inUl) {
      out.push('</ul>')
      inUl = false
    }
  }

  // GFM tables: a row line (`| a | b |`) immediately followed by a separator
  // (`|---|---|`). The split is on a bare `|`, so an escaped `\|` inside a
  // cell would break. The brain's tables don't use them.
  const isTableSep = (l?: string) =>
    !!l && /^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)+\|?\s*$/.test(l)
  const isTableRow = (l?: string) => !!l && l.trim() !== '' && l.includes('|')
  const cells = (l: string) =>
    l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Code block placeholder
    if (line.includes('\x00B')) {
      flushParagraph()
      closeList()
      out.push(line.replace(/\x00B(\d+)\x00/g, (_, bi) => blocks[+bi]))
      continue
    }

    // Table (header row + separator + zero or more body rows)
    if (isTableRow(line) && isTableSep(lines[i + 1])) {
      flushParagraph()
      closeList()
      const header = cells(line)
      const rows: string[][] = []
      let j = i + 2
      while (j < lines.length && isTableRow(lines[j]) && !isTableSep(lines[j])) {
        rows.push(cells(lines[j]))
        j++
      }
      const th = header
        .map(
          (h) =>
            `<th style="text-align:left;padding:7px 12px;border-bottom:1px solid ${C.border.base};color:${C.text.primary};font-weight:600;white-space:nowrap">${inlineFmt(h)}</th>`,
        )
        .join('')
      const body = rows
        .map(
          (r) =>
            `<tr>${r
              .map(
                (c) =>
                  `<td style="padding:7px 12px;border-bottom:1px solid ${C.border.subtle};color:${C.text.secondary};vertical-align:top">${inlineFmt(c)}</td>`,
              )
              .join('')}</tr>`,
        )
        .join('')
      out.push(
        `<div style="overflow-x:auto;margin:14px 0"><table style="border-collapse:collapse;width:100%;font-size:13px;line-height:1.6"><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table></div>`,
      )
      i = j - 1
      continue
    }

    // Headings
    const hm = line.match(/^(#{1,4}) (.+)/)
    if (hm) {
      flushParagraph()
      closeList()
      const lvl = hm[1].length
      const sizes = ['20px', '16px', '14px', '12px']
      const sz = sizes[lvl - 1]
      const tracking = ''
      const color = lvl === 1 ? C.text.primary : lvl === 2 ? C.text.secondary : C.text.muted
      const mt = lvl === 1 ? '0' : lvl === 2 ? '28px' : '20px'
      out.push(
        `<h${lvl} style="font-size:${sz};font-weight:${lvl <= 2 ? 700 : 600};color:${color};margin:${mt} 0 6px;${tracking}">${inlineFmt(hm[2])}</h${lvl}>`,
      )
      if (lvl <= 2) {
        out.push(`<div style="height:1px;background:${C.border.subtle};margin-bottom:16px"></div>`)
      }
      continue
    }

    // Horizontal rule
    if (/^-{3,}$/.test(line.trim())) {
      flushParagraph()
      closeList()
      out.push(`<hr style="border:none;border-top:1px solid ${C.border.subtle};margin:22px 0" />`)
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushParagraph()
      closeList()
      out.push(
        `<blockquote style="border-left:2px solid ${C.accent[300]};padding:10px 16px;margin:14px 0;background:${C.surface.raised};color:${C.text.muted};font-style:italic">${inlineFmt(line.slice(2))}</blockquote>`,
      )
      continue
    }

    // Unordered list
    const ulm = line.match(/^- (.+)/)
    if (ulm) {
      flushParagraph()
      if (!inUl) {
        out.push(`<ul style="margin:8px 0 14px 0;padding:0;list-style:none">`)
        inUl = true
      }
      out.push(
        `<li style="display:flex;gap:10px;padding-bottom:7px;color:${C.text.secondary};line-height:1.65"><span style="color:${C.accent[400]};flex-shrink:0;margin-top:1px;font-size:12px">›</span><span>${inlineFmt(ulm[1])}</span></li>`,
      )
      continue
    }

    // Ordered list
    const olm = line.match(/^(\d+)\. (.+)/)
    if (olm) {
      flushParagraph()
      if (!inUl) {
        out.push(`<ul style="margin:8px 0 14px 0;padding:0;list-style:none">`)
        inUl = true
      }
      out.push(
        `<li style="display:flex;gap:10px;padding-bottom:7px;color:${C.text.secondary};line-height:1.65"><span style="color:${C.accent[400]};flex-shrink:0;font-size:12px;min-width:14px">${olm[1]}.</span><span>${inlineFmt(olm[2])}</span></li>`,
      )
      continue
    }

    // Empty line
    if (line.trim() === '') {
      flushParagraph()
      closeList()
      continue
    }

    // Buffer into paragraph
    closeList()
    pBuf.push(line)
  }

  flushParagraph()
  closeList()
  return out.join('\n')
}

// ── Component ──────────────────────────────────────────────────────────────

export function BrainViewer({ files }: { files: BrainFile[] }) {
  const sections = categorize(files)

  // Default to the Brain Index (rules.md)
  const defaultFile = files.find((f) => f.path.endsWith('andromeda/rules.md')) ?? files[0]
  const [activeFile, setActiveFile] = useState<BrainFile>(defaultFile)
  const contentRef = useRef<HTMLDivElement>(null)

  // Jump back to the top of the content whenever the active file changes.
  // The content panel is not a scroller itself (the page column scrolls), so
  // scroll the column via scrollIntoView; scrollMarginTop clears the sticky bar.
  useEffect(() => {
    contentRef.current?.scrollIntoView({ block: 'start' })
  }, [activeFile])

  // Internal brain-link navigation (links with data-brain-file="...")
  const handleContentClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = (e.target as HTMLElement).closest('[data-brain-file]') as HTMLElement | null
      if (!target) return
      e.preventDefault()
      const rel = target.getAttribute('data-brain-file') ?? ''
      const found = files.find((f) => {
        const parts = f.path.split('/')
        // Match by the tail segments in the href (e.g. "foundations/build-workflow.md")
        return f.path.endsWith(rel.replace(/^\.\.\//, '').replace(/^\.\//, ''))
      })
      if (found) setActiveFile(found)
    },
    [files],
  )

  const html = renderMd(activeFile.content)
  const isIndex = getSectionKey(activeFile) === 'index'

  const fileCount = files.length
  // Zip the brain lazily on the CLIENT (never during SSR or the render phase):
  // a ~270 KB deflate in render would block the server response on every
  // premium request and again on the hydration main thread. This runs once
  // after mount, so the exact compressed size (what the user downloads) appears
  // a beat after paint; the bytes are reused by downloadBrain (no re-zip on
  // click). sizeKb is undefined until then — the copy omits it gracefully.
  const [zip, setZip] = useState<{ sizeKb: number; bytes: ReturnType<typeof zipSync> } | null>(null)
  useEffect(() => {
    const entries: Record<string, Uint8Array> = {}
    for (const f of files) entries[f.path] = strToU8(f.content)
    const zipped = zipSync(entries, { level: 6 })
    setZip({ sizeKb: Math.round(zipped.length / 1024), bytes: zipped })
  }, [files])
  const sizeKb = zip?.sizeKb

  // The Install button lives in the sticky top bar (template-page pattern) but
  // is OWNED here, portaled into the bar's slot — the zip needs the loaded
  // files, which only this component has. The slot div is display:none below
  // md (the whole bar is), so a portal there would be invisible on mobile; the
  // inline md:hidden fallback below covers small screens instead.
  const [installSlot, setInstallSlot] = useState<HTMLElement | null>(null)
  useEffect(() => {
    setInstallSlot(document.getElementById('brain-install-slot'))
  }, [])

  // Download the pre-zipped bytes — the secondary path for anyone who prefers a
  // file over a command. The viewer only renders for entitled users, so this is
  // already access-gated.
  const downloadBrain = useCallback(() => {
    if (!zip) return // zip still computing (first few ms after mount)
    const blob = new Blob([zip.bytes], { type: 'application/zip' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'andromeda-brain.zip'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }, [zip])

  return (
    // Natural height on purpose: the Andromeda content column is the ONE
    // scroller (single scrollbar, footer flows after the viewer). The file nav
    // stays reachable by being sticky under the 56px top bar instead of owning
    // its own full-height scroll region.
    <div
      className="brain-reader"
      style={{
        display: 'flex',
        flexDirection: 'row-reverse',
        alignItems: 'flex-start',
        fontFamily: FONT,
      }}
    >
      <style>{`
        .brain-reader { ${brainVars('light')} }
        .dark .brain-reader { ${brainVars('dark')} }
        .brain-nav-item { transition: background 0.1s, color 0.1s; }
        .brain-nav-item:hover { background: ${C.surface.hover} !important; color: ${C.text.secondary} !important; }
        .brain-nav-item.active { background: ${C.surface.raised} !important; color: ${C.text.primary} !important; }
        .brain-content a[data-brain-file]:hover { color: ${C.accent[100]} !important; }
        .brain-content a[href]:hover { color: ${C.accent[100]} !important; }
        .brain-dl { transition: background 0.12s; }
        .brain-dl:hover { background: ${C.accent[300]} !important; }
        .brain-mobile-nav { display: none; }
        @media (max-width: 767px) {
          .brain-nav-desktop { display: none !important; }
          .brain-mobile-nav { display: block !important; }
          .brain-content { padding-left: 20px !important; padding-right: 20px !important; }
          .brain-pad-x { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      {/* Nav (file index) — rendered on the RIGHT via row-reverse on the root,
          so it doesn't sit beside the global app sidebar on the left. */}
      <nav
        aria-label="Brain sections"
        className="brain-nav-desktop"
        style={{
          width: 220,
          flexShrink: 0,
          borderLeft: `1px solid ${C.border.subtle}`,
          position: 'sticky',
          top: 56,
          maxHeight: 'calc(100vh - 56px)',
          overflowY: 'auto',
          padding: '20px 0',
        }}
      >
        {sections.map((section) => (
          <div key={section.id} style={{ marginBottom: 20 }}>
            {/* Section label */}
            <div
              style={{
                fontSize: 10,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: C.text.faint,
                padding: '0 16px',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>{section.label}</span>
              {section.count && (
                <span style={{ color: C.accent[400], fontSize: 10 }}>{section.count}</span>
              )}
            </div>

            {/* File rows */}
            {section.files.map((f) => {
              const isActive = f.path === activeFile.path
              const name = getDisplayName(f)
              return (
                <button
                  key={f.path}
                  className={`brain-nav-item${isActive ? ' active' : ''}`}
                  onClick={() => setActiveFile(f)}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '6px 16px',
                    fontSize: 12,
                    fontFamily: FONT,
                    cursor: 'pointer',
                    border: 'none',
                    borderLeft: isActive ? `2px solid ${C.accent[300]}` : '2px solid transparent',
                    background: isActive ? C.surface.raised : 'transparent',
                    color: isActive ? C.text.primary : C.text.faint,
                    lineHeight: 1.4,
                  }}
                >
                  {name}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Content panel — natural height; the page column is the scroller. */}
      <div
        ref={contentRef}
        style={{
          flex: 1,
          minWidth: 0,
          scrollMarginTop: 56,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Install lives in the sticky top bar (template pattern) via portal;
            below md the bar is hidden, so an inline copy takes over. */}
        {installSlot &&
          createPortal(
            <BrainInstallButton fileCount={fileCount} sizeKb={sizeKb} onDownloadZip={downloadBrain} />,
            installSlot,
          )}
        <div className="brain-pad-x md:hidden" style={{ padding: '20px 40px 0', alignSelf: 'flex-start' }}>
          <BrainInstallButton fileCount={fileCount} sizeKb={sizeKb} onDownloadZip={downloadBrain} />
        </div>

        {/* Mobile file picker — the right nav is hidden below md, so navigate
            the brain files from this dropdown instead. */}
        <div className="brain-mobile-nav brain-pad-x" style={{ padding: '16px 40px 0' }}>
          <select
            aria-label="Brain file"
            value={activeFile.path}
            onChange={(e) => {
              const f = files.find((x) => x.path === e.target.value)
              if (f) setActiveFile(f)
            }}
            style={{
              width: '100%',
              background: C.surface.raised,
              color: C.text.primary,
              border: `1px solid ${C.border.base}`,
              borderRadius: 8,
              padding: '10px 12px',
              fontFamily: FONT,
              fontSize: 14,
            }}
          >
            {sections.map((section) => (
              <optgroup key={section.id} label={section.label}>
                {section.files.map((f) => (
                  <option key={f.path} value={f.path}>
                    {getDisplayName(f)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Low-poly zone brain — INDEX ONLY, directly above the heading. */}
        {isIndex && (
          <div className="brain-pad-x" style={{ maxWidth: 780, padding: '4px 40px 0' }}>
            <BrainRender height={400} />
          </div>
        )}

        {/* Markdown content */}
        <div
          className="brain-content"
          onClick={handleContentClick}
          style={{
            padding: isIndex ? '4px 40px 24px' : '28px 40px 64px',
            maxWidth: 780,
            fontSize: 14,
            lineHeight: 1.75,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* Closing CTA — the "Get the brain" card, at the BOTTOM of the index. */}
        {isIndex && (
          <div className="brain-pad-x" style={{ padding: '0 40px 64px', maxWidth: 780 }}>
            <BrainInstallCard fileCount={fileCount} sizeKb={sizeKb} onDownloadZip={downloadBrain} />
          </div>
        )}
      </div>
    </div>
  )
}

// Tokenized brain install command, shared by the top-bar button and the
// bottom card. The brain is premium, so the bare command gets the locked
// placeholder; the token attributes the pull to the account. Masked form for
// display, real form for copy. --overwrite makes the SAME command install AND
// update (a no-op on first run, an in-place refresh on re-runs — without it the
// CLI prompts per existing file).
function useBrainInstallCommand() {
  const [token, setToken] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    const refresh = () =>
      fetch('/api/me/token')
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled) setToken(d?.token ?? null)
        })
        .catch(() => {})
    refresh()
    window.addEventListener('focus', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('focus', refresh)
    }
  }, [])
  const reference = token
    ? `"https://aicanvas.me/r/andromeda-brain.json?token=${token}"`
    : '@aicanvas/andromeda-brain'
  const referenceMasked = `"https://aicanvas.me/r/andromeda-brain.json?token=aic_••••••••"`
  return {
    cliCommand: `npx shadcn@latest add --overwrite ${reference}`,
    cliCommandMasked: `npx shadcn@latest add --overwrite ${token ? referenceMasked : '@aicanvas/andromeda-brain'}`,
  }
}

// Install button + popover, cloned from the template pages' InstallButton
// (TemplatePreviewShell) so the brain installs exactly like a template: CLI
// command with masked token, Copy CLI, contents bullets — plus the zip as the
// in-popover secondary. Rendered only for entitled users (inside BrainViewer).
function BrainInstallButton({
  fileCount,
  sizeKb,
  onDownloadZip,
}: {
  fileCount: number
  sizeKb: number | undefined
  onDownloadZip: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { cliCommand, cliCommandMasked } = useBrainInstallCommand()
  const { copied, copy: handleCopy, reset: resetCopied } = useCopied(cliCommand)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const bullets = [
    `All ${fileCount} rule files${sizeKb ? ` (~${sizeKb} KB)` : ''} into design-systems/andromeda/ in your project.`,
    'Your AI agent reads them there. Re-run the command to update.',
  ]

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="primary"
        size="xs"
        onClick={() => {
          resetCopied()
          setOpen((o) => !o)
        }}
      >
        <Terminal weight="regular" size={13} />
        Get the Brain
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(480px,calc(100vw-24px))] overflow-hidden rounded-xl border border-sand-300 bg-sand-50 shadow-2xl dark:border-sand-800 dark:bg-sand-900">
          <div className="space-y-3 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-sand-500 dark:text-sand-400">
                  CLI install
                </span>
                <span className="rounded-md border border-olive-500/30 bg-olive-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-olive-600 dark:text-olive-400">
                  One command
                </span>
              </div>
              <Button variant="outline" size="xs" onClick={handleCopy} aria-label="Copy CLI command">
                {copied ? (
                  <>
                    <Check weight="regular" size={13} className="text-olive-500 dark:text-olive-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy weight="regular" size={13} />
                    Copy CLI
                  </>
                )}
              </Button>
            </div>
            <div className="rounded-lg bg-sand-950 px-4 py-3">
              <code className="block break-all font-mono text-xs text-sand-300">{cliCommandMasked}</code>
            </div>
            <div className="space-y-1.5">
              {bullets.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check weight="bold" size={12} className="shrink-0 text-olive-500 dark:text-olive-400" />
                  <p className="text-xs leading-relaxed text-sand-600 dark:text-sand-400">{line}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-sand-300 pt-2.5 dark:border-sand-800">
              <Button variant="outline" size="xs" onClick={onDownloadZip}>
                <DownloadSimple weight="regular" size={13} />
                Or download as a zip
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// The "Get the brain" card — the closing CTA at the BOTTOM of the index page.
// The top-bar Install button is the primary affordance on every file; this is
// the same command in its expanded, inline form for someone who has read the
// index and reached the end. Uses the shared install-command hook.
function BrainInstallCard({
  fileCount,
  sizeKb,
  onDownloadZip,
}: {
  fileCount: number
  sizeKb: number | undefined
  onDownloadZip: () => void
}) {
  const { cliCommand, cliCommandMasked } = useBrainInstallCommand()
  const { copied, copy } = useCopied(cliCommand)

  const bullets = [
    `All ${fileCount} rule files${sizeKb ? ` (~${sizeKb} KB)` : ''} into design-systems/andromeda/ in your project.`,
    'Your AI agent reads them there. Re-run the command to update.',
  ]

  return (
    <div
      style={{
        border: `1px solid ${C.border.subtle}`,
        borderRadius: 12,
        background: C.surface.raised,
        padding: '16px 18px',
      }}
    >
      {/* Title */}
      <div style={{ fontSize: 14, fontWeight: 600, color: C.text.primary, marginBottom: 12 }}>
        Get the brain
      </div>

      {/* npx command box (full width) */}
      <div
        style={{
          background: C.surface.base,
          border: `1px solid ${C.border.subtle}`,
          borderRadius: 8,
          padding: '10px 12px',
          overflowX: 'auto',
          marginBottom: 12,
        }}
      >
        <code style={{ fontFamily: MONO, fontSize: 12, color: C.text.secondary, whiteSpace: 'nowrap' }}>
          {cliCommandMasked}
        </code>
      </div>

      {/* Contents — two checkmarks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        {bullets.map((line, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <Check weight="bold" size={13} color={C.accent[400]} style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: 13, lineHeight: 1.5, color: C.text.secondary }}>{line}</span>
          </div>
        ))}
      </div>

      {/* CTAs — Copy CLI (primary) + Download (secondary) */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          className="brain-dl"
          onClick={copy}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: C.accent.fill,
            color: C.accent.on,
            fontWeight: 600,
            fontSize: 13,
            fontFamily: FONT,
            padding: '8px 14px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {copied ? <Check weight="regular" size={14} /> : <Copy weight="regular" size={14} />}
          {copied ? 'Copied' : 'Copy CLI'}
        </button>
        <button
          type="button"
          onClick={onDownloadZip}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'transparent',
            color: C.text.secondary,
            fontWeight: 600,
            fontSize: 13,
            fontFamily: FONT,
            padding: '8px 14px',
            borderRadius: 8,
            border: `1px solid ${C.border.base}`,
            cursor: 'pointer',
          }}
        >
          <DownloadSimple weight="regular" size={15} />
          Download
        </button>
      </div>
    </div>
  )
}
