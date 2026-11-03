'use client'

import { CopyPageButton } from '../../components/CopyPage'
import { SITE_URL } from '../../lib/config'

// The docs' Copy page button. A docs page has no Markdown twin, so the button
// reads the rendered article at the moment of the click and writes it out as
// Markdown: headings, paragraphs, lists, code, tables and every tab panel
// (the hidden ones too, each under its tab's name). Buttons, the tab strip and
// the previous / next links are left out.

const SKIP = new Set(['BUTTON', 'NAV', 'SVG', 'SCRIPT', 'STYLE', 'IMG'])
const BLOCK = new Set(['P', 'DIV', 'SECTION', 'HEADER', 'ARTICLE', 'UL', 'OL', 'LI', 'PRE', 'TABLE', 'H1', 'H2', 'H3', 'H4', 'BLOCKQUOTE'])

function skipped(el: Element): boolean {
  return (
    SKIP.has(el.tagName.toUpperCase()) ||
    el.hasAttribute('data-md-skip') ||
    el.getAttribute('role') === 'tablist' ||
    el.getAttribute('aria-hidden') === 'true'
  )
}

// Links inside the site point at the live site, whatever host the page runs on.
function absolute(href: string): string {
  return href.startsWith(window.location.origin) ? SITE_URL + href.slice(window.location.origin.length) : href
}

function inline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? '').replace(/\s+/g, ' ')
  if (!(node instanceof Element) || skipped(node)) return ''
  const inner = () => Array.from(node.childNodes).map(inline).join('')
  switch (node.tagName) {
    case 'CODE':
      return `\`${node.textContent ?? ''}\``
    case 'STRONG':
    case 'B':
      return `**${inner().trim()}**`
    case 'EM':
    case 'I':
      return `*${inner().trim()}*`
    case 'BR':
      return '\n'
    case 'A': {
      const href = absolute((node as HTMLAnchorElement).href)
      if (!href) return inner()
      // A card link: its first part is the name, the rest describes it.
      const parts = Array.from(node.children).map((child) => inline(child).trim()).filter(Boolean)
      if (parts.length > 1) return `[${parts[0]}](${href}): ${parts.slice(1).join(' ')}`
      return `[${inner().trim()}](${href})`
    }
    default:
      return inner()
  }
}

function blocks(el: Element, out: string[]) {
  if (skipped(el)) return
  const tag = el.tagName
  const text = () => inline(el).trim()
  // Headings carry their own anchor link; the Markdown keeps the words only.
  if (/^H[1-4]$/.test(tag)) return void out.push(`${'#'.repeat(Number(tag[1]))} ${(el.textContent ?? '').trim()}`)
  if (tag === 'P') return void (text() && out.push(text()))
  if (tag === 'PRE') return void out.push('```\n' + (el.textContent ?? '').replace(/\n$/, '') + '\n```')
  if (tag === 'UL' || tag === 'OL') {
    const items = Array.from(el.children).filter((li) => li.tagName === 'LI')
    return void out.push(items.map((li, i) => `${tag === 'OL' ? `${i + 1}.` : '-'} ${inline(li).trim()}`).join('\n'))
  }
  if (tag === 'TABLE') {
    const rows = Array.from(el.querySelectorAll('tr')).map((tr) => Array.from(tr.children).map((cell) => inline(cell).trim().replace(/\|/g, '\\|')))
    if (rows.length) out.push([rows[0], rows[0].map(() => '---'), ...rows.slice(1)].map((r) => `| ${r.join(' | ')} |`).join('\n'))
    return
  }
  if (el.getAttribute('role') === 'tabpanel') {
    const label = document.getElementById(el.getAttribute('aria-labelledby') ?? '')?.textContent?.trim()
    if (label) out.push(`**${label}**`)
  }
  // A wrapper with no block children is a paragraph of its own (a note, a caption).
  const kids = Array.from(el.children).filter((child) => !skipped(child))
  const hasBlock = kids.some((child) => BLOCK.has(child.tagName))
  // A row of card links reads as a list, one link per line.
  if (!hasBlock && kids.length > 1 && kids.every((child) => child.tagName === 'A')) {
    return void out.push(kids.map((child) => `- ${inline(child).trim()}`).join('\n'))
  }
  if (!hasBlock) return void (text() && out.push(text()))
  for (const child of Array.from(el.children)) blocks(child, out)
}

function articleMarkdown(): string {
  const article = document.querySelector('[data-doc-article]')
  if (!article) return ''
  const out: string[] = []
  blocks(article, out)
  const [title, ...rest] = out
  return [title, `Source: ${SITE_URL}${window.location.pathname}`, ...rest].join('\n\n') + '\n'
}

export function DocsCopyPage() {
  return <CopyPageButton markdown={articleMarkdown} />
}
