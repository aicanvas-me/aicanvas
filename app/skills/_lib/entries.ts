import type { FaqRow } from '../../components/FaqRows'

export type SkillPoint = { title?: string; body: string }

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
  // How a brief reaches the skill, main way first.
  waysIn?: { title: string; body: string; example: string }[]
  worksWith: string[]
  worksWithNote?: string
  tryPrompt?: string
  requirements?: string
}

export const WHOOSH: SkillEntry = {
  slug: 'whoosh',
  name: 'whoosh',
  kind: 'Skill',
  status: 'live',
  featured: true,
  hook: 'Describe it. Your agent films it.',
  body: 'Motion-graphics videos, written in code by your AI agent. Ask for a launch film, a product promo, an app demo or a reel. Your agent writes one film.js, checks its own frames and renders an mp4 on your machine, up to 4K at 60 fps.',
  // The skill's own path (SKILL.md, The path), shown as four steps.
  points: [
    {
      title: 'Finds the idea',
      body: 'It finds the one true claim, then writes a treatment: palette, type and a beat sheet with every scene, its move and its words. You see it before any code.',
    },
    {
      title: 'Writes one film.js',
      body: 'Every frame is drawn from time alone, so renders are exact and repeatable. Real motion blur comes free: each frame is sampled and averaged like a camera shutter.',
    },
    {
      title: 'Reviews its own frames',
      body: 'Contact sheets of every scene, filmstrips of the fastest moves, checks for text cut off or too small. It fixes what it sees and looks again.',
    },
    {
      title: 'Draft, then final',
      body: 'A half-size draft in one to three minutes. On your yes, the final in HD or 4K at 60 fps, with sound on cue.',
    },
  ],
  waysIn: [
    {
      title: 'Plain words',
      body: 'Describe the video in a sentence or two. That is enough to start.',
      example: 'Make a 15 second launch film for our invoice app.',
    },
    {
      title: 'A reference film',
      body: 'Hand it a video you like. It reads 12 frames and borrows the pacing, camera, palette and type. The idea and the words stay yours.',
      example: 'Make ours feel like ~/Downloads/reference.mp4',
    },
    {
      title: 'Your site or app',
      body: 'Point it at your product. It films how the product really looks, with your real words and numbers.',
      example: 'Film our app. The site is example.com.',
    },
  ],
  worksWith: ['Claude Code', 'Codex'],
  worksWithNote: 'and other agents that read SKILL.md',
  tryPrompt: 'Make a 15 second launch video for my app. The site is example.com.',
  requirements:
    'Needs Node 20 or newer and ffmpeg. The first run sets up a headless browser, about 215 MB, in a per-user cache.',
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

export type Craft = {
  title: string
  count: string
  body: string
  // A loop of the matching reel chapter, in seconds.
  clip?: { from: number; to: number }
}

// What the skill teaches, from references/recipes.md and direction.md: 57 recipes in all.
export const CRAFTS: Craft[] = [
  {
    title: 'Kinetic type',
    count: '10 recipes',
    body: 'Words that land on the beat: masked rises, one giant word that fills the frame, a strike-through, a word swapped in place, a typewriter with a human rhythm.',
    clip: { from: 2.2, to: 4.55 },
  },
  {
    title: 'Physics and springs',
    count: '4 recipes',
    body: 'Real rigid bodies with matter.js: drops that squash and settle, a pile of pills, confetti and sparks under gravity. Springs for anything that should overshoot.',
    clip: { from: 4.55, to: 7.2 },
  },
  {
    title: '3D and generative',
    count: '8 recipes',
    body: 'Lit three.js scenes, chrome and glossy objects, extruded logos, point clouds that morph between forms, flow fields and fields of blocks that breathe.',
    clip: { from: 7.2, to: 9.55 },
  },
  {
    title: 'Camera',
    count: '12 recipes',
    body: 'Crane in and out, dive into a tile, whip pan, dolly through layers, orbit a group, fly through a wall of cards, shake on the hit.',
    clip: { from: 9.55, to: 12.15 },
  },
  {
    title: 'A product on screen',
    count: '12 recipes',
    body: 'A cursor that travels and presses, spring toggles, counters and odometers, charts that draw, a 3D wall that lands on one card, a phone frame.',
  },
  {
    title: 'Transitions',
    count: '6 recipes',
    body: 'Floods from a point, wipes on the beat, a theme flip, hard cuts, colour hits, container morphs.',
  },
  {
    title: 'Light and finish',
    count: '5 recipes',
    body: 'Soft stage light, a light sweep across a card, glass panels, a vignette, handheld life on a held shot.',
  },
  {
    title: 'Direction',
    count: 'The judgment',
    body: 'Finding the idea, story shapes by length, pacing, colour and type, a review checklist, and what makes a film look cheap.',
  },
]

export const SKILLS_FAQ: FaqRow[] = [
  {
    q: 'What is an agent skill?',
    a: 'A skill is a folder with a SKILL.md file that teaches an AI agent how to do one job. whoosh follows the open Agent Skills format, so it loads in Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot and other agents that read SKILL.md. The install command sets it up for Claude Code and Codex.',
  },
  {
    q: 'Who can install whoosh?',
    a: 'whoosh comes with AI Canvas Premium and Lifetime, at no extra price. Sign in, copy the install command with your token in it, and run it in any terminal.',
  },
  {
    q: 'What is the difference between a skill and a plugin?',
    a: 'A skill is a set of instructions and tools your agent loads when a task calls for it. A plugin is a package for one agent, such as Claude Code, that can bundle skills, commands and hooks. Every entry on this page says which one it is.',
  },
  {
    q: 'What does whoosh need on my machine?',
    a: 'Node 20 or newer and ffmpeg. A one-time setup installs Playwright and headless Chromium, about 215 MB, into a per-user cache. Your agent runs it for you on first use. In a sandboxed agent, such as Codex in its default sandbox, approve its commands to run outside the sandbox so it can start the browser.',
  },
  {
    q: 'Does whoosh use AI-generated footage?',
    a: 'No. A whoosh film is JavaScript: one film.js that the engine renders frame by frame in a headless browser on your machine. It does not edit existing footage and it does not generate footage with a model.',
  },
  {
    q: 'Does whoosh add music?',
    a: 'No. Sound is effects only, and the skill ships no audio files. While it builds a film, your agent fetches CC0 effects from Openverse or uses your own, and a film with no sounds renders silent. Films are cut on a beat grid, so you can lay your own music under them in any editor.',
  },
]
