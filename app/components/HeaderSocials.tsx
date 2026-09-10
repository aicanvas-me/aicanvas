'use client'

import { TopAuthPill } from './auth/TopAuthPill'
import { ThemeToggle } from './ThemeToggle'

// ─── HeaderSocials ────────────────────────────────────────────────────────────
// Right side of any sticky page header — the theme toggle, then the auth pill
// (compact letter-avatar + dropdown when signed in, "Sign in" button that
// opens the auth modal when signed out).
//
// Lab moved into the sidebar nav (plain icon + label, before Get MCP).
// Get MCP, Pricing, About also live in the sidebar; GitHub + X icons too.

export function HeaderSocials() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <TopAuthPill />
    </div>
  )
}
