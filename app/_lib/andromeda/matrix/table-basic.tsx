// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableStyles,
} from '../../../lib/andromeda-v2.generated'
import { tokens } from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

const ROWS = [
  { id: 'AB-00032734', part: 'X60 BJGJ29839281', source: 'US, Denver - 24071', lvl: 66, vol: '10.9985' },
  { id: 'AB-00032612', part: 'X62 BAGJ28599202', source: 'US, New York - 25018', lvl: 86, vol: '7.28699' },
  { id: 'AB-00032736', part: 'X61 BHH09027512', source: 'US, San Francisco - 27381', lvl: 75, vol: '8.85221' },
]

// forceRow is the index that carries the marker. It goes on ONE <tr>, never on
// the canvas: `[data-force] &` is a descendant selector, and a table with every
// row lit reads as broken rather than hovered.
const table = (
  _size: string | undefined,
  { selectedRow, forceRow, force, hoverable = true, sorted }: Record<string, unknown> = {},
) => (
  <div style={{ width: '100%', position: 'relative', background: `var(--at-surface-raised, ${tokens.color.surface.raised})` }}>
    <TableStyles />
    <Table>
      <TableHead>
        {/* When the sort case is on, EVERY header states it. One column
            carrying a caret while the rest carry nothing reads as an odd one
            out rather than as an affordance: the neutral marker is what says
            "this column sorts", and only the active one shows a direction. */}
        <TableRow hoverable={false}>
          <TableHeader sort={sorted ? 'sortable' : undefined}>Order ID</TableHeader>
          <TableHeader sort={sorted ? 'sortable' : undefined}>Part ID</TableHeader>
          <TableHeader sort={sorted ? 'sortable' : undefined}>Source location</TableHeader>
          <TableHeader sort={sorted ? 'asc' : undefined}>Source level</TableHeader>
          <TableHeader sort={sorted ? 'sortable' : undefined}>Total volume</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {ROWS.map((r, i) => (
          <TableRow
            key={r.id}
            hoverable={hoverable}
            selected={selectedRow === i}
            data-force={forceRow === i ? force : undefined}
          >
            <TableCell muted>{r.id}</TableCell>
            <TableCell>{r.part}</TableCell>
            <TableCell muted>{r.source}</TableCell>
            <TableCell>{r.lvl}%</TableCell>
            <TableCell>{r.vol}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
)

export const table_: MatrixSpec = {
  slug: 'table-basic',
  sizes: null,
  wide: true,
  render: table,
  variants: [
    // The default case carries a selected row: selection is the state this
    // table is read for, and a case showing it separately only repeated this
    // one with a single prop moved.
    { label: 'Default', props: { selectedRow: 1 } },
    { label: 'Sortable headers', props: { selectedRow: 1, sorted: true } },
    { label: 'Not hoverable', props: { hoverable: false } },
  ],
  states: [
    // Row hover is a rule in the component's own scoped <style> block, fired
    // here by the companion line that lives beside it in Table.tsx.
    { label: 'Row hover', props: { forceRow: 1, force: 'hover' }, force: 'hover', forceSelf: true },
    {
      label: 'Selected row hover',
      props: { selectedRow: 1, forceRow: 1, force: 'hover' },
      force: 'hover',
      forceSelf: true,
    },
  ],
}
