import { pageMetadata } from '../../lib/page-metadata'
import { A, DocPage, H2, P, Table, UL } from '../_components/DocsKit'

export const metadata = pageMetadata({
  title: 'Licences and Plans: MIT and the AI Canvas Premium License',
  social: 'AI Canvas licences and plans',
  description:
    'What the free MIT library lets you do, what the AI Canvas Premium License covers, and which plan each install needs.',
  url: '/docs/licensing',
})

const TOC = [
  { id: 'two-licences', title: 'Two licences' },
  { id: 'what-needs-what', title: 'What needs what' },
  { id: 'commercial-use', title: 'Commercial use' },
]

export default function LicensingDocPage() {
  return (
    <DocPage
      href="/docs/licensing"
      title="Licences and plans"
      lead="Free components and Andromeda Legacy are open source under MIT. Premium is proprietary: yours to use and ship, not to redistribute."
      toc={TOC}
    >
      <H2 id="two-licences">Two licences</H2>
      <Table
        head={['', 'Free', 'Premium']}
        rows={[
          ['Covers', 'Free components and Andromeda Legacy', 'Premium components, Andromeda Pro, its templates and the AI Brain'],
          ['Licence', 'MIT', <A key="l" href="/premium-license">AI Canvas Premium License</A>],
          ['Source', 'Public, in the open repository', 'Installed into your project with Premium'],
          ['Use and ship', 'Yes, personal and commercial', 'Yes, personal and commercial'],
          ['Redistribute the source', 'Yes, with the MIT licence notice kept', 'No'],
        ]}
      />
      <P>
        Icons are not MIT. The Line icons the free components use are free to use under their own terms; Duotone, Solid and Solid
        duotone come with Premium.
      </P>

      <H2 id="what-needs-what">What needs what</H2>
      <UL>
        <li>No account: browsing, previews, free source, full remix prompts for free components, props.</li>
        <li>Free account: installing free components and Andromeda Legacy components, unlimited.</li>
        <li>
          <A href="/pricing">Premium</A>: Premium components, Andromeda Pro, its templates, the AI Brain and full Premium remix prompts.
        </li>
      </UL>

      <H2 id="commercial-use">Commercial use</H2>
      <P>
        Free components and Andromeda Legacy use MIT, so you can change them and ship them in personal or commercial projects.
        Keep the MIT licence notice in the source; no visible credit is needed. The Line icons they use are free to use under
        their own terms, not MIT. Premium components, Andromeda Pro, its templates and the AI Brain use the AI Canvas Premium
        License, a durable licence to use and ship but not redistribute. Third-party assets, fonts and images follow their own
        terms where a component says so.
      </P>
      <P>
        Prices and plans are on <A href="/pricing">Pricing</A>; the full text is in the{' '}
        <A href="/premium-license">Premium License</A>.
      </P>
    </DocPage>
  )
}
