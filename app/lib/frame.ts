// A preview the site embeds in itself (a block on its component page, a
// template in the phone frame) loads its own route with ?frame=1 and renders
// bare. The root layout then skips the site shell, but a layout cannot see the
// query string, so the proxy hands the flag over as a request header. The
// proxy strips whatever the client sent under that name first: only it may say
// a document is a preview payload.
export const FRAME_HEADER = 'x-aicanvas-frame'

// The routes that resolve ?frame=1 on the server and render bare. Every other
// route ignores the flag and renders chrome that reads the session, so it must
// keep the providers or it throws.
const FRAME_ROUTES = /^\/(?:preview\/[^/]+|design-systems\/[^/]+\/templates\/[^/]+)\/?$/

export function isFramePayload(url: { pathname: string; searchParams: URLSearchParams }): boolean {
  return url.searchParams.get('frame') === '1' && FRAME_ROUTES.test(url.pathname)
}

// Sec-Fetch-Dest is the browser's own answer to "is this document being
// framed". Sec-Fetch-Site keeps the branch to the site's own embeds. A client
// that omits either gets the full shell: slower, never wrong.
export function isFramedPayloadRequest(headers: { get(name: string): string | null }): boolean {
  return (
    headers.get('sec-fetch-dest') === 'iframe' &&
    headers.get('sec-fetch-site') === 'same-origin' &&
    headers.get(FRAME_HEADER) === '1'
  )
}
