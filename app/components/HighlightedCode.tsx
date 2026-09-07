import { codeToHtml } from 'shiki'

interface Props {
  code: string
}

export async function HighlightedCode({ code }: Props) {
  const html = await codeToHtml(code, {
    lang: 'tsx',
    themes: { light: 'github-light', dark: 'github-dark' },
  })

  return (
    <div
      className="font-mono text-[13px] leading-relaxed [&_pre]:!bg-transparent [&_pre]:m-0 [&_pre]:p-0 [&_pre]:whitespace-pre-wrap [&_pre]:break-words dark:[&_pre]:!text-[var(--shiki-dark)] dark:[&_span]:!text-[var(--shiki-dark)]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
