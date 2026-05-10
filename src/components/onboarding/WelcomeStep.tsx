'use client'
import { useState } from 'react'
import type { User } from '@/types'

type TraderType = User['traderType']

const TYPES: { value: TraderType; label: string; sub: string; icon: string }[] = [
  { value: 'intraday', label: 'Intraday',  sub: '15 min – 4 hour trades',  icon: '⚡' },
  { value: 'swing',    label: 'Swing',     sub: 'Days to weeks',           icon: '🌊' },
  { value: 'scalper',  label: 'Scalper',   sub: 'Under 15 minutes',        icon: '🔥' },
]

export function WelcomeStep({ onNext }: { onNext: (type: TraderType) => void }) {
  const [selected, setSelected] = useState<TraderType>('intraday')

  return (
    <div>
      <div className="mb-8">
        <p className="text-brand-green text-xs font-display font-500 uppercase tracking-widest mb-3">Step 1 — Welcome</p>
        <h2 className="font-display font-700 text-3xl text-brand-bright mb-3">
          What kind of trader are you?
        </h2>
        <p className="text-brand-dim leading-relaxed">
          This helps us set the right game mode, notification cadence, and default race settings for you.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {TYPES.map(t => (
          <button key={t.value} onClick={() => setSelected(t.value)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 text-left ${
              selected === t.value
                ? 'border-brand-green bg-brand-green bg-opacity-5 glow-green'
                : 'border-brand-border bg-brand-surface hover:border-brand-border-hi'
            }`}
          >
            <div className="text-2xl">{t.icon}</div>
            <div className="flex-1">
              <div className="font-display font-600 text-brand-bright text-sm">{t.label}</div>
              <div className="text-xs text-brand-muted mt-0.5">{t.sub}</div>
            </div>
            {selected === t.value && (
              <div className="w-5 h-5 rounded-full bg-brand-green flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="#07090C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {selected === 'scalper' && (
        <div className="mb-6 p-4 rounded-lg bg-brand-amber bg-opacity-5 border border-brand-amber border-opacity-20">
          <p className="text-xs text-brand-amber leading-relaxed">
            <strong>Heads up for scalpers:</strong> Trades under 5 minutes are too fast for per-trade races.
            TradeRace will use <strong>session mode</strong> — one race for your full trading session,
            car position tracks daily P&L vs your daily target.
          </p>
        </div>
      )}

      <button onClick={() => onNext(selected)} className="btn-primary w-full justify-center py-3.5">
        Continue
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  )
}
