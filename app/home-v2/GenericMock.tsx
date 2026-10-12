// The "without rules" half of the v2 comparison: the same mission control
// request, built the way an agent builds with no system to follow. Every
// choice here is deliberate and each one breaks a rule the Andromeda brain
// names: color on titles, a gradient per card, emoji as icons, a filled pill
// for the active nav, three competing primary buttons in three sizes.
//
// Sized in container units (cqw) so it scales with the comparison box, which
// sets container-type. Box aspect 1138 / 613, like the poster beside it.

const SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

const STATS = [
  { icon: '🛰️', label: 'Altitude', value: '412.6 km', delta: '+12% 🔥', bg: 'linear-gradient(135deg,#ec4899,#f97316)', glow: 'rgba(236,72,153,0.45)' },
  { icon: '⚡', label: 'Velocity', value: '7.66 km/s', delta: '+8% 📈', bg: 'linear-gradient(135deg,#8b5cf6,#6366f1)', glow: 'rgba(139,92,246,0.45)' },
  { icon: '📡', label: 'Signal', value: '98%', delta: 'Excellent! 🎉', bg: 'linear-gradient(135deg,#10b981,#06b6d4)', glow: 'rgba(16,185,129,0.4)' },
  { icon: '🔋', label: 'Power', value: '87%', delta: '-2% ⚠️', bg: 'linear-gradient(135deg,#f59e0b,#ef4444)', glow: 'rgba(245,158,11,0.4)' },
]

const NAV = ['📊 Overview', '🛰️ Telemetry', '🚀 Vehicles', '💬 Comms', '⚠️ Anomalies', '🔧 Maintenance']

const ROWS = [
  { k: 'Target', v: 'Kepler-186f 🪐', c: '#22d3ee' },
  { k: 'Status', v: 'Approaching ✅', c: '#4ade80' },
  { k: 'Distance', v: '492 light years', c: '#facc15' },
  { k: 'ETA', v: '2027 📅', c: '#f472b6' },
]

const GRAD_TEXT = {
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
} as const

