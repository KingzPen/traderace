'use client'
import { useState } from 'react'
import Link from 'next/link'

const messages = [
  { range: [0,0],   text: "Really? Even one early close costs you. Let's protect the next one.", color: 'text-brand-green' },
  { range: [1,3],   text: "That's 1–3 trades left on the table. TradeRace gives you something else to watch.", color: 'text-brand-amber' },
  { range: [4,8],   text: "4–8 trades. That's likely a month's worth of edge, given away voluntarily.", color: 'text-brand-amber' },
  { range: [9,15],  text: "You already know the problem isn't the strategy. It's what happens after entry.", color: 'text-brand-red' },
  { range: [16,20], text: "That's a serious pattern. TradeRace was built specifically for you.", color: 'text-brand-red' },
]

function getMessage(val: number) {
  return messages.find(m => val >= m.range[0] && val <= m.range[1]) ?? messages[messages.length - 1]
}

export function HookSlider() {
  const [value, setValue] = useState(3)
  const msg = getMessage(value)

  return (
    <div className="card-surface max-w-2xl mx-auto text-left">
      <p className="font-display font-semibold text-brand-bright text-lg mb-6">
        How many trades did you close early last month?
      </p>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-brand-muted mb-3 font-mono">
          <span>0</span>
          <span className="font-semibold text-2xl text-brand-bright font-display">{value === 20 ? '20+' : value}</span>
          <span>20+</span>
        </div>
        <input
          type="range"
          min={0}
          max={20}
          value={value}
          onChange={e => setValue(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #00E5A0 ${value / 20 * 100}%, #1C2733 ${value / 20 * 100}%)`
          }}
        />
      </div>

      <div className="flex items-start gap-3 p-4 rounded-lg bg-brand-bg border border-brand-border min-h-[60px]">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-dim" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M8 7.5v4M8 5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <p className={`text-sm leading-relaxed transition-all duration-300 ${msg.color}`}>
          {msg.text}
        </p>
      </div>

      <div className="mt-5 flex justify-end">
        <Link href="/auth/signup" className="btn-primary text-sm px-5 py-2.5">
          Fix this with TradeRace →
        </Link>
      </div>
    </div>
  )
}
