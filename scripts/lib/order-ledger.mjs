// Pure grid-ordering over the committed order ledger (component-order.json).
//
// The ledger is a COMMITTED oldest-to-newest list of every slug that has appeared
// in the catalog, rendered reversed so the newest push sits on top. It is
// committed rather than recomputed from git at build time because production
// shallow-clones both repos, so add-history is not available in the build. The
// build only APPENDS slugs it has never seen, at the tail.

/**
 * @param {string[]} ledger        committed order, oldest→newest (may have stale/removed slugs)
 * @param {string[]} appendOrder   deterministic order to append never-seen present slugs in
 * @param {Set<string>} presentSet slugs currently listed (free + premium)
 * @returns {{ ledger: string[], gridSlugs: string[], grew: boolean }}
 *          ledger de-duped with unseen present slugs appended (persist this),
 *          gridSlugs present slugs newest-first, grew whether it needs writing
 */
export function reconcileLedger(ledger, appendOrder, presentSet) {
  // De-dupe defensively so a hand-edited ledger cannot double-count a slug and
  // throw off the downstream count assertion.
  const seen = new Set()
  const next = ledger.filter((s) => (seen.has(s) ? false : (seen.add(s), true)))

  let grew = false
  for (const slug of appendOrder) {
    if (presentSet.has(slug) && !seen.has(slug)) {
      next.push(slug)
      seen.add(slug)
      grew = true
    }
  }

  // Present slugs only, so anything hidden or removed drops out, reversed to
  // newest-first.
  const gridSlugs = next.filter((s) => presentSet.has(s)).reverse()
  return { ledger: next, gridSlugs, grew }
}
