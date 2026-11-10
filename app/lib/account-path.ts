// A layout cannot see its own path, so the proxy hands an /account page's path to the
// member layout, which sends a signed-out visitor to sign-in and back to that page.
// The proxy strips whatever the client sent under this name first.
export const ACCOUNT_PATH_HEADER = 'x-aicanvas-account-path'
