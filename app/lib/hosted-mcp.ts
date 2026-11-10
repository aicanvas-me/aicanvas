// The hosted MCP's public address. A plain module, so server pages and the client connect
// card read the same string (a constant exported from a 'use client' file reaches a server
// component as a stub, not as text).
export const HOSTED_MCP_URL = 'https://mcp.aicanvas.me'
