import type { FaqRow } from '../../components/FaqRows'

export type SkillPoint = { title?: string; body: string; icon?: 'wind' | 'shapes' | 'eye' | 'sound' }

export type SkillEntry = {
  slug: string
  name: string
  kind: 'Skill' | 'Plugin'
  // 'soon' draws the card with no install and no link: nothing that looks clickable.
  status: 'live' | 'soon'
  featured?: true
  hook: string
  body: string
  points: SkillPoint[]
  worksWith: string[]
  worksWithNote?: string
  install: { label: string; commands: string[] }[]
  tryPrompt?: string
  requirements?: string
  licence: string
  repo?: string
}

export const WHOOSH: SkillEntry = {
  slug: 'whoosh',
  name: 'whoosh',
  kind: 'Skill',
  status: 'live',
  featured: true,
  hook: 'Describe it. Your agent films it.',
  body: 'Motion-graphics videos, written in code by your AI agent. Ask for a launch film, a promo, an app demo or a reel. Your agent writes one film.js, reviews its own frames and renders an mp4.',
  points: [
    {
      icon: 'wind',
      title: 'Real motion blur',
      body: 'Each frame is sampled several times and averaged, the way a camera shutter does it.',
    },
    {
      icon: 'shapes',
      title: 'Springs, physics and 3D',
      body: 'Spring motion, rigid bodies with matter.js and 3D with three.js, loaded only when a film asks for them.',
    },
    {
      icon: 'eye',
      title: 'It checks its own work',
      body: 'Your agent renders stills of every scene, reviews them, and hands you a draft. On your yes it renders the final.',
    },
    {
      icon: 'sound',
      title: 'Sound included',
      body: 'Effects are timed to the motion. Films are cut on a beat grid, so your own music sits on top.',
    },
  ],
  worksWith: ['Claude Code', 'Codex', 'Cursor', 'Gemini CLI', 'GitHub Copilot'],
  worksWithNote: 'and other agents that read SKILL.md',
  install: [
    { label: 'Any agent', commands: ['npx skills add aicanvas-me/whoosh'] },
    { label: 'Claude Code', commands: ['/plugin marketplace add aicanvas-me/whoosh', '/plugin install whoosh@whoosh'] },
    { label: 'Gemini CLI', commands: ['gemini extensions install https://github.com/aicanvas-me/whoosh'] },
  ],
  tryPrompt: 'Make a 15 second launch video for my app. The site is example.com.',
  requirements:
    'Needs Node 20 or newer and ffmpeg. The first run sets up a headless browser, about 215 MB, and your agent does it for you.',
  licence: 'Apache-2.0',
  repo: 'https://github.com/aicanvas-me/whoosh',
}

export const MEMORYHD: SkillEntry = {
  slug: 'memoryhd',
  name: 'memoryHD',
  kind: 'Plugin',
  status: 'soon',
  hook: 'Say "deploy". The deploy note is already there.',
  body: 'A Claude Code plugin that makes remembering mechanical. Notes your agent wrote weeks ago come back the moment your words match them.',
  points: [
    {
      body: 'Recall on every message: a hook matches your words against a one-line index and adds up to three pointers, each stamped with its age.',
    },
    { body: 'Notes write themselves: when a conversation settles a decision, Claude saves that one fact and tells you in a line.' },
    { body: 'You prune: /librarian proposes what has gone stale or duplicated, and you approve it item by item.' },
    { body: 'Plain files on your disk: no database, no daemon, no dependencies.' },
  ],
  worksWith: ['Claude Code'],
  install: [],
  licence: 'Apache-2.0',
}

export const ENTRIES: SkillEntry[] = [WHOOSH, MEMORYHD]

// Chapter starts in seconds, read from the reel's film.js scene list. The
// file is 17 s long: the 15 s film plus the held end card.
export const REEL_LENGTH = 17
export const REEL_CHAPTERS = [
  { label: 'Prompt', at: 0 },
  { label: 'Type', at: 2.2 },
  { label: 'Physics', at: 4.55 },
  { label: '3D', at: 7.2 },
  { label: 'Camera', at: 9.55 },
  { label: 'Specs', at: 12.15 },
  { label: 'End card', at: 13.55 },
]

export const SKILLS_FAQ: FaqRow[] = [
  {
    q: 'What is an agent skill?',
    a: 'A skill is a folder with a SKILL.md file that teaches an AI agent how to do one job. whoosh follows the open Agent Skills format, so it loads in Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot and other agents that read SKILL.md.',
  },
  {
    q: 'What is the difference between a skill and a plugin?',
    a: 'A skill is a set of instructions and tools your agent loads when a task calls for it. A plugin is a package for one agent, such as Claude Code, that can bundle skills, commands and hooks. Every entry on this page says which one it is.',
  },
  {
    q: 'Is whoosh free?',
    a: 'Yes. whoosh is free and open source under Apache-2.0. You install it from GitHub and need no AI Canvas account.',
  },
  {
    q: 'What does whoosh need on my machine?',
    a: 'Node 20 or newer and ffmpeg. A one-time setup installs Playwright and headless Chromium, about 215 MB, into a per-user cache. Your agent runs it for you on first use.',
  },
  {
    q: 'Does whoosh use AI-generated footage?',
    a: 'No. A whoosh film is JavaScript: one film.js that the engine renders frame by frame in a headless browser on your machine. It does not edit existing footage and it does not generate footage with a model.',
  },
  {
    q: 'Does whoosh add music?',
    a: 'Sound is effects only: 96 CC0 sounds timed to the motion. Films are cut on a beat grid, so you can add your own music in any editor.',
  },
]
