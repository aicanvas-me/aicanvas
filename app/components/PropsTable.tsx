export interface PropRow {
  name: string
  type: string
  optional: boolean
  default: string
  description: string
}

export interface PropTable {
  table: string
  props: PropRow[]
}

/**
 * The Props documentation section shown on component pages (design-system and
 * standalone). One fixed-column table per @typedef block so stacked/compound
 * tables line up; hides itself when there are no props. Site-chrome styling.
 * Data is generated from each component's @typedef JSDoc, so it never drifts
 * from the code.
 */
export function PropsTable({ propTables }: { propTables: PropTable[] }) {
  if (!propTables.length) return null
  return (
    <section className="mt-12">
      <h2 className="text-base font-bold text-sand-900 dark:text-sand-50">Props</h2>
      <p className="mb-4 mt-1 text-sm text-sand-600 dark:text-sand-400">
        Every prop this component accepts. Any other prop is forwarded to the
        underlying element.
      </p>
      <div className="space-y-8">
        {propTables.map((t) => (
          <div key={t.table}>
            {propTables.length > 1 && (
              <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">
                {t.table}
              </h3>
            )}
            <div className="overflow-x-auto rounded-xl border border-sand-200 dark:border-sand-800">
              {/* table-fixed + shared colgroup: every table on the page uses
                  identical column widths, so stacked tables (compound
                  components) line up and the Description column stays bounded
                  instead of stretching to its own content. */}
              <table className="w-full min-w-[36rem] table-fixed border-collapse text-left text-sm">
                <colgroup>
                  <col className="w-[22%]" />
                  <col className="w-[28%]" />
                  <col className="w-[18%]" />
                  <col className="w-[32%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-sand-200 bg-sand-100 dark:border-sand-800 dark:bg-sand-900">
                    <th className="px-4 py-2.5 font-semibold text-sand-700 dark:text-sand-300">Prop</th>
                    <th className="px-4 py-2.5 font-semibold text-sand-700 dark:text-sand-300">Type</th>
                    <th className="px-4 py-2.5 font-semibold text-sand-700 dark:text-sand-300">Default</th>
                    <th className="px-4 py-2.5 font-semibold text-sand-700 dark:text-sand-300">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {t.props.map((p) => (
                    <tr
                      key={p.name}
                      className="border-b border-sand-200 last:border-0 dark:border-sand-800/60"
                    >
                      <td className="px-4 py-3 align-top">
                        <span className="break-words font-mono text-[13px] font-semibold text-sand-900 dark:text-sand-100">
                          {p.name}
                        </span>
                        {!p.optional && (
                          <span className="ml-1.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-olive-600 dark:text-olive-400">
                            req
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <code className="whitespace-pre-wrap break-words font-mono text-xs text-sand-600 dark:text-sand-400">
                          {p.type}
                        </code>
                      </td>
                      <td className="break-words px-4 py-3 align-top font-mono text-xs text-sand-600 dark:text-sand-400">
                        {p.default || '-'}
                      </td>
                      <td className="px-4 py-3 align-top text-sm text-sand-600 dark:text-sand-400">
                        {p.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
