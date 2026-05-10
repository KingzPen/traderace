'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { BrokerConnection, Trade, ManualTradePayload } from '@/types'

const SYMBOLS = ['XAUUSD','EURUSD','GBPUSD','USDJPY','NAS100','US30','BTCUSD','ETHUSD']

interface Props {
  connection?: BrokerConnection
  onNext: () => void
}

export function FirstTradeStep({ connection, onNext }: Props) {
  const router = useRouter()
  const [openTrades, setOpenTrades]   = useState<Trade[]>([])
  const [checking, setChecking]       = useState(!!connection)
  const [mode, setMode]               = useState<'auto' | 'manual'>('auto')
  const [submitting, setSubmitting]   = useState(false)

  // Manual form
  const [symbol, setSymbol]     = useState('XAUUSD')
  const [direction, setDir]     = useState<'BUY'|'SELL'>('BUY')
  const [entry, setEntry]       = useState('')
  const [sl, setSl]             = useState('')
  const [tp, setTp]             = useState('')

  // Check for open trades if connected
  useEffect(() => {
    if (!connection) { setMode('manual'); return }
    setChecking(true)
    fetch(`/api/broker/open-trades?connectionId=${connection.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.trades?.length > 0) {
          setOpenTrades(data.trades)
          setMode('auto')
        } else {
          setMode('manual')
        }
      })
      .catch(() => setMode('manual'))
      .finally(() => setChecking(false))
  }, [connection])

  async function startAutoRace(trade: Trade) {
    setSubmitting(true)
    try {
      await fetch('/api/trade/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId: trade.id }),
      })
      toast.success('Race started!')
      router.push(`/race/${trade.id}`)
    } catch {
      toast.error('Failed to start race')
    } finally {
      setSubmitting(false)
    }
  }

  async function submitManual(e: React.FormEvent) {
    e.preventDefault()
    const entryN = parseFloat(entry), slN = parseFloat(sl), tpN = parseFloat(tp)
    if (!entryN || !slN || !tpN) { toast.error('Fill in all fields'); return }
    if (direction === 'BUY'  && slN >= entryN) { toast.error('SL must be below entry for a BUY'); return }
    if (direction === 'SELL' && slN <= entryN) { toast.error('SL must be above entry for a SELL'); return }
    if (direction === 'BUY'  && tpN <= entryN) { toast.error('TP must be above entry for a BUY'); return }
    if (direction === 'SELL' && tpN >= entryN) { toast.error('TP must be below entry for a SELL'); return }

    setSubmitting(true)
    try {
      const payload: ManualTradePayload = { symbol, direction, entry: entryN, sl: slN, tp: tpN }
      const res = await fetch('/api/trade/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!data.tradeId) throw new Error()
      toast.success('Race starting!')
      router.push(`/race/${data.tradeId}`)
    } catch {
      toast.error('Failed to create trade')
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-full border border-brand-border flex items-center justify-center mx-auto mb-4">
          <svg className="animate-spin w-5 h-5 text-brand-green" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="30" strokeDashoffset="10"/>
          </svg>
        </div>
        <p className="text-brand-dim text-sm">Checking for open trades on your account...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-brand-green text-xs font-display font-500 uppercase tracking-widest mb-3">Step 3 — First race</p>
        <h2 className="font-display font-700 text-3xl text-brand-bright mb-3">
          {openTrades.length > 0 ? 'Open trades detected' : 'Log your first trade'}
        </h2>
        <p className="text-brand-dim text-sm leading-relaxed">
          {openTrades.length > 0
            ? 'We found open positions on your account. Select one to start your race.'
            : connection
              ? 'No open trades detected right now. Log your next trade manually to start a race.'
              : 'Enter your trade details. The race begins as soon as you submit.'}
        </p>
      </div>

      {/* Auto-detected trades */}
      {openTrades.length > 0 && (
        <div className="space-y-3 mb-6">
          {openTrades.map(trade => (
            <div key={trade.id} className="card hover:border-brand-border-hi transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-600 text-brand-bright">{trade.symbol}</span>
                    <span className={`text-xs font-mono font-500 ${trade.direction === 'BUY' ? 'text-brand-green' : 'text-brand-red'}`}>
                      {trade.direction}
                    </span>
                    <span className="dot-live" />
                  </div>
                  <div className="flex gap-4 text-xs text-brand-muted font-mono">
                    <span>Entry: {trade.entry}</span>
                    <span>SL: {trade.sl}</span>
                    <span>TP: {trade.tp}</span>
                  </div>
                </div>
                <button onClick={() => startAutoRace(trade)} disabled={submitting}
                  className="btn-primary text-xs px-4 py-2">
                  Start race 🏎
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => setMode('manual')}
            className="text-xs text-brand-muted hover:text-brand-dim transition-colors w-full text-center py-2">
            Or log a different trade manually ↓
          </button>
        </div>
      )}

      {/* Manual entry form */}
      {(mode === 'manual' || openTrades.length === 0) && (
        <form onSubmit={submitManual} className="space-y-4">
          {/* Symbol */}
          <div>
            <label className="input-label">Symbol</label>
            <select value={symbol} onChange={e => setSymbol(e.target.value)} className="input">
              {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Direction */}
          <div>
            <label className="input-label">Direction</label>
            <div className="flex gap-2">
              {(['BUY','SELL'] as const).map(d => (
                <button key={d} type="button" onClick={() => setDir(d)}
                  className={`flex-1 py-3 rounded-lg text-sm font-display font-500 border transition-all ${
                    direction === d
                      ? d === 'BUY'
                        ? 'border-brand-green bg-brand-green bg-opacity-10 text-brand-green'
                        : 'border-brand-red bg-brand-red bg-opacity-10 text-brand-red'
                      : 'border-brand-border bg-brand-surface text-brand-muted hover:border-brand-border-hi'
                  }`}>{d}</button>
              ))}
            </div>
          </div>

          {/* Price inputs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Entry price', val: entry, setter: setEntry },
              { label: 'Stop loss',   val: sl,    setter: setSl, hint: direction === 'BUY' ? 'Below entry' : 'Above entry' },
              { label: 'Take profit', val: tp,    setter: setTp, hint: direction === 'BUY' ? 'Above entry' : 'Below entry' },
            ].map(f => (
              <div key={f.label}>
                <label className="input-label">{f.label}</label>
                <input type="number" step="any" value={f.val} onChange={e => f.setter(e.target.value)}
                  placeholder="0.00" className="input" required />
                {f.hint && <p className="text-xs text-brand-muted mt-1">{f.hint}</p>}
              </div>
            ))}
          </div>

          {/* SL/TP required callout */}
          <div className="flex gap-2.5 p-3 rounded-lg bg-brand-surface border border-brand-border">
            <svg className="w-4 h-4 text-brand-amber flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L1 14h14L8 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
              <path d="M8 7v3M8 11.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <p className="text-xs text-brand-dim leading-relaxed">
              <strong className="text-brand-text">SL and TP are required.</strong> TradeRace uses them to calculate
              your car's position on the track. No SL = no race. This is the first discipline habit.
            </p>
          </div>

          <button type="submit" disabled={submitting || !entry || !sl || !tp}
            className="btn-primary w-full justify-center py-3.5">
            {submitting ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/>
              </svg>
            ) : (
              <>Start my first race 🏎</>
            )}
          </button>
        </form>
      )}

      <button onClick={onNext} className="w-full text-center text-xs text-brand-muted hover:text-brand-dim transition-colors mt-4 py-2">
        Skip — go to dashboard
      </button>
    </div>
  )
}
