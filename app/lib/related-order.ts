// Ordering for the related-cards row at the bottom of component pages.

type Rankable = {
  slug: string
  tags: { label: string; accent?: boolean }[]
  useCases?: string[]
}

// A design system's components in their canonical (sidebar) order, starting
// with the ones right after `slug` and wrapping around. The fifth component
// recommends the sixth, seventh, eighth, so every page shows different cards.
export function nextInOrder<T extends { slug: string }>(list: readonly T[], slug: string): T[] {
  const i = list.findIndex((c) => c.slug === slug)
  if (i === -1) return list.filter((c) => c.slug !== slug)
  return [...list.slice(i + 1), ...list.slice(0, i)]
}

// Standalones that share a category with `entry`, most related first: shared
// categories, then shared use cases, then shared distinctive stack tags (a tag
// on half the catalogue or more, like Tailwind CSS, says nothing). Ties go to
// the newest, by the grid's order ledger (oldest first, so a higher index is
// newer).
export function rankRelated<T extends Rankable>(
  entry: T,
  all: readonly T[],
  order: readonly string[],
): T[] {
  const categories = new Set(entry.tags.filter((t) => t.accent).map((t) => t.label))
  const useCases = new Set(entry.useCases ?? [])

  const tagCount = new Map<string, number>()
  for (const c of all) {
    for (const t of c.tags) if (!t.accent) tagCount.set(t.label, (tagCount.get(t.label) ?? 0) + 1)
  }
  const stack = new Set(
    entry.tags
      .filter((t) => !t.accent && (tagCount.get(t.label) ?? 0) < all.length / 2)
      .map((t) => t.label),
  )

  const age = new Map(order.map((slug, i) => [slug, i]))
  const score = (c: T) =>
    c.tags.filter((t) => t.accent && categories.has(t.label)).length * 100 +
    (c.useCases ?? []).filter((u) => useCases.has(u)).length * 10 +
    c.tags.filter((t) => !t.accent && stack.has(t.label)).length

  return all
    .filter((c) => c.slug !== entry.slug && c.tags.some((t) => t.accent && categories.has(t.label)))
    .map((c) => ({ c, s: score(c), a: age.get(c.slug) ?? -1 }))
    .sort((x, y) => y.s - x.s || y.a - x.a)
    .map((x) => x.c)
}