export function GenericMock() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 flex bg-[#f6f3ff] text-[#1f1a3d] dark:bg-[#0f0b1e] dark:text-white"
      style={{ fontFamily: SANS }}
    >
      {/* Purple haze, because there is always purple haze. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(40% 50% at 85% 10%, rgba(168,85,247,0.22), transparent 70%), radial-gradient(35% 45% at 30% 100%, rgba(59,130,246,0.18), transparent 70%)',
        }}
      />

      {/* Sidebar */}
      <div className="relative flex w-[16cqw] shrink-0 flex-col gap-[0.5cqw] bg-white/80 p-[1.4cqw] dark:bg-[#151030]/90">
        <div className="mb-[1.2cqw] text-[1.55cqw] font-extrabold" style={{ ...GRAD_TEXT, backgroundImage: 'linear-gradient(90deg,#7c3aed,#db2777)' }}>
          🚀 MissionCtrl
        </div>
        {NAV.map((n, i) => (
          <div
            key={n}
            className={`rounded-[0.8cqw] px-[0.9cqw] py-[0.6cqw] text-[1.05cqw] font-medium ${
              i === 0 ? 'text-white' : 'text-[#6b6790] dark:text-[#a5a1c9]'
            }`}
            style={
              i === 0
                ? { background: 'linear-gradient(90deg,#7c3aed,#db2777)', boxShadow: '0 0.6cqw 1.6cqw rgba(124,58,237,0.45)' }
                : undefined
            }
          >
            {n}
          </div>
        ))}
        <div
          className="mt-auto rounded-[1.2cqw] p-[1cqw] text-[0.95cqw] font-semibold text-white"
          style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)' }}
        >
          ✨ Upgrade to Pro
          <div className="mt-[0.3cqw] text-[0.8cqw] font-normal opacity-80">Unlock AI insights!</div>
        </div>
      </div>

      {/* Main */}
      <div className="relative flex min-w-0 flex-1 flex-col p-[1.8cqw]">
        <div className="flex items-start justify-between gap-[1cqw]">
          <div>
            <div className="text-[2.1cqw] font-extrabold leading-tight" style={{ ...GRAD_TEXT, backgroundImage: 'linear-gradient(90deg,#4f46e5,#c026d3)' }}>
              Mission Control Dashboard ✨
            </div>
            <div className="mt-[0.3cqw] text-[1.05cqw] text-[#6b6790] dark:text-[#a5a1c9]">Welcome back, Commander! 👋</div>
          </div>
          <div className="flex items-center gap-[0.7cqw]">
            <span className="rounded-full bg-[#3b82f6] px-[1.1cqw] py-[0.5cqw] text-[0.95cqw] font-semibold text-white">Export 📤</span>
            <span className="rounded-[0.4cqw] bg-[#e5e7eb] px-[0.6cqw] py-[0.35cqw] text-[0.9cqw] dark:bg-[#2a2550]">⚙️</span>
            <span
              className="rounded-[0.6cqw] px-[1.5cqw] py-[0.8cqw] text-[1.15cqw] font-bold text-white"
              style={{ background: 'linear-gradient(90deg,#f97316,#ec4899)', boxShadow: '0 0.5cqw 1.4cqw rgba(249,115,22,0.45)' }}
            >
              + New Mission 🚀
            </span>
          </div>
        </div>

        <div className="mt-[1.6cqw] grid grid-cols-4 gap-[1.1cqw]">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-[1.4cqw] p-[1.1cqw] text-white"
              style={{ background: s.bg, boxShadow: `0 0.8cqw 2cqw ${s.glow}` }}
            >
              <div className="text-[1cqw] font-semibold opacity-90">
                {s.icon} {s.label}
              </div>
              <div className="mt-[0.4cqw] text-[2.2cqw] font-extrabold leading-none">{s.value}</div>
              <div className="mt-[0.5cqw] inline-block rounded-full bg-white/25 px-[0.6cqw] py-[0.15cqw] text-[0.85cqw] font-semibold">{s.delta}</div>
            </div>
          ))}
        </div>

        <div className="mt-[1.6cqw] flex min-h-0 flex-1 gap-[1.6cqw] rounded-[1.6cqw] border border-[#a78bfa]/30 bg-white/70 p-[1.6cqw] dark:bg-[#1a1438]/80">
          <div className="flex w-[34%] flex-col items-center justify-center">
            <div className="self-start text-[1.45cqw] font-bold" style={{ ...GRAD_TEXT, backgroundImage: 'linear-gradient(90deg,#06b6d4,#8b5cf6)' }}>
              🌍 Next Destination
            </div>
            <div
              className="mt-[1.4cqw] aspect-square w-[13cqw] rounded-full"
              style={{
                background: 'radial-gradient(circle at 32% 30%, #c4b5fd, #7c3aed 45%, #312e81 75%, #1e1b4b)',
                boxShadow: '0 0 4cqw rgba(139,92,246,0.6), inset -1.2cqw -1.2cqw 3cqw rgba(0,0,0,0.35)',
              }}
            />
          </div>
          <div className="flex flex-1 flex-col justify-center gap-[0.9cqw]">
            <div className="text-[2cqw] font-black tracking-tight" style={{ ...GRAD_TEXT, backgroundImage: 'linear-gradient(90deg,#f472b6,#a78bfa)' }}>
              KEPLER-186F 🪐
            </div>
            {ROWS.map((r) => (
              <div key={r.k} className="flex justify-between border-b border-[#a78bfa]/20 pb-[0.5cqw] text-[1.05cqw]">
                <span className="text-[#6b6790] dark:text-[#a5a1c9]">{r.k}</span>
                <span className="font-semibold" style={{ color: r.c }}>
                  {r.v}
                </span>
              </div>
            ))}
            <div className="mt-[0.6cqw] flex items-center gap-[0.8cqw]">
              <span
                className="rounded-full px-[1.8cqw] py-[0.85cqw] text-[1.15cqw] font-bold text-white"
                style={{ background: 'linear-gradient(90deg,#7c3aed,#ec4899)', boxShadow: '0 0.6cqw 1.6cqw rgba(124,58,237,0.5)' }}
              >
                🚀 Engage Trajectory
              </span>
              <span className="rounded-[0.4cqw] border-2 border-[#06b6d4] px-[1cqw] py-[0.45cqw] text-[0.95cqw] font-semibold text-[#0891b2] dark:text-[#22d3ee]">
                Learn More →
              </span>
              <span className="rounded-[0.25cqw] bg-[#ef4444] px-[0.7cqw] py-[0.3cqw] text-[0.8cqw] font-semibold text-white">Cancel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
