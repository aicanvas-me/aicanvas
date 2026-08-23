export type SavedComponent = {
  user_id: string
  slug: string
  system: string | null
  collection: string | null
  saved_at: string
}

export type InstallHistoryRow = {
  id: number
  user_id: string
  slug: string
  system: string | null
  pkg_manager: string | null
  copied_at: string
}

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun'
export type AiPlatform = 'Claude Code' | 'Lovable' | 'V0'
