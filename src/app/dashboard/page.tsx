'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Trade } from '@/types'

// Mock trades for dashboard demo
const MOCK_TRADES: Trade[] = [
  { id: 'trade_1', userId: 'u1', symbol: 'XAUUSD', direction: 'BUY',  entry: 2320, sl: 2300, tp: 2360, lots: 0.1, openTime: new Date().toISOString(), status: 'open', currentPrice: 2334, progress: 0.35, riskPct: 0.93 },
  { id: 'trade_2', userId: 'u1', symbol: 'EURUSD', direction: 'SELL', entry: 1.0850, sl: 1.0900, tp: 1.0750, lots: 0.5, openTime: new Date().toISOString(), status: 'open', currentPrice: 1.0810, progress: 0.40, riskPct: 0.80 },
]

function RiskColor(riskPct: number) {
  if (riskPct > 0.6) return 'bg-brand-green'
  if (riskPct > 0.3) return 'bg-brand-amber'
  return 'bg-brand-red'
}

function ProgressColor(progress: number) {
  if (progress > 0.6) return 'bg-brand-green'
  if (progress > 0.2) return 'bg-brand-purple'
  return 'bg-brand-muted'
}

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>(MOCK_TRADES)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="absolute inset-0 bg-grid opacity-15 pointer-events-none" />

      {/* Top nav */}
      <header className="relative z-10 border-b border-brand-border bg-brand-bg bg-opacity-80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-green flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h9M7 3l5 4-5 4" stroke="#07090C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-bold text-brand-bright">TradeRace</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-surface border border-brand-border text-xs">
              <span className="dot-live" />
              <span className="text-brand-green font-medium">Live</span>
              <span className="text-brand-muted">· MT5 connected</span>
            </div>
            <Link href="/settings" className="btn-ghost text-xs">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M7 1v1M7 12v1M1 7h1M12 7h1M2.9 2.9l.7.7M10.4 10.4l.7.7M2.9 11.1l.7-.7M10.4 3.6l.7-.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
              Settings
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">

        {/* Session stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Active races', val: trades.length.toString(), icon: '🏎' },
            { label: 'Discipline score', val: '74', icon: '🛡' },
            { label: 'Today\'s trades', val: '3', icon: '📊' },
            { label: 'Debrief streak', val: '7 days', icon: '🔥' },
          ].map(s => (
            <div key={s.label} className="card-surface text-center p-4">
              <div className="text-lg mb-1">{s.icon}</div>
              <div className="font-display font-semibold text-xl text-brand-bright">{s.val}</div>
              <div className="text-xs text-brand-muted mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Pit lane header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-semibold text-brand-bright text-lg">Pit lane</h2>
            <p className="text-xs text-brand-muted mt-0.5">
              {trades.length === 0 ? 'No active races' : `${trades.length} race${trades.length > 1 ? 's' : ''} in progress`}
            </p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-xs px-4 py-2">
            + Log trade
          </button>
        </div>

        {/* Race cards */}
        {trades.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-4xl mb-4">🏁</div>
            <h3 className="font-display font-semibold text-brand-bright mb-2">No active races</h3>
            <p className="text-brand-dim text-sm mb-6">Open a trade in MT5 — it'll appear here automatically.</p>
            <button onClick={() => setShowAdd(true)} className="btn-primary mx-auto">Log a trade manually</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {trades.map(trade => {
              const progress = trade.progress ?? 0
              const risk = trade.riskPct ?? 1
              const pnlPips = trade.currentPrice && trade.entry
                ? parseFloat(((trade.currentPrice - trade.entry) * (trade.direction === 'BUY' ? 1 : -1) * 10).toFixed(1))
                : 0
              return (
                <Link key={trade.id} href={`/race/${trade.id}`}
                  className="card hover:border-brand-border-hi transition-all duration-200 group cursor-pointer">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-brand-bright">{trade.symbol}</span>
                        <span className={`text-xs font-mono font-medium ${trade.direction === 'BUY' ? 'text-brand-green' : 'text-brand-red'}`}>
                          {trade.direction}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="dot-live" />
                        <span className="text-xs text-brand-muted">Racing</span>
                      </div>
                    </div>
                    <div className={`text-sm font-mono font-medium ${pnlPips >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                      {pnlPips >= 0 ? '+' : ''}{pnlPips} pips
                    </div>
                  </div>

                  {/* Progress to TP */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-brand-muted">Progress to TP</span>
                      <span className="text-brand-text font-mono">{Math.round(progress * 100)}%</span>
                    </div>
                    <div className="progress-track">
                      <div className={`progress-fill ${ProgressColor(progress)}`}
                        style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%` }} />
                    </div>
                  </div>

                  {/* Risk buffer */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-brand-muted">Risk buffer</span>
                      <span className="text-brand-text font-mono">{Math.round(risk * 100)}%</span>
                    </div>
                    <div className="progress-track">
                      <div className={`progress-fill ${RiskColor(risk)}`}
                        style={{ width: `${Math.round(risk * 100)}%` }} />
                    </div>
                  </div>

                  {/* Entry/SL/TP */}
                  <div className="grid grid-cols-3 gap-2 text-center border-t border-brand-border pt-3">
                    {[
                      { label: 'Entry', val: trade.entry },
                      { label: 'SL',    val: trade.sl,    color: 'text-brand-red' },
                      { label: 'TP',    val: trade.tp,    color: 'text-brand-green' },
                    ].map(f => (
                      <div key={f.label}>
                        <div className="text-xs text-brand-muted mb-0.5">{f.label}</div>
                        <div className={`text-xs font-mono font-medium ${f.color ?? 'text-brand-text'}`}>{f.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Open race CTA */}
                  <div className="mt-3 pt-3 border-t border-brand-border flex items-center justify-between">
                    <span className="text-xs text-brand-muted">Tap to open race</span>
                    <svg className="w-4 h-4 text-brand-muted group-hover:text-brand-text transition-colors" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Quick nav */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/analytics" className="card hover:border-brand-border-hi transition-colors flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center text-brand-dim">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 12l3-4 3 3 3-5 3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div className="font-display font-medium text-sm text-brand-bright">Analytics</div>
              <div className="text-xs text-brand-muted">Discipline score & patterns</div>
            </div>
          </Link>
          <Link href="/settings/broker" className="card hover:border-brand-border-hi transition-colors flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center text-brand-dim">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L2 4v4c0 4 2.5 6.5 6 7.5 3.5-1 6-3.5 6-7.5V4L8 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div className="font-display font-medium text-sm text-brand-bright">Broker settings</div>
              <div className="text-xs text-brand-muted">Manage MT5 connections</div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
