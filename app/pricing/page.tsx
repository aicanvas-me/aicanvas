import { PageShell } from '../components/PageKit'
import { SiteCta } from '../components/SiteCta'
import { PricingView } from './PricingView'

export default function PricingPage() {
  return (
    <PageShell>
      <PricingView />
      <SiteCta />
    </PageShell>
  )
}
