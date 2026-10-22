'use client'

// npm install @phosphor-icons/react framer-motion

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ChatCircle, Heart, ShieldCheck, X, ArrowUp } from '@phosphor-icons/react'

interface Notification {
  id: number
  icon: typeof Bell
  color: string
  title: string
  message: string
  time: string
}

// 6-digit hex only: two-digit alpha suffixes are appended to these colors.
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    icon: ChatCircle,
    color: '#3A86FF',
    title: 'New Message',
    message: 'Alex sent you a photo',
    time: '2m ago',
  },
  {
    id: 2,
    icon: Heart,
    color: '#FF7B54',
    title: 'New Like',
    message: 'Sarah liked your post',
    time: '5m ago',
  },
  {
    id: 3,
    icon: ShieldCheck,
    color: '#06D6A0',
    title: 'Security',
    message: 'New login from MacBook Pro',
    time: '12m ago',
  },
  {
    id: 4,
    icon: ArrowUp,
    color: '#B388FF',
    title: 'Update Available',
    message: 'Version 4.2 is ready to install',
    time: '1h ago',
  },
  {
    id: 5,
    icon: Bell,
    color: '#FFBE0B',
    title: 'Reminder',
    message: 'Team standup in 15 minutes',
    time: '1h ago',
  },
]

function NotificationCard({
  notification,
  onDismiss,
  index,
}: {
  notification: Notification
  onDismiss: (id: number) => void
  index: number
}) {
  const Icon = notification.icon

  return (
    <motion.div
      layout
      // No opacity in initial: below 1 it hides the blur until the fade ends.
      initial={{ x: 60, scale: 0.9 }}
      animate={{ x: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 24, delay: index * 0.05 } }}
      exit={{ opacity: 0, x: -60, scale: 0.9, filter: 'blur(4px)', transition: { duration: 0.2, ease: 'easeIn' } }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 80) {
          onDismiss(notification.id)
        }
      }}
      className="group relative isolate w-full cursor-grab overflow-hidden rounded-2xl active:cursor-grabbing transition-colors duration-200"
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      }}
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
    >
      {/* z-[-1] relies on the card's isolate; without it the blur falls behind the page. */}
      <div
        className="pointer-events-none absolute inset-0 z-[-1] rounded-2xl"
        style={{ backdropFilter: 'blur(20px) saturate(1.6)', WebkitBackdropFilter: 'blur(20px) saturate(1.6)' }}
      />
      <div className="flex items-start gap-3.5 px-4 py-3.5 pr-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.1 + index * 0.05 }}
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: `${notification.color}18`,
            border: `1px solid ${notification.color}22`,
          }}
        >
          <Icon size={18} weight="regular" style={{ color: notification.color }} />
        </motion.div>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-white/85">{notification.title}</h4>
          <p className="mt-0.5 text-[13px] text-white/40">{notification.message}</p>
        </div>
      </div>

      <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
        <motion.button
          whileHover={{ scale: 1.2, backgroundColor: 'rgba(255,255,255,0.15)' }}
          whileTap={{ scale: 0.85 }}
          onClick={() => onDismiss(notification.id)}
          aria-label={`Dismiss ${notification.title}`}
          className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full"
          style={{
            background: 'rgba(255,255,255,0.06)',
          }}
        >
          <X size={11} weight="regular" className="text-white/30" />
        </motion.button>
        <span className="text-[10px] text-white/25">{notification.time}</span>
      </div>

      <div
        className="absolute bottom-0 left-4 right-4 h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${notification.color}22, transparent)`,
        }}
      />
    </motion.div>
  )
}

export default function GlassNotification() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)

  const dismiss = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const reset = () => setNotifications(INITIAL_NOTIFICATIONS)

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]">
      <img
        src="https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div
        className="relative flex w-[360px] flex-col gap-2.5"
      >
        <div className="mb-1 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Bell size={20} weight="regular" className="text-white/40" />
            <span className="text-sm font-semibold text-white/60">
              Notifications
            </span>
            {notifications.length > 0 && (
              <motion.span
                layout
                className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-semibold text-white"
                style={{
                  background: 'rgba(255, 107, 245, 0.4)',
                  border: '1px solid rgba(255, 107, 245, 0.3)',
                }}
              >
                {notifications.length}
              </motion.span>
            )}
          </div>
          {notifications.length < INITIAL_NOTIFICATIONS.length && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={reset}
              className="cursor-pointer text-xs font-medium text-white/30 transition-colors hover:text-white/50"
            >
              Reset
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {notifications.map((n, i) => (
            <NotificationCard key={n.id} notification={n} onDismiss={dismiss} index={i} />
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {notifications.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-12"
            >
              <span className="text-sm text-white/60">All caught up</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
