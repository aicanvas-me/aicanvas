import { pageMetadata } from '../../lib/page-metadata'
import { CopyBlock } from '../_components/CopyBlock'
import { A, C, DocPage, H2, Note, OL, P } from '../_components/DocsKit'

export const metadata = pageMetadata({
  title: 'components.json: Connect the @aicanvas Registry',
  social: 'AI Canvas registry setup',
  description:
    'Add the @aicanvas registry and your account token to components.json once, so every shadcn install from AI Canvas is authenticated.',
  url: '/docs/components-json',
})

const TOC = [
  { id: 'the-registry', title: 'The @aicanvas registry' },
  { id: 'add-your-token', title: 'Add your token' },
  { id: 'keep-it-secret', title: 'Keep the token out of git' },
  { id: 'premium', title: 'Premium items' },
]

export default function ComponentsJsonPage() {
  return (
    <DocPage
      href="/docs/components-json"
      title="components.json"
      lead="Tell the shadcn CLI who you are once, and every @aicanvas install in the project is authenticated."
      toc={TOC}
    >
      <H2 id="the-registry">The @aicanvas registry</H2>
      <P>
        <C>@aicanvas</C> is listed in the official{' '}
        <A href="https://ui.shadcn.com/docs/directory">shadcn registry directory</A>, so the CLI knows where to find it with no setup.
        What it needs from you is a token, so it can install for your account.
      </P>

      <H2 id="add-your-token">Add your token</H2>
      <OL>
        <li>
          Sign in and copy your personal token from <A href="/account/settings">Account settings</A>.
        </li>
        <li>
          Put it in <C>.env.local</C> in the project root:
        </li>
      </OL>
      <CopyBlock title=".env.local" label="env line" code="AICANVAS_TOKEN=your-token" />
      <OL>
        <li value={3}>
          Add the registry to <C>components.json</C>. The CLI reads the token from the environment, so the file itself holds no
          secret:
        </li>
      </OL>
      <CopyBlock
        title="components.json"
        label="registry config"
        code={`{
  "registries": {
    "@aicanvas": {
      "url": "https://aicanvas.me/r/{name}.json",
      "params": { "token": "\${AICANVAS_TOKEN}" }
    }
  }
}`}
      />
      <P>
        Merge the <C>registries</C> key into the file you already have; leave the rest as it is. From now on,{' '}
        <C>npx shadcn@latest add @aicanvas/&lt;name&gt;</C> installs for your account.
      </P>

      <H2 id="keep-it-secret">Keep the token out of git</H2>
      <P>
        <C>.env.local</C> is ignored by git in a standard Next.js project. Check that your project ignores it too before you commit.
        Your agent may read the token from there; it only identifies your account to the registry.
      </P>

      <H2 id="premium">Premium items</H2>
      <P>
        The same token unlocks Premium components, design systems and templates when your account has{' '}
        <A href="/pricing">Premium</A>. Nothing else changes in the setup.
      </P>
      <Note>
        Without a token, an install writes a short placeholder file titled &quot;(free account required)&quot; instead of the component.
      </Note>
    </DocPage>
  )
}
