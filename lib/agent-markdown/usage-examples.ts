// Usage examples for the design-system Markdown pages, keyed `<system>/<slug>`.
// Each one: the import line(s), then the smallest real JSX that uses the component.
export const USAGE_EXAMPLES: Record<string, string> = {
  'andromeda/alert': `import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from '@/components/aicanvas/andromeda/components/Alert'
import { Info } from '@/components/icons/info'

<Alert variant="accent">
  <AlertIcon><Info size="1em" /></AlertIcon>
  <AlertContent>
    <AlertTitle>Deployment complete</AlertTitle>
    <AlertDescription>The production build is now live.</AlertDescription>
  </AlertContent>
</Alert>`,
  'andromeda/avatar': `import { Avatar } from '@/components/aicanvas/andromeda/components/Avatar'

<Avatar name="Mira Chen" size="md" status="online" />`,
  'andromeda/badge': `import { Badge } from '@/components/aicanvas/andromeda/components/Badge'

<Badge variant="accent">Paid</Badge>`,
  'andromeda/button': `import { Button } from '@/components/aicanvas/andromeda/components/Button'

<Button variant="default" size="md">Deploy changes</Button>`,
  'andromeda/card': `import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/aicanvas/andromeda/components/Card'
import { Button } from '@/components/aicanvas/andromeda/components/Button'

<Card variant="glow">
  <CardHeader>
    <CardTitle>Production deploy</CardTitle>
  </CardHeader>
  <CardContent>
    <CardDescription>Version 2.4 is ready to release.</CardDescription>
  </CardContent>
  <CardFooter>
    <Button size="sm" variant="outline">View details</Button>
  </CardFooter>
</Card>`,
  'andromeda/checkbox': `import { Checkbox } from '@/components/aicanvas/andromeda/components/Checkbox'

<Checkbox label="Include archived invoices" defaultChecked />`,
  'andromeda/corner-markers': `import { CornerMarkers } from '@/components/aicanvas/andromeda/components/CornerMarkers'

<div style={{ position: 'relative', padding: 24 }}>
  <CornerMarkers size={16} />
  Deployment summary
</div>`,
  'andromeda/data-table': `import { DataTable } from '@/components/aicanvas/andromeda/components/DataTable'

<DataTable
  columns={[
    { key: 'invoice', header: 'Invoice', primary: true },
    { key: 'total', header: 'Total', align: 'right' },
  ]}
  rows={[{ id: 1, invoice: 'INV-2048', total: '$240.00' }, { id: 2, invoice: 'INV-2049', total: '$85.00' }]}
  getRowKey={(row) => String(row.id)}
/>`,
  'andromeda/date-range-picker': `import { useState } from 'react'
import { DateRangePicker } from '@/components/aicanvas/andromeda/components/DateRangePicker'

const [range, setRange] = useState({ start: new Date(2026, 10, 1), end: new Date(2026, 10, 30) });

<DateRangePicker value={range} onChange={setRange} presetLabel="This month" />`,
  'andromeda/drawer': `import { useState } from 'react'
import { Drawer, DrawerBody, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/aicanvas/andromeda/components/Drawer'
import { Button } from '@/components/aicanvas/andromeda/components/Button'

const [open, setOpen] = useState(false);

<>
  <Button onClick={() => setOpen(true)}>Review deploy</Button>
  <Drawer open={open} onOpenChange={setOpen} side="right">
    <DrawerHeader>
      <DrawerTitle>Deploy changes</DrawerTitle>
      <DrawerDescription>Review the production release.</DrawerDescription>
    </DrawerHeader>
    <DrawerBody><p>Version 2.4 includes three approved changes.</p></DrawerBody>
    <DrawerFooter>
      <Button onClick={() => setOpen(false)}>Confirm deploy</Button>
    </DrawerFooter>
  </Drawer>
</>`,
  'andromeda/empty-state': `import { EmptyState, EmptyStateAction, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle } from '@/components/aicanvas/andromeda/components/EmptyState'
import { MailOpen } from '@/components/icons/mail-open'
import { Button } from '@/components/aicanvas/andromeda/components/Button'

<EmptyState>
  <EmptyStateIcon><MailOpen size="1em" /></EmptyStateIcon>
  <EmptyStateTitle>No invoices yet</EmptyStateTitle>
  <EmptyStateDescription>New invoices will appear here.</EmptyStateDescription>
  <EmptyStateAction>
    <Button size="sm">Create invoice</Button>
  </EmptyStateAction>
</EmptyState>`,
  'andromeda/gauge': `import { Gauge } from '@/components/aicanvas/andromeda/components/Gauge'

<Gauge value={72} max={100} label="Storage" unit="%" variant="warning" />`,
  'andromeda/heat-grid': `import { HeatGrid } from '@/components/aicanvas/andromeda/components/HeatGrid'

<HeatGrid value={68} label="Weekly capacity" unit="%" />`,
  'andromeda/icon-button': `import { IconButton } from '@/components/aicanvas/andromeda/components/IconButton'
import { Gear } from '@/components/icons/gear'

<IconButton icon={Gear} aria-label="Deployment settings" variant="ghost" />`,
  'andromeda/input': `import { Input } from '@/components/aicanvas/andromeda/components/Input'

<Input label="Invoice number" placeholder="INV-2048" />`,
  'andromeda/media-card': `import { MediaCard } from '@/components/aicanvas/andromeda/components/MediaCard'

<MediaCard code="REPORT-04" title="Quarterly report" meta="Updated today" action="cta" ctaLabel="Open" />`,
  'andromeda/metric-chart': `import { MetricChart } from '@/components/aicanvas/andromeda/components/MetricChart'

<MetricChart
  label="Deploy duration"
  title="Build time"
  data={[{ t: 'Mon', v: 42 }, { t: 'Tue', v: 38 }, { t: 'Wed', v: 35 }]}
  unit="s"
/>`,
  'andromeda/music-player': `import { MusicPlayer } from '@/components/aicanvas/andromeda/components/MusicPlayer'

<MusicPlayer track={{ title: 'Focus session', subtitle: 'Instrumental', cover: null }} playing={false} duration={184} />`,
  'andromeda/nav-item': `import { NavItem } from '@/components/aicanvas/andromeda/components/NavItem'
import { Compass } from '@/components/icons/compass'

<NavItem icon={Compass} label="Overview" active />`,
  'andromeda/panel-header': `import { PanelHeader } from '@/components/aicanvas/andromeda/components/PanelHeader'
import { Button } from '@/components/aicanvas/andromeda/components/Button'

<PanelHeader title="Deployments" actions={<Button size="sm">New deploy</Button>} />`,
  'andromeda/panel-menu': `import { PanelMenu } from '@/components/aicanvas/andromeda/components/PanelMenu'

<PanelMenu
  ariaLabel="Invoice actions"
  items={[
    { label: 'Refresh', onSelect: () => window.location.reload() },
    { label: 'Print', onSelect: () => window.print() },
  ]}
/>`,
  'andromeda/planet': `import { Planet } from '@/components/aicanvas/andromeda/components/Planet'

<div style={{ position: 'relative', width: 320, height: 320 }}>
  <Planet particleCount={4000} />
</div>`,
  'andromeda/progress-bar': `import { ProgressBar } from '@/components/aicanvas/andromeda/components/ProgressBar'

<ProgressBar label="Files uploaded" value={68} variant="default" />`,
  'andromeda/radar-chart': `import { RadarChart } from '@/components/aicanvas/andromeda/components/RadarChart'

<RadarChart
  title="Release readiness"
  data={[{ axis: 'Tests', score: 92 }, { axis: 'Docs', score: 74 }, { axis: 'Review', score: 86 }]}
  series={[{ key: 'score', label: 'Readiness' }]}
/>`,
  'andromeda/radio': `import { Radio, RadioGroup } from '@/components/aicanvas/andromeda/components/Radio'

<RadioGroup name="deploy-target" defaultValue="staging">
  <Radio value="staging" label="Staging" />
  <Radio value="production" label="Production" />
</RadioGroup>`,
  'andromeda/search-field': `import SearchField from '@/components/aicanvas/andromeda/components/SearchField'

<SearchField placeholder="Search invoices" shortcut="⌘ K" />`,
  'andromeda/segmented-control': `import { useState } from 'react'
import { SegmentedControl } from '@/components/aicanvas/andromeda/components/SegmentedControl'

const [period, setPeriod] = useState('week');

<SegmentedControl
  value={period}
  onChange={setPeriod}
  options={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]}
/>`,
  'andromeda/slider': `import { Slider } from '@/components/aicanvas/andromeda/components/Slider'

<Slider label="Alert threshold" defaultValue={75} min={0} max={100} unit="%" />`,
  'andromeda/spinner': `import { Spinner } from '@/components/aicanvas/andromeda/components/Spinner'

<Spinner size="md" variant="accent" label="Deploying" />`,
  'andromeda/stat-tile': `import { StatTile } from '@/components/aicanvas/andromeda/components/StatTile'

<StatTile label="Open invoices" value={24} delta={8.3} deltaLabel="this month" code="INV-01" />`,
  'andromeda/table': `import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableStyles } from '@/components/aicanvas/andromeda/components/Table'

<>
  <TableStyles />
  <Table>
    <TableHead><TableRow hoverable={false}>
        <TableHeader>Invoice</TableHeader>
        <TableHeader align="right">Total</TableHeader>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell>INV-2048</TableCell>
        <TableCell align="right">$240.00</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</>`,
  'andromeda/tag': `import { useState } from 'react'
import { Tag } from '@/components/aicanvas/andromeda/components/Tag'

const [visible, setVisible] = useState(true);

visible && <Tag variant="accent" onClose={() => setVisible(false)}>Paid</Tag>`,
  'andromeda/textarea': `import { Textarea } from '@/components/aicanvas/andromeda/components/Textarea'

<Textarea label="Deployment notes" placeholder="Describe this release" rows={4} />`,
  'andromeda/toggle': `import { Toggle } from '@/components/aicanvas/andromeda/components/Toggle'

<Toggle label="Automatic deploys" defaultChecked />`,
  'andromeda/tooltip': `import { Tooltip } from '@/components/aicanvas/andromeda/components/Tooltip'

<Tooltip label="Copy invoice number" position="top">
  <button type="button">INV-2048</button>
</Tooltip>`,
  'andromeda/trend-chart': `import { TrendChart } from '@/components/aicanvas/andromeda/components/TrendChart'

<TrendChart
  title="Weekly deploys"
  data={[{ day: 'Mon', completed: 8 }, { day: 'Tue', completed: 12 }, { day: 'Wed', completed: 10 }]}
  xKey="day"
  series={[{ key: 'completed', label: 'Completed', role: 'live' }]}
/>`,
  'andromeda/user-card': `import { UserCard } from '@/components/aicanvas/andromeda/components/UserCard'

<UserCard
  name="Mira Chen"
  role="Release manager"
  status="online"
  items={[{ id: 'profile', label: 'Profile' }, { id: 'signout', label: 'Sign out' }]}
/>`,
  'andromeda/user-menu': `import { UserMenu } from '@/components/aicanvas/andromeda/components/UserMenu'

<UserMenu
  name="Mira Chen"
  status="online"
  items={[{ id: 'profile', label: 'Profile' }, { id: 'signout', label: 'Sign out' }]}
/>`,
  'andromeda/waveform': `import { Waveform } from '@/components/aicanvas/andromeda/components/Waveform'

<Waveform height={96} amplitude={0.5} showBars />`,
  'andromeda-pro/accordion': `import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/aicanvas/andromeda-pro/components/Accordion'

<Accordion type="single" defaultValue="billing">
  <AccordionItem value="billing">
    <AccordionTrigger>When is an invoice due?</AccordionTrigger>
    <AccordionContent>Invoices are due 30 days after issue.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="payment">
    <AccordionTrigger>Which payments are accepted?</AccordionTrigger>
    <AccordionContent>Bank transfer and card payments are accepted.</AccordionContent>
  </AccordionItem>
</Accordion>`,
  'andromeda-pro/alert': `import { Alert, AlertContent, AlertDescription, AlertIcon, AlertTitle } from '@/components/aicanvas/andromeda-pro/components/Alert'
import { TriangleAlert } from '@/components/icons/triangle-alert'

<Alert variant="warning">
  <AlertIcon><TriangleAlert size="1em" /></AlertIcon>
  <AlertContent>
    <AlertTitle>Deployment paused</AlertTitle>
    <AlertDescription>Two checks still need approval.</AlertDescription>
  </AlertContent>
</Alert>`,
  'andromeda-pro/artifact': `import { useState } from 'react'
import { Artifact, ArtifactAction, ArtifactActions, ArtifactClose, ArtifactContent, ArtifactDescription, ArtifactHeader, ArtifactTitle } from '@/components/aicanvas/andromeda-pro/components/Artifact'
import { Download } from '@/components/icons/download'

const [open, setOpen] = useState(true);

open && <Artifact>
  <ArtifactHeader>
    <ArtifactTitle>Invoice export</ArtifactTitle>
    <ArtifactDescription>24 invoices prepared as CSV</ArtifactDescription>
    <ArtifactActions>
      <ArtifactAction label="Download CSV" icon={Download} onClick={() => window.location.assign('/exports/invoices.csv')} />
      <ArtifactClose onClick={() => setOpen(false)} />
    </ArtifactActions>
  </ArtifactHeader>
  <ArtifactContent>
    <p>The export includes paid and outstanding invoices.</p>
  </ArtifactContent>
</Artifact>`,
  'andromeda-pro/avatar': `import { Avatar } from '@/components/aicanvas/andromeda-pro/components/Avatar'

<Avatar name="Mira Chen" size="lg" status="online" />`,
  'andromeda-pro/badge': `import { Badge } from '@/components/aicanvas/andromeda-pro/components/Badge'

<Badge variant="success" size="md">Paid</Badge>`,
  'andromeda-pro/bento-grid': `import { BentoGrid, BentoGridItem } from '@/components/aicanvas/andromeda-pro/components/BentoGrid'

<BentoGrid columns={2}>
  <BentoGridItem><section>Open invoices</section></BentoGridItem>
  <BentoGridItem><section>Monthly revenue</section></BentoGridItem>
  <BentoGridItem colSpan="full"><section>Recent payments</section></BentoGridItem>
</BentoGrid>`,
  'andromeda-pro/burst': `import { Burst } from '@/components/aicanvas/andromeda-pro/components/Burst'

<div style={{ position: 'relative', width: 320, height: 240 }}>
  <Burst density="standard" variant="symmetry" />
</div>`,
  'andromeda-pro/button': `import { Button } from '@/components/aicanvas/andromeda-pro/components/Button'

<Button variant="default" size="md">Create invoice</Button>`,
  'andromeda-pro/card': `import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/aicanvas/andromeda-pro/components/Card'
import { Button } from '@/components/aicanvas/andromeda-pro/components/Button'

<Card bordered>
  <CardHeader>
    <CardTitle>Invoice INV-2048</CardTitle>
  </CardHeader>
  <CardContent>
    <CardDescription>Payment is due on November 30.</CardDescription>
  </CardContent>
  <CardFooter>
    <Button size="sm" variant="outline">View invoice</Button>
  </CardFooter>
</Card>`,
  'andromeda-pro/chart-funnel': `import { FunnelChart } from '@/components/aicanvas/andromeda-pro/components/FunnelChart'

<FunnelChart
  stages={[
    { id: 'visited', label: 'Visited', value: 1200, tone: 'neutral' },
    { id: 'started', label: 'Started checkout', value: 460, tone: 'accent' },
    { id: 'paid', label: 'Paid', value: 280, tone: 'accent' },
  ]}
  percentOf="previous"
/>`,
  'andromeda-pro/chart-metric': `import { MetricChart } from '@/components/aicanvas/andromeda-pro/components/MetricChart'

<MetricChart
  label="Invoice volume"
  title="Invoices created"
  data={[{ day: 'Mon', count: 18 }, { day: 'Tue', count: 24 }, { day: 'Wed', count: 21 }]}
  xKey="day"
  dataKey="count"
/>`,
  'andromeda-pro/chart-radar': `import { RadarChart } from '@/components/aicanvas/andromeda-pro/components/RadarChart'

<RadarChart
  title="Release readiness"
  data={[{ axis: 'Tests', score: 92 }, { axis: 'Docs', score: 74 }, { axis: 'Review', score: 86 }]}
  series={[{ key: 'score', label: 'Readiness' }]}
/>`,
  'andromeda-pro/chart-trend': `import { TrendChart } from '@/components/aicanvas/andromeda-pro/components/TrendChart'

<TrendChart
  title="Invoice totals"
  data={[{ month: 'Sep', total: 8400 }, { month: 'Oct', total: 9200 }, { month: 'Nov', total: 10800 }]}
  xKey="month"
  series={[{ key: 'total', label: 'Total', role: 'live' }]}
  defaultMode="area"
/>`,
  'andromeda-pro/checkbox': `import { Checkbox } from '@/components/aicanvas/andromeda-pro/components/Checkbox'

<Checkbox label="Email a receipt" description="Send a copy after payment." size="lg" defaultChecked />`,
  'andromeda-pro/choice-card': `import { ChoiceCard, ChoiceCardGroup } from '@/components/aicanvas/andromeda-pro/components/ChoiceCard'

<ChoiceCardGroup name="deploy-mode" defaultValue="automatic" aria-label="Deployment mode">
  <ChoiceCard
    control="radio"
    value="automatic"
    title="Automatic"
    description="Deploy every approved change."
  />
  <ChoiceCard control="radio" value="manual" title="Manual" description="Confirm each deployment." />
</ChoiceCardGroup>`,
  'andromeda-pro/collapsible': `import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/aicanvas/andromeda-pro/components/Collapsible'

<Collapsible defaultOpen>
  <CollapsibleTrigger meta="3 checks">Deployment checks</CollapsibleTrigger>
  <CollapsibleContent guide>
    Tests, review, and security checks passed.
  </CollapsibleContent>
</Collapsible>`,
  'andromeda-pro/combobox': `import { useState } from 'react'
import Combobox from '@/components/aicanvas/andromeda-pro/components/Combobox'

const [assignee, setAssignee] = useState('');

<Combobox
  value={assignee}
  onValueChange={setAssignee}
  onSelect={(option) => setAssignee(option.label)}
  options={[{ id: 'mira', label: 'Mira Chen' }, { id: 'sam', label: 'Sam Rivera' }]}
  placeholder="Assign a team member"
  clearOnSelect={false}
/>`,
  'andromeda-pro/corner-markers': `import { CornerMarkers } from '@/components/aicanvas/andromeda-pro/components/CornerMarkers'

<div style={{ position: 'relative', padding: 24 }}>
  <CornerMarkers size={16} offset={4} />
  Invoice summary
</div>`,
  'andromeda-pro/cube': `import { Cube } from '@/components/aicanvas/andromeda-pro/components/Cube'

<div style={{ position: 'relative', width: 320, height: 240 }}>
  <Cube density="dense" />
</div>`,
  'andromeda-pro/date-range-picker': `import { useState } from 'react'
import { DateRangePicker } from '@/components/aicanvas/andromeda-pro/components/DateRangePicker'

const [range, setRange] = useState({ start: new Date(2026, 10, 1), end: new Date(2026, 10, 30) });

<DateRangePicker value={range} onChange={setRange} presetLabel="This month" />`,
  'andromeda-pro/drawer': `import { useState } from 'react'
import { Drawer, DrawerBody, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/aicanvas/andromeda-pro/components/Drawer'
import { Button } from '@/components/aicanvas/andromeda-pro/components/Button'

const [open, setOpen] = useState(false);

<>
  <Button onClick={() => setOpen(true)}>Edit invoice</Button>
  <Drawer open={open} onOpenChange={setOpen} side="right">
    <DrawerHeader>
      <DrawerTitle>Edit invoice</DrawerTitle>
      <DrawerDescription>Update the due date and payment terms.</DrawerDescription>
    </DrawerHeader>
    <DrawerBody><p>Invoice INV-2048 is due November 30.</p></DrawerBody>
    <DrawerFooter>
      <Button onClick={() => setOpen(false)}>Save changes</Button>
    </DrawerFooter>
  </Drawer>
</>`,
  'andromeda-pro/empty-state': `import { EmptyState, EmptyStateAction, EmptyStateDescription, EmptyStateIcon, EmptyStateTitle } from '@/components/aicanvas/andromeda-pro/components/EmptyState'
import { MailOpen } from '@/components/icons/mail-open'
import { Button } from '@/components/aicanvas/andromeda-pro/components/Button'

<EmptyState variant="outline">
  <EmptyStateIcon><MailOpen size="1em" /></EmptyStateIcon>
  <EmptyStateTitle>No invoices yet</EmptyStateTitle>
  <EmptyStateDescription>Create an invoice to start tracking payments.</EmptyStateDescription>
  <EmptyStateAction>
    <Button size="sm">Create invoice</Button>
  </EmptyStateAction>
</EmptyState>`,
  'andromeda-pro/footer': `import { Footer } from '@/components/aicanvas/andromeda-pro/components/Footer'

<Footer
  brand="Workspace"
  description="Manage invoices, payments, and reports."
  columns={[
    { title: 'Product', links: [{ label: 'Invoices', href: '/invoices' }, { label: 'Reports', href: '/reports' }] },
    { title: 'Support', links: [{ label: 'Help center', href: '/help' }, { label: 'Contact', href: '/contact' }] },
  ]}
  wordmark="Workspace"
  legal="© 2026 All rights reserved."
/>`,
  'andromeda-pro/gauge': `import { Gauge } from '@/components/aicanvas/andromeda-pro/components/Gauge'

<Gauge value={82} max={100} label="Storage" unit="%" thresholds={{ warning: 70, fault: 90 }} />`,
  'andromeda-pro/heat-grid': `import { HeatGrid } from '@/components/aicanvas/andromeda-pro/components/HeatGrid'

<HeatGrid value={64} label="Weekly capacity" unit="%" cols={7} rows={5} />`,
  'andromeda-pro/icon-button': `import { IconButton } from '@/components/aicanvas/andromeda-pro/components/IconButton'
import { Gear } from '@/components/icons/gear'

<IconButton icon={Gear} aria-label="Invoice settings" variant="ghost" size="md" />`,
  'andromeda-pro/input': `import { Input } from '@/components/aicanvas/andromeda-pro/components/Input'

<Input label="Invoice number" placeholder="INV-2048" hint="Use the next number in sequence." required />`,
  'andromeda-pro/item': `import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/aicanvas/andromeda-pro/components/Item'
import { FileSpreadsheet } from '@/components/icons/file-spreadsheet'

<Item variant="outline">
  <ItemMedia variant="icon"><FileSpreadsheet size="1em" /></ItemMedia>
  <ItemContent>
    <ItemTitle>invoice-export.csv</ItemTitle>
    <ItemDescription>24 rows, updated today</ItemDescription>
  </ItemContent>
  <ItemActions>Ready</ItemActions>
</Item>`,
  'andromeda-pro/logo-cloud': `import { LogoCloud } from '@/components/aicanvas/andromeda-pro/components/LogoCloud'

<LogoCloud
  label="Used across the workspace"
  logos={[{ name: 'Analytics' }, { name: 'Billing' }, { name: 'Support' }]}
/>`,
  'andromeda-pro/marquee': `import { Marquee } from '@/components/aicanvas/andromeda-pro/components/Marquee'

<Marquee aria-label="Workspace tools" separator>
  <span>Invoices</span>
  <span>Payments</span>
  <span>Reports</span>
</Marquee>`,
  'andromeda-pro/media-card': `import { MediaCard } from '@/components/aicanvas/andromeda-pro/components/MediaCard'

<MediaCard layout="stacked" code="REPORT-04" title="Quarterly report" meta="Updated today" action="cta" ctaLabel="Open" />`,
  'andromeda-pro/message': `import { Message, MessageActions, MessageAvatar, MessageContent } from '@/components/aicanvas/andromeda-pro/components/Message'
import { Sparkle } from '@/components/icons/sparkle'

<Message from="assistant">
  <MessageAvatar><Sparkle size={18} /></MessageAvatar>
  <MessageContent>
    Three invoices are overdue. The oldest was due 12 days ago.
  </MessageContent>
  <MessageActions meta="4 s" />
</Message>`,
  'andromeda-pro/music-player': `import { MusicPlayer } from '@/components/aicanvas/andromeda-pro/components/MusicPlayer'

<MusicPlayer track={{ title: 'Focus session', subtitle: 'Instrumental', cover: null }} playing={false} duration={184} />`,
  'andromeda-pro/nav-item': `import { NavItem } from '@/components/aicanvas/andromeda-pro/components/NavItem'
import { Compass } from '@/components/icons/compass'

<NavItem icon={Compass} label="Overview" active />`,
  'andromeda-pro/navbar': `import { Navbar } from '@/components/aicanvas/andromeda-pro/components/Navbar'

<Navbar
  brand="Workspace"
  links={[{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }]}
  sticky
/>`,
  'andromeda-pro/nodes': `import { Nodes } from '@/components/aicanvas/andromeda-pro/components/Nodes'

<div style={{ position: 'relative', width: 320, height: 240 }}>
  <Nodes variant="dense" emphasis="subject" />
</div>`,
  'andromeda-pro/orb': `import { Orb } from '@/components/aicanvas/andromeda-pro/components/Orb'

<div style={{ position: 'relative', width: 320, height: 320 }}>
  <Orb density="default" />
</div>`,
  'andromeda-pro/panel-header': `import { PanelHeader } from '@/components/aicanvas/andromeda-pro/components/PanelHeader'
import { Button } from '@/components/aicanvas/andromeda-pro/components/Button'

<PanelHeader title="Invoices" titleAs="h2" size="lg" actions={<Button size="sm">Create invoice</Button>} />`,
  'andromeda-pro/panel-menu': `import { PanelMenu } from '@/components/aicanvas/andromeda-pro/components/PanelMenu'

<PanelMenu
  ariaLabel="Invoice actions"
  size="md"
  items={[
    { label: 'Refresh', onSelect: () => window.location.reload() },
    { label: 'Print', onSelect: () => window.print() },
  ]}
/>`,
  'andromeda-pro/payment-card': `import { PaymentCard } from '@/components/aicanvas/andromeda-pro/components/PaymentCard'

<PaymentCard kind="Business debit" label="Operations" last4="4821" expiry="09/29" tone="steel" />`,
  'andromeda-pro/planet': `import { Planet } from '@/components/aicanvas/andromeda-pro/components/Planet'

<div style={{ position: 'relative', width: 320, height: 320 }}>
  <Planet variant="mantle" particleCount={4000} />
</div>`,
  'andromeda-pro/popover': `import { Popover, PopoverContent, PopoverLabel, PopoverSeparator, PopoverTrigger } from '@/components/aicanvas/andromeda-pro/components/Popover'
import { Button } from '@/components/aicanvas/andromeda-pro/components/Button'

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">View payment terms</Button>
  </PopoverTrigger>
  <PopoverContent side="bottom" align="start" width={240}>
    <PopoverLabel>Payment terms</PopoverLabel>
    <PopoverSeparator />
    <p>Payment is due 30 days after issue.</p>
  </PopoverContent>
</Popover>`,
  'andromeda-pro/pricing-card': `import { PricingCard, PricingGrid } from '@/components/aicanvas/andromeda-pro/components/PricingCard'

<PricingGrid columns={2}>
  <PricingCard
    name="Starter"
    price={0}
    period="per month"
    features={['Three invoices', 'Email support']}
    cta="Choose Starter"
  />
  <PricingCard name="Team" price={29} period="per month" features={['Unlimited invoices', 'Team approvals']} cta="Choose Team" featured />
</PricingGrid>`,
  'andromeda-pro/progress-bar': `import { ProgressBar } from '@/components/aicanvas/andromeda-pro/components/ProgressBar'

<ProgressBar label="Files uploaded" value={68} thresholds={{ warning: 75, fault: 90 }} />`,
  'andromeda-pro/prompt-input': `import { PromptInput, PromptInputSubmit, PromptInputTextarea, PromptInputToolbar, PromptInputTools } from '@/components/aicanvas/andromeda-pro/components/PromptInput'
import { IconButton } from '@/components/aicanvas/andromeda-pro/components/IconButton'
import { Paperclip } from '@/components/icons/paperclip'

<PromptInput onSubmit={(event) => event.preventDefault()}>
  <PromptInputTextarea placeholder="Ask about overdue invoices" />
  <PromptInputToolbar>
    <PromptInputTools>
      <IconButton icon={Paperclip} aria-label="Attach file" size="sm" variant="ghost" />
    </PromptInputTools>
    <PromptInputSubmit />
  </PromptInputToolbar>
</PromptInput>`,
  'andromeda-pro/radio': `import { Radio, RadioGroup } from '@/components/aicanvas/andromeda-pro/components/Radio'

<RadioGroup name="invoice-status" defaultValue="draft">
  <Radio value="draft" label="Draft" description="Keep editing before sending." />
  <Radio value="sent" label="Sent" description="Mark the invoice as delivered." />
</RadioGroup>`,
  'andromeda-pro/search-field': `import SearchField from '@/components/aicanvas/andromeda-pro/components/SearchField'

<SearchField size="lg" placeholder="Search invoices" shortcut="⌘ K" />`,
  'andromeda-pro/section-heading': `import { SectionHeading } from '@/components/aicanvas/andromeda-pro/components/SectionHeading'

<SectionHeading
  eyebrow="Billing"
  title="Invoices"
  description="Create, send, and track customer invoices."
  align="left"
/>`,
  'andromeda-pro/segmented-control': `import { useState } from 'react'
import { SegmentedControl } from '@/components/aicanvas/andromeda-pro/components/SegmentedControl'

const [period, setPeriod] = useState('week');

<SegmentedControl
  ariaLabel="Reporting period"
  value={period}
  onChange={setPeriod}
  options={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]}
/>`,
  'andromeda-pro/sidebar': `import { useState } from 'react'
import { Sidebar } from '@/components/aicanvas/andromeda-pro/components/Sidebar'
import { Compass } from '@/components/icons/compass'
import { Gear } from '@/components/icons/gear'

const [active, setActive] = useState('Overview');

<Sidebar
  title="Workspace"
  items={[
    { label: 'Overview', icon: Compass, active: active === 'Overview', onClick: () => setActive('Overview') },
    { label: 'Settings', icon: Gear, active: active === 'Settings', onClick: () => setActive('Settings') },
  ]}
/>`,
  'andromeda-pro/skeleton': `import { Skeleton } from '@/components/aicanvas/andromeda-pro/components/Skeleton'

<Skeleton size="md" widths={['100%', '82%', '56%']} aria-label="Loading invoice" />`,
  'andromeda-pro/slider': `import { Slider } from '@/components/aicanvas/andromeda-pro/components/Slider'

<Slider label="Alert threshold" size="lg" defaultValue={75} min={0} max={100} unit="%" />`,
  'andromeda-pro/spinner': `import { Spinner } from '@/components/aicanvas/andromeda-pro/components/Spinner'

<Spinner size="md" variant="accent" label="Creating invoice" />`,
  'andromeda-pro/stat-tile': `import { StatTile } from '@/components/aicanvas/andromeda-pro/components/StatTile'

<StatTile label="Outstanding" value={12840} prefix="$" delta={-4.2} polarity="lower-is-better" size="lg" />`,
  'andromeda-pro/stepper': `import { Stepper, StepperDescription, StepperItem, StepperMeta, StepperTitle } from '@/components/aicanvas/andromeda-pro/components/Stepper'

<Stepper activeStep={1} aria-label="Invoice delivery">
  <StepperItem>
    <StepperTitle>Invoice created</StepperTitle>
    <StepperDescription>Draft saved for review.</StepperDescription>
    <StepperMeta>09:30</StepperMeta>
  </StepperItem>
  <StepperItem>
    <StepperTitle>Invoice sent</StepperTitle>
    <StepperDescription>Waiting for payment.</StepperDescription>
    <StepperMeta>10:15</StepperMeta>
  </StepperItem>
</Stepper>`,
  'andromeda-pro/strength-meter': `import { StrengthMeter } from '@/components/aicanvas/andromeda-pro/components/StrengthMeter'

<StrengthMeter value="correct-horse-47-staple" minLength={12} strongLength={16} />`,
  'andromeda-pro/suggestion': `import { Suggestion } from '@/components/aicanvas/andromeda-pro/components/Suggestion'

<Suggestion size="md" onClick={() => window.location.assign('/invoices?status=overdue')}>
  Show overdue invoices
</Suggestion>`,
  'andromeda-pro/table-basic': `import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/aicanvas/andromeda-pro/components/Table'

<Table>
  <TableHead>
    <TableRow hoverable={false}>
      <TableHeader>Invoice</TableHeader>
      <TableHeader align="right">Total</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>INV-2048</TableCell>
      <TableCell align="right">$240.00</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
  'andromeda-pro/table-data': `import { DataTable } from '@/components/aicanvas/andromeda-pro/components/DataTable'

<DataTable
  columns={[
    { key: 'invoice', header: 'Invoice', primary: true, sortable: true },
    { key: 'total', header: 'Total', align: 'right', sortable: true },
  ]}
  rows={[{ id: 1, invoice: 'INV-2048', total: 240 }, { id: 2, invoice: 'INV-2049', total: 85 }]}
  getRowKey={(row) => String(row.id)}
  defaultSort={{ key: 'invoice', dir: 'asc' }}
/>`,
  'andromeda-pro/tabs': `import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/aicanvas/andromeda-pro/components/Tabs'

<Tabs defaultValue="details">
  <TabsList aria-label="Invoice sections">
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
  </TabsList>
  <TabsContent value="details">
    Payment is due on November 30.
  </TabsContent>
  <TabsContent value="activity">
    The invoice was sent today.
  </TabsContent>
</Tabs>`,
  'andromeda-pro/tag': `import { useState } from 'react'
import { Tag } from '@/components/aicanvas/andromeda-pro/components/Tag'

const [visible, setVisible] = useState(true);

visible && <Tag variant="accent" size="md" onClose={() => setVisible(false)}>Paid</Tag>`,
  'andromeda-pro/textarea': `import { Textarea } from '@/components/aicanvas/andromeda-pro/components/Textarea'

<Textarea label="Invoice note" size="lg" placeholder="Add payment instructions" autoGrow maxRows={8} />`,
  'andromeda-pro/toggle': `import { Toggle } from '@/components/aicanvas/andromeda-pro/components/Toggle'

<Toggle label="Automatic reminders" size="lg" defaultChecked />`,
  'andromeda-pro/tool': `import { Tool } from '@/components/aicanvas/andromeda-pro/components/Tool'

<Tool title="Checked overdue invoices" status="done" duration={1.8} defaultOpen>
  <p>Three overdue invoices were found.</p>
</Tool>`,
  'andromeda-pro/tooltip': `import { Tooltip } from '@/components/aicanvas/andromeda-pro/components/Tooltip'

<Tooltip label="Copy invoice number" position="top">
  <button type="button">INV-2048</button>
</Tooltip>`,
  'andromeda-pro/top-bar': `import { useState } from 'react'
import { TopBar } from '@/components/aicanvas/andromeda-pro/components/TopBar'

const [active, setActive] = useState('Invoices');

<TopBar
  wordmark="Workspace"
  links={['Invoices', 'Payments'].map((label) => ({ label, active: label === active, onClick: () => setActive(label) }))}
/>`,
  'andromeda-pro/user-card': `import { UserCard } from '@/components/aicanvas/andromeda-pro/components/UserCard'

<UserCard
  name="Mira Chen"
  role="Release manager"
  status="online"
  size="md"
  items={[{ id: 'profile', label: 'Profile' }, { id: 'signout', label: 'Sign out' }]}
/>`,
  'andromeda-pro/user-menu': `import { UserMenu } from '@/components/aicanvas/andromeda-pro/components/UserMenu'

<UserMenu
  name="Mira Chen"
  status="online"
  size="md"
  items={[{ id: 'profile', label: 'Profile' }, { id: 'signout', label: 'Sign out' }]}
/>`,
  'andromeda-pro/waveform': `import { Waveform } from '@/components/aicanvas/andromeda-pro/components/Waveform'

<Waveform height={96} amplitude={0.5} showBars />`,
}
