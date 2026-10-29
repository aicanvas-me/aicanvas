// The Premium member card: a dark card, tilted, that straightens when its
// `group` parent is hovered. It stays dark in both themes: it is an object on
// the page, not page chrome. Kept for the About or Premium License page; the
// homepage bento no longer uses it.

const MONO = 'font-mono text-[10px] uppercase tracking-[0.18em]'

export function MemberCard() {
  return (
    <div className="w-full max-w-[320px]">
      <div className="relative aspect-[1.6/1] w-full rotate-[-5deg] rounded-card border border-white/10 bg-[linear-gradient(135deg,#232326,#121214)] p-5 text-left shadow-[0_2px_6px_rgba(0,0,0,0.25),0_24px_40px_-12px_rgba(0,0,0,0.55)] transition-[rotate,translate] duration-500 ease-out group-hover:-translate-y-1 group-hover:rotate-[-1deg]">
        <div
          aria-hidden
          className="absolute inset-0 rounded-card opacity-40"
          style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgb(255 255 255 / 0.035) 0 2px, transparent 2px 7px)' }}
        />
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <img src="/ai-canvas-icon.svg" alt="" aria-hidden className="h-6 w-auto" />
            <span className={`${MONO} text-sand-300`}>Premium</span>
          </div>
          <span aria-hidden className="h-7 w-10 rounded-chip bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent))] opacity-90 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)]" />
          <div className="flex items-end justify-between">
            <div>
              <span className={`${MONO} block text-sand-500`}>Member since</span>
              <span className="mt-1 block font-mono text-sm text-sand-100">2026</span>
            </div>
            <div className="text-right">
              <span className={`${MONO} block text-sand-500`}>Access</span>
              <span className="mt-1 block font-mono text-sm text-sand-100">Full catalog</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
