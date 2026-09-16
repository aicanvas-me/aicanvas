// Request header proxy.ts sets when a document asked to be a bare preview
// payload (?frame=1). The root layout reads it, since a layout cannot see the
// query string.
export const FRAME_HEADER = 'x-aicanvas-frame'
