'use client'

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L2 7v6l8 5 8-5V7L10 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
    title: 'MT5 investor password sync',
    desc: 'Connect with your read-only investor password. We detect open trades automatically — no manual input. Cannot touch your trades, by design.',
    tag: 'Free',
    tagColor: 'badge-green',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10h14M10 3l7 7-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Live race on real price',
    desc: 'Your car\'s position on the track is driven by real-time price data. Car at 50% = price halfway to TP. No simulations, no guesses.',
    tag: 'Free',
    tagColor: 'badge-green',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M2 10h16M6 6V4a2 2 0 014 0v2M10 6V4a2 2 0 014 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Pit lane — all trades at once',
    desc: 'Running 3 trades? See all of them as race cards. Progress bars, risk buffers. No raw prices. Tap any card to go full screen.',
    tag: 'Free',
    tagColor: 'badge-green',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M10 6v4l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Cooldown gate after SL',
    desc: '10-minute cooling off period after a stop-loss hit before you can open another race on the same symbol. Kills revenge trading.',
    tag: 'Pro',
    tagColor: 'badge-purple',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2v4M10 14v4M2 10h4M14 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
    title: 'Discipline score',
    desc: 'A single number tracking SL respect, early exits, plan adherence, and debrief streaks. Share it. Watch it grow. Use it to get funded.',
    tag: 'Pro',
    tagColor: 'badge-purple',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 17l4-8 4 4 4-8 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Post-trade debrief',
    desc: 'Three questions after every trade closes. Did you interfere? How did you feel? What would you change? 60 seconds. Feeds your score.',
    tag: 'Free',
    tagColor: 'badge-green',
  },
]

export function FeaturesSection() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <p className="section-label mb-3">Why it works</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-brand-bright mb-4">
          Built around the real problem
        </h2>
        <p className="text-brand-dim max-w-xl mx-auto">
          Every feature exists to solve one thing: keeping you out of your open trades until they close on plan.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <div key={f.title} className="card group hover:border-brand-border-hi transition-colors duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center text-brand-dim group-hover:text-brand-text transition-colors">
                {f.icon}
              </div>
              <span className={f.tagColor}>{f.tag}</span>
            </div>
            <h3 className="font-display font-semibold text-brand-bright text-sm mb-2">{f.title}</h3>
            <p className="text-brand-dim text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
