import Link from 'next/link'
import { ArrowRight } from '@/app/_icons'
import { buttonClasses } from './buttonClasses'
import { CtaBand } from './PageKit'
import { CATALOG_TOTAL } from '../lib/catalog-count'

// The homepage's closing band, word for word, for the pages that end on a way
// in (pricing, MCP, about, FAQ). A server component: the count comes from
// source at build time.
export function SiteCta() {
  return (
    <CtaBand
      eyebrow="Ready to build?"
      title="Start with the source, not a blank prompt."
      sub={`${CATALOG_TOTAL}+ components, blocks and templates. Browse them yourself, or connect AI Canvas to the agent you already use.`}
    >
      <Link href="/components" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
        Browse components
        <ArrowRight size={14} />
      </Link>
      <Link href="/mcp" className={buttonClasses({ variant: 'outline', size: 'lg' })}>
        Set up MCP
      </Link>
    </CtaBand>
  )
}
