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
  worksWith: string[]
  worksWithNote?: string
  // The models the skill gives its best results with, grouped by maker.
  bestWith?: { maker: 'claude' | 'gpt'; models: string[] }[]
  tryPrompt?: string
  requirements?: string
}

export const WHOOSH: SkillEntry = {
  slug: 'whoosh',
  name: 'whoosh',
  kind: 'Skill',
  status: 'live',
  featured: true,
  hook: 'Describe it. Your agent makes the video.',
  body: 'Motion-graphics videos, written in code by your AI agent. Ask for a launch video, a product promo, an app demo or a reel. Your agent writes one film.js, checks its own frames and renders an mp4 on your machine, up to 4K at 60 fps.',
  // The skill's own path (SKILL.md, The path), in order.
  points: [
    {
      title: 'Reads your subject',
      body: 'Your agent looks for the one true claim, your real numbers and how your product looks. It never invents a feature, a number or a customer.',
    },
    {
      title: 'Asks once, then waits',
      body: 'One short message, seven questions, each with a default: purpose, format, feel, length, the line to land, brand, sound. Nothing is built until you answer, and "you decide" is a full answer.',
    },
    {
      title: 'Shows you the plan',
      body: 'Before any code, a treatment: the idea in one sentence, 3 to 5 colours, the type, and a beat sheet with one row per scene.',
    },
    {
      title: 'Builds one film.js',
      body: 'Two or three scenes at a time. It looks at its own frames before writing more.',
    },
    {
      title: 'Reviews like an art director',
      body: 'Contact sheets of every scene, 12-frame filmstrips of the fastest moves and every cut, a check for text cut off or too small. It repeats until clean.',
    },
    {
      title: 'Drafts it, then renders 4K',
      body: 'Your agent first renders a quick low-res draft with sound, so you can check it and ask for changes fast. Only after your yes does it render the final in HD or 4K at 60 fps.',
    },
  ],
  worksWith: ['Claude Code', 'Codex'],
  worksWithNote: 'and other agents that read SKILL.md',
  bestWith: [
    { maker: 'claude', models: ['Claude Opus', 'Claude Fable'] },
    { maker: 'gpt', models: ['GPT Astra', 'GPT Sol'] },
  ],
  tryPrompt: 'Make a 15 second launch video for my app. The site is example.com.',
  requirements:
    'Needs Node 20 or newer and ffmpeg. The first run sets up a headless browser, about 215 MB, in a per-user cache.',
}

export const MEMORYHD: SkillEntry = {
  slug: 'memoryhd',
  name: 'memoryHD',
  kind: 'Plugin',
  status: 'soon',
  hook: 'Tell Claude once.',
  body: 'Not a design tool. memoryHD works on Claude Code itself: it keeps what you decide and brings it back the moment it matters, so you stop explaining twice and Claude stops repeating mistakes.',
  points: [
    { title: 'Writes its own notes', body: 'When a conversation settles something, Claude saves that one fact and tells you in a line.' },
    { title: 'Remembers on every message', body: 'Your words match a note, and it is in front of Claude before it answers, with its age.' },
    { title: 'Zero prompts', body: 'You never ask it to remember or look anything up. Plain files on your disk, no service.' },
    { title: 'A librarian built in', body: 'An agent that audits the notes, finds the stale and the duplicated, and cleans up with your OK.' },
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

export type WorkWay = { id: 'sentence' | 'film' | 'site' | 'brand'; title: string; body: string; example: string }

// What a brief can be made of (SKILL.md steps 1 and 2). Brand answers the questions; it is not a fourth way in.
export const WORK_WAYS: WorkWay[] = [
  {
    id: 'sentence',
    title: 'Type a sentence',
    body: 'Describe the video you want. That is enough: your agent asks the rest, with a default for every question.',
    example: 'Make a 15 second launch video for our invoice app.',
  },
  {
    id: 'film',
    title: 'Bring a video you like',
    body: 'Hand it a video file. It pulls 12 frames spread across it and takes the pacing, camera, palette and type. The idea, the words and the look stay yours.',
    example: 'Make ours feel like ~/Downloads/reference.mp4',
  },
  {
    id: 'site',
    title: 'Point at your site or app',
    body: 'It reads your product in a browser, or from screenshots and the repo, then rebuilds your interface and operates it on screen with your real words.',
    example: 'Make a video of our app. The site is example.com.',
  },
  {
    id: 'brand',
    title: 'Hand it your brand',
    body: 'Give it your colours, a font file and a logo. Say nothing and it takes them from your site.',
    example: 'Use assets/Brand.woff2 and our logo.svg.',
  },
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
    body: 'Finding the idea, story shapes by length, pacing, colour and type, a review checklist, and what makes a video look cheap.',
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
    a: 'No. A whoosh video is JavaScript: one film.js that the engine renders frame by frame in a headless browser on your machine. It does not edit existing footage and it does not generate footage with a model.',
  },
  {
    q: 'Does whoosh add music?',
    a: 'No. Sound is effects only, and the skill ships no audio files. While it builds a video, your agent fetches CC0 effects from Openverse or uses your own, and a video with no sounds renders silent. Videos are cut on a beat grid, so you can lay your own music under them in any editor.',
  },
]
