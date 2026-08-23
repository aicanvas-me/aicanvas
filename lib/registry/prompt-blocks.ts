/**
 * The paywall seam in the seven-block prompt scaffold.
 *
 * Every prompt is written in the same fixed scaffold (the same headings
 * scripts/lint-prompts.mjs lints against):
 *
 *   1. Setup · 2. Constants · 3. State · 4. Tree · 5. Why · 6. Remix · 7. Check
 *
 * WHY THE CUT IS AT BLOCK 3: blocks 1 and 2 are the trigger. Setup shows the
 * install line, the export signature and the imports; Constants shows the real
 * data, palette, config and prop typedef. That is concrete enough to prove the
 * component is worth paying for, and it reads as a normal teaser: the prompt
 * runs, then stops at a wall, with nothing after it.
 *
 * Everything from block 3 on is withheld. Block 3 is the entire engine (hooks,
 * handlers, RAF loop, disposal, by far the largest block) and block 4 is the JSX
 * with every className and inline style. Those two rebuild the paid component.
 * Blocks 5 to 7 are prose and could safely be public, but they sit AFTER the cut
 * in scaffold order, and content resuming below a paywall reads as broken rather
 * than gated. Maintainer's call (2026-07-28): one clean wall beats correct block
 * order. The SEO cost is real and accepted.
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
 * Return the public part of a scaffold prompt (blocks 1 and 2). Returns null
 * when the prompt is NOT in a recognisable scaffold — callers must then withhold
 * the prompt whole.
 *
 * Failing closed matters: the scaffold is enforced per listed slug
 * (scripts/prompts-scaffold-scope.json), not for every prompt, so "no headings
 * found" means "cannot safely redact", never "nothing to redact".
 */
/**
 * Occurrences of a heading, matched at LINE START only.
 *
 * ONE definition of "a heading", used both to place the cut and to assert the
 * result. A substring match would be wrong in both directions: it would cut early
 * on a heading quoted inside block 2's constants, and it would reject a perfectly
 * safe prompt for merely mentioning one in a string, withholding the whole panel.
 * Block 2 now ships, so its content is arbitrary and quoting is expected.
 */
function headingHits(text: string, heading: string): number[] {
  const out: number[] = []
  // Trailing whitespace still makes it a heading. Anchoring to a bare `$` would
  // miss "## 3. State " and let the block under it survive the cut.
  const re = new RegExp(`^${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'gm')
  for (let m = re.exec(text); m; m = re.exec(text)) out.push(m.index)
  return out
}

export function splitPromptAtPaywall(prompt: string): { head: string } | null {
  // Exactly one cut point, or we cannot say which one is real.
  const starts = headingHits(prompt, LOCK_START)
  if (starts.length !== 1) return null

  const head = prompt.slice(0, starts[0]).trimEnd()
  // Final assertion on the actual output, not on the input's shape: no locked
  // heading may survive as a real heading in what we are about to ship.
  if (LOCKED_HEADINGS.some((h) => headingHits(head, h).length > 0)) return null
  return { head }
}
