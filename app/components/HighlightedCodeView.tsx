'use client'

// Client renderer for an already-highlighted Shiki HTML string (produced by the
// gated /api/component-code endpoint in enforce mode). Mirrors the wrapper
// styling of HighlightedCode so runtime-fetched source matches the build-time
// highlighted look. The HTML comes from our own server (Shiki output), not user
// input, so dangerouslySetInnerHTML is safe here.
export function HighlightedCodeView({ html }: { html: string }) {
  return (
    <div
      className="font-mono text-[13px] leading-relaxed [&_pre]:!bg-transparent [&_pre]:m-0 [&_pre]:p-0 [&_pre]:whitespace-pre-wrap [&_pre]:break-words dark:[&_pre]:!text-[var(--shiki-dark)] dark:[&_span]:!text-[var(--shiki-dark)]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
