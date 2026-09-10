/**
 * The paywall seam in the seven-block prompt scaffold:
 *
 *   1. Setup · 2. Constants · 3. State · 4. Tree · 5. Why · 6. Remix · 7. Check
 *
 * Blocks 1 and 2 are the free teaser: enough to prove the component is worth
 * paying for. Everything from block 3 on is withheld, because block 3 is the
 * whole engine and block 4 the JSX, and the two together rebuild the paid
 * component. Blocks 5 to 7 are prose that could be public, but they sit after
 * the cut, and content resuming below a paywall reads as broken rather than
 * gated: one clean wall beats correct block order, SEO cost accepted.
 *
 * The seam is therefore [start of "## 3. State", end of prompt).
 */
const LOCKED_HEADINGS = [
  '## 3. State',
  '## 4. Tree',
  '## 5. Why',
  '## 6. Remix',
  '## 7. Check',
] as const
const LOCK_START = LOCKED_HEADINGS[0]

/**
 * Occurrences of a heading, matched at LINE START only, and the one definition
 * of "a heading" used both to place the cut and to assert the result. A substring
 * match would cut early on a heading quoted inside block 2's shipped constants,
 * and would reject a safe prompt for merely mentioning one in a string.
 */
function headingHits(text: string, heading: string): number[] {
  const out: number[] = []
  // Trailing whitespace still makes it a heading: a bare `$` would miss
  // "## 3. State " and let the block under it survive the cut.
  const re = new RegExp(`^${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'gm')
  for (let m = re.exec(text); m; m = re.exec(text)) out.push(m.index)
  return out
}

/**
 * The public part of a scaffold prompt (blocks 1 and 2), or null when the prompt
 * is not in a recognisable scaffold. Callers must then withhold it whole: the
 * scaffold is enforced per listed slug (scripts/prompts-scaffold-scope.json), so
 * "no headings found" means "cannot safely redact", never "nothing to redact".
 */
export function splitPromptAtPaywall(prompt: string): { head: string } | null {
  // Exactly one cut point, or we cannot say which one is real.
  const starts = headingHits(prompt, LOCK_START)
  if (starts.length !== 1) return null

  const head = prompt.slice(0, starts[0]).trimEnd()
  // Asserted on the output, not the input: no locked heading may survive as a
  // real heading in what we are about to ship.
  if (LOCKED_HEADINGS.some((h) => headingHits(head, h).length > 0)) return null
  return { head }
}

/**
 * The paywall seam for a DESIGN-SYSTEM prompt.
 *
 * These are not scaffold prompts. Each is one hand-written markdown brief,
 * 400 to 900 words, whose section headings differ per component (`## API`,
 * `## Geometry`, `## Motion`, …), so the fixed seven-block cut above matches
 * none of them and would withhold every one whole.
 *
 * The seam here is structural rather than named: the opening paragraphs plus
 * the FIRST section are public, everything from the second heading on is
 * withheld. The opening says what the component is and the first section is
 * almost always its prop table — enough to judge whether it is worth paying
 * for — while the values, geometry and motion that actually rebuild it sit
 * below the cut.
 *
 * Fails closed, like its scaffold sibling: a prompt with fewer than two
 * headings cannot be redacted at a known seam, so the caller withholds it
 * whole rather than guessing where to stop.
 */
export function splitSystemPromptAtPaywall(prompt: string): { head: string } | null {
  // Headings at line start only. A `## ` inside a fenced code block DOES still
  // match, which moves the cut earlier or drops below two matches and withholds
  // the prompt whole. Both directions are safe: the seam can only ever ship
  // less, never more.
  const heads: number[] = []
  const re = /^##\s+\S.*$/gm
  for (let m = re.exec(prompt); m; m = re.exec(prompt)) heads.push(m.index)
  if (heads.length < 2) return null

  const head = prompt.slice(0, heads[1]).trimEnd()
  // Assert on the output: exactly one section may survive the cut.
  const kept = head.match(/^##\s+\S.*$/gm) ?? []
  if (kept.length !== 1) return null
  return { head }
}
