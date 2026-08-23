import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion @phosphor-icons/react

Root element: className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#1A1A19]"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named \`GlassNotification\`, a swipeable frosted-glass notification stack with a header, counter badge, Reset button, and empty state.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background image (absolute inset-0 object-cover opacity-60 pointer-events-none):
\`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png\`

INITIAL_NOTIFICATIONS (5 items, ids 1..5):
1. ChatCircle #3A86FF "New Message" / "Alex sent you a photo" / "2m ago"
2. Heart #FF7B54 "New Like" / "Sarah liked your post" / "5m ago"
3. ShieldCheck #06D6A0 "Security" / "New login from MacBook Pro" / "12m ago"
4. ArrowUp #B388FF "Update Available" / "Version 4.2 is ready to install" / "1h ago"
5. Bell #FFBE0B "Reminder" / "Team standup in 15 minutes" / "1h ago"

State (GlassNotification): [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS). dismiss(id) filters out. reset() restores initial.

Root: relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]. Background <img>. Stack container: relative flex w-[360px] flex-col gap-2.5.

Header (mb-1 flex justify-between px-1): left group (flex items-center gap-2): Bell size=20 weight="regular" text-white/40 + <span className="text-sm font-semibold text-white/60">Notifications</span> + counter motion.span (layout, h-4 min-w-4 rounded-full px-1 text-[9px] font-semibold text-white, bg 'rgba(255,107,245,0.4)' border '1px solid rgba(255,107,245,0.3)') showing notifications.length. Right: Reset motion.button (visible only when notifications.length < INITIAL.length): initial {opacity:0, scale:0.8} animate {opacity:1, scale:1}, whileHover {scale:1.05} whileTap {scale:0.95}, className "cursor-pointer text-xs font-medium text-white/30 transition-colors hover:text-white/50".

Cards wrapped in <AnimatePresence mode="popLayout">. Each NotificationCard receives notification, onDismiss, index.

NotificationCard (inner function component):
- motion.div layout, drag="x", dragConstraints {left:0, right:0}, dragElastic 0.3.
- onDragEnd(_, info): if Math.abs(info.offset.x) > 80 → onDismiss(id).
- initial {x:60, scale:0.9}, animate {x:0, scale:1, transition:{type:'spring', stiffness:280, damping:24, delay:index*0.05}}.
- exit {opacity:0, x:-60, scale:0.9, filter:'blur(4px)', transition:{duration:0.2, ease:'easeIn'}}.
- className "group relative isolate w-full cursor-grab overflow-hidden rounded-2xl active:cursor-grabbing transition-colors duration-200".
- style: background 'rgba(255,255,255,0.06)', border '1px solid rgba(255,255,255,0.08)', boxShadow '0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)'.
- whileHover {backgroundColor: 'rgba(255,255,255,0.1)'}.
- Separate blur layer: pointer-events-none absolute inset-0 z-[-1] rounded-2xl, backdropFilter 'blur(20px) saturate(1.6)' (+ WebkitBackdropFilter).
- Inner row: flex items-start gap-3.5 px-4 py-3.5 pr-12.
- Icon motion.div (notification-style tinted): mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl, style {background: \`\${color}18\`, border: \`1px solid \${color}22\`}. initial {scale:0} animate {scale:1} transition {type:'spring', stiffness:400, damping:18, delay:0.1 + index*0.05}. Child <Icon size={18} weight="regular" style={{color}} />.
- Content min-w-0 flex-1: <h4 className="text-sm font-semibold text-white/85">{title}</h4>, <p className="mt-0.5 text-[13px] text-white/40">{message}</p>.
- Top-right group: absolute right-3 top-3 flex flex-col items-end gap-1.5. Close motion.button h-5 w-5 rounded-full, bg 'rgba(255,255,255,0.06)', whileHover {scale:1.2, backgroundColor:'rgba(255,255,255,0.15)'} whileTap {scale:0.85}. X size={11} weight="regular" text-white/30. Below: <span className="text-[10px] text-white/25">{time}</span>.
- Bottom accent line: absolute bottom-0 left-4 right-4 h-[1px], background \`linear-gradient(90deg, transparent, \${color}22, transparent)\`.

Empty state: AnimatePresence containing motion.div when notifications.length===0: initial {opacity:0, scale:0.9} animate {opacity:1, scale:1} className "flex flex-col items-center gap-3 py-12". Text: <span className="text-sm text-white/60">All caught up</span>.

Imports: useState from react; motion, AnimatePresence from framer-motion; Bell, ChatCircle, Heart, ShieldCheck, X, ArrowUp from @phosphor-icons/react.

## Typography
- Font: project default sans-serif
- Sizes: 9px, 10px, 12px, 13px, 14px
- Weights: 500, 600`,

  'Lovable': `Create a React client component named \`GlassNotification\` — a swipeable frosted-glass notification stack with a header, counter badge, Reset button, and empty state.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background image (absolute inset-0 object-cover opacity-60 pointer-events-none):
\`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png\`

INITIAL_NOTIFICATIONS (5 items, ids 1..5):
1. ChatCircle #3A86FF "New Message" / "Alex sent you a photo" / "2m ago"
2. Heart #FF7B54 "New Like" / "Sarah liked your post" / "5m ago"
3. ShieldCheck #06D6A0 "Security" / "New login from MacBook Pro" / "12m ago"
4. ArrowUp #B388FF "Update Available" / "Version 4.2 is ready to install" / "1h ago"
5. Bell #FFBE0B "Reminder" / "Team standup in 15 minutes" / "1h ago"

State (GlassNotification): [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS). dismiss(id) filters out. reset() restores initial.

Root: relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]. Background <img>. Stack container: relative flex w-[360px] flex-col gap-2.5.

Header (mb-1 flex justify-between px-1): left group (flex items-center gap-2): Bell size=20 weight="regular" text-white/40 + <span className="text-sm font-semibold text-white/60">Notifications</span> + counter motion.span (layout, h-4 min-w-4 rounded-full px-1 text-[9px] font-semibold text-white, bg 'rgba(255,107,245,0.4)' border '1px solid rgba(255,107,245,0.3)') showing notifications.length. Right: Reset motion.button (visible only when notifications.length < INITIAL.length): initial {opacity:0, scale:0.8} animate {opacity:1, scale:1}, whileHover {scale:1.05} whileTap {scale:0.95}, className "cursor-pointer text-xs font-medium text-white/30 transition-colors hover:text-white/50".

Cards wrapped in <AnimatePresence mode="popLayout">. Each NotificationCard receives notification, onDismiss, index.

NotificationCard (inner function component):
- motion.div layout, drag="x", dragConstraints {left:0, right:0}, dragElastic 0.3.
- onDragEnd(_, info): if Math.abs(info.offset.x) > 80 → onDismiss(id).
- initial {x:60, scale:0.9}, animate {x:0, scale:1, transition:{type:'spring', stiffness:280, damping:24, delay:index*0.05}}.
- exit {opacity:0, x:-60, scale:0.9, filter:'blur(4px)', transition:{duration:0.2, ease:'easeIn'}}.
- className "group relative isolate w-full cursor-grab overflow-hidden rounded-2xl active:cursor-grabbing transition-colors duration-200".
- style: background 'rgba(255,255,255,0.06)', border '1px solid rgba(255,255,255,0.08)', boxShadow '0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)'.
- whileHover {backgroundColor: 'rgba(255,255,255,0.1)'}.
- Separate blur layer: pointer-events-none absolute inset-0 z-[-1] rounded-2xl, backdropFilter 'blur(20px) saturate(1.6)' (+ WebkitBackdropFilter).
- Inner row: flex items-start gap-3.5 px-4 py-3.5 pr-12.
- Icon motion.div (notification-style tinted): mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl, style {background: \`\${color}18\`, border: \`1px solid \${color}22\`}. initial {scale:0} animate {scale:1} transition {type:'spring', stiffness:400, damping:18, delay:0.1 + index*0.05}. Child <Icon size={18} weight="regular" style={{color}} />.
- Content min-w-0 flex-1: <h4 className="text-sm font-semibold text-white/85">{title}</h4>, <p className="mt-0.5 text-[13px] text-white/40">{message}</p>.
- Top-right group: absolute right-3 top-3 flex flex-col items-end gap-1.5. Close motion.button h-5 w-5 rounded-full, bg 'rgba(255,255,255,0.06)', whileHover {scale:1.2, backgroundColor:'rgba(255,255,255,0.15)'} whileTap {scale:0.85}. X size={11} weight="regular" text-white/30. Below: <span className="text-[10px] text-white/25">{time}</span>.
- Bottom accent line: absolute bottom-0 left-4 right-4 h-[1px], background \`linear-gradient(90deg, transparent, \${color}22, transparent)\`.

Empty state: AnimatePresence containing motion.div when notifications.length===0: initial {opacity:0, scale:0.9} animate {opacity:1, scale:1} className "flex flex-col items-center gap-3 py-12". Text: <span className="text-sm text-white/60">All caught up</span>.

Imports: useState from react; motion, AnimatePresence from framer-motion; Bell, ChatCircle, Heart, ShieldCheck, X, ArrowUp from @phosphor-icons/react.

## Typography
- Font: project default sans-serif
- Sizes: 9px, 10px, 12px, 13px, 14px
- Weights: 500, 600`,

  'V0': `Create a React client component named \`GlassNotification\` — a swipeable frosted-glass notification stack with a header, counter badge, Reset button, and empty state.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background image (absolute inset-0 object-cover opacity-60 pointer-events-none):
\`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png\`

INITIAL_NOTIFICATIONS (5 items, ids 1..5):
1. ChatCircle #3A86FF "New Message" / "Alex sent you a photo" / "2m ago"
2. Heart #FF7B54 "New Like" / "Sarah liked your post" / "5m ago"
3. ShieldCheck #06D6A0 "Security" / "New login from MacBook Pro" / "12m ago"
4. ArrowUp #B388FF "Update Available" / "Version 4.2 is ready to install" / "1h ago"
5. Bell #FFBE0B "Reminder" / "Team standup in 15 minutes" / "1h ago"

State (GlassNotification): [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS). dismiss(id) filters out. reset() restores initial.

Root: relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]. Background <img>. Stack container: relative flex w-[360px] flex-col gap-2.5.

Header (mb-1 flex justify-between px-1): left group (flex items-center gap-2): Bell size=20 weight="regular" text-white/40 + <span className="text-sm font-semibold text-white/60">Notifications</span> + counter motion.span (layout, h-4 min-w-4 rounded-full px-1 text-[9px] font-semibold text-white, bg 'rgba(255,107,245,0.4)' border '1px solid rgba(255,107,245,0.3)') showing notifications.length. Right: Reset motion.button (visible only when notifications.length < INITIAL.length): initial {opacity:0, scale:0.8} animate {opacity:1, scale:1}, whileHover {scale:1.05} whileTap {scale:0.95}, className "cursor-pointer text-xs font-medium text-white/30 transition-colors hover:text-white/50".

Cards wrapped in <AnimatePresence mode="popLayout">. Each NotificationCard receives notification, onDismiss, index.

NotificationCard (inner function component):
- motion.div layout, drag="x", dragConstraints {left:0, right:0}, dragElastic 0.3.
- onDragEnd(_, info): if Math.abs(info.offset.x) > 80 → onDismiss(id).
- initial {x:60, scale:0.9}, animate {x:0, scale:1, transition:{type:'spring', stiffness:280, damping:24, delay:index*0.05}}.
- exit {opacity:0, x:-60, scale:0.9, filter:'blur(4px)', transition:{duration:0.2, ease:'easeIn'}}.
- className "group relative isolate w-full cursor-grab overflow-hidden rounded-2xl active:cursor-grabbing transition-colors duration-200".
- style: background 'rgba(255,255,255,0.06)', border '1px solid rgba(255,255,255,0.08)', boxShadow '0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)'.
- whileHover {backgroundColor: 'rgba(255,255,255,0.1)'}.
- Separate blur layer: pointer-events-none absolute inset-0 z-[-1] rounded-2xl, backdropFilter 'blur(20px) saturate(1.6)' (+ WebkitBackdropFilter).
- Inner row: flex items-start gap-3.5 px-4 py-3.5 pr-12.
- Icon motion.div (notification-style tinted): mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl, style {background: \`\${color}18\`, border: \`1px solid \${color}22\`}. initial {scale:0} animate {scale:1} transition {type:'spring', stiffness:400, damping:18, delay:0.1 + index*0.05}. Child <Icon size={18} weight="regular" style={{color}} />.
- Content min-w-0 flex-1: <h4 className="text-sm font-semibold text-white/85">{title}</h4>, <p className="mt-0.5 text-[13px] text-white/40">{message}</p>.
- Top-right group: absolute right-3 top-3 flex flex-col items-end gap-1.5. Close motion.button h-5 w-5 rounded-full, bg 'rgba(255,255,255,0.06)', whileHover {scale:1.2, backgroundColor:'rgba(255,255,255,0.15)'} whileTap {scale:0.85}. X size={11} weight="regular" text-white/30. Below: <span className="text-[10px] text-white/25">{time}</span>.
- Bottom accent line: absolute bottom-0 left-4 right-4 h-[1px], background \`linear-gradient(90deg, transparent, \${color}22, transparent)\`.

Empty state: AnimatePresence containing motion.div when notifications.length===0: initial {opacity:0, scale:0.9} animate {opacity:1, scale:1} className "flex flex-col items-center gap-3 py-12". Text: <span className="text-sm text-white/60">All caught up</span>.

Imports: useState from react; motion, AnimatePresence from framer-motion; Bell, ChatCircle, Heart, ShieldCheck, X, ArrowUp from @phosphor-icons/react.

## Typography
- Font: project default sans-serif
- Sizes: 9px, 10px, 12px, 13px, 14px
- Weights: 500, 600`,
}
