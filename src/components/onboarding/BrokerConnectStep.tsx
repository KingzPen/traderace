'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import type { MT5ConnectResult, MT5ConnectPayload } from '@/types'

type Platform = 'mt5' | 'mt4' | 'ctrader'

const PLATFORMS = [
  { value: 'mt5' as Platform, label: 'MetaTrader 5', icon: '🖥' },
  { value: 'mt4' as Platform, label: 'MetaTrader 4', icon: '📊' },
  { value: 'ctrader' as Platform, label: 'cTrader',     icon: '⚡' },
]

const POPULAR_BROKERS = [
  'ICMarkets', 'Pepperstone', 'XM', 'FP Markets', 'FXTM',
  'Exness', 'HFM', 'FTMO', 'The5ers', 'MyForexFunds',
]

interface Props {
  onNext: (result: MT5ConnectResult) => void
  onSkip: () => void
}

export function BrokerConnectStep({ onNext, onSkip }: Props) {
  const [platform, setPlatform]   = useState<Platform>('mt5')
  const [broker, setBroker]       = useState('')
  const [server, setServer]       = useState('')
  const [account, setAccount]     = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [status, setStatus]       = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [result, setResult]       = useState<MT5ConnectResult | null>(null)
  const [errorMsg, setErrorMsg]   = useState('')

  async function handleConnect() {
    if (!server || !account || !password) {
      toast.error('Please fill in all fields')
      return
    }
    setStatus('testing')
    setErrorMsg('')

    try {
      const payload: MT5ConnectPayload = {
        server,
        accountNumber: account,
        investorPassword: password,
        brokerName: broker || 'My Broker',
      }
      const res = await fetch('/api/broker/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, ...payload }),
      })
      const data: MT5ConnectResult = await res.json()

      if (data.success) {
        setStatus('success')
        setResult(data)
        toast.success('MT5 connected successfully!')
      } else {
        setStatus('error')
        setErrorMsg(data.error ?? 'Connection failed. Check your credentials.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  if (status === 'success' && result) {
    return (
      <div>
        <div className="mb-8">
          <div className="w-14 h-14 rounded-full bg-brand-green bg-opacity-10 border border-brand-green border-opacity-20 flex items-center justify-center mb-5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L20 7" stroke="#00E5A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-brand-green text-xs font-display font-500 uppercase tracking-widest mb-2">Connected</p>
          <h2 className="font-display font-700 text-3xl text-brand-bright mb-3">MT5 linked</h2>
          <p className="text-brand-dim">Your broker is now connected. TradeRace will automatically detect open trades.</p>
        </div>

        {result.accountInfo && (
          <div className="card mb-6 space-y-3">
            {[
              { label: 'Account', val: account },
              { label: 'Name',    val: result.accountInfo.name },
              { label: 'Balance', val: `${result.accountInfo.currency} ${result.accountInfo.balance.toLocaleString()}` },
              { label: 'Leverage', val: result.accountInfo.leverage },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center">
                <span className="text-xs text-brand-muted">{r.label}</span>
                <span className="text-sm text-brand-text font-mono">{r.val}</span>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => onNext(result)} className="btn-primary w-full justify-center py-3.5">
          Continue to first trade
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-brand-green text-xs font-display font-500 uppercase tracking-widest mb-3">Step 2 — Connect broker</p>
        <h2 className="font-display font-700 text-3xl text-brand-bright mb-3">
          Link your MT5 account
        </h2>
        <p className="text-brand-dim leading-relaxed text-sm">
          We use your <strong className="text-brand-text">investor (read-only) password</strong> —
          the same method used by TradeZella and other journals.
          We cannot place, modify, or close any trade.
        </p>
      </div>

      {/* Platform selector */}
      <div className="mb-5">
        <label className="input-label">Platform</label>
        <div className="flex gap-2">
          {PLATFORMS.map(p => (
            <button key={p.value} onClick={() => setPlatform(p.value)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm border transition-all ${
                platform === p.value
                  ? 'border-brand-purple bg-brand-purple bg-opacity-10 text-brand-bright'
                  : 'border-brand-border bg-brand-surface text-brand-muted hover:border-brand-border-hi'
              }`}>
              <span>{p.icon}</span>
              <span className="font-500">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Broker name */}
      <div className="mb-4">
        <label className="input-label">Broker name</label>
        <input list="broker-list" value={broker} onChange={e => setBroker(e.target.value)}
          placeholder="e.g. ICMarkets, Pepperstone, FTMO..." className="input" />
        <datalist id="broker-list">
          {POPULAR_BROKERS.map(b => <option key={b} value={b} />)}
        </datalist>
      </div>

      {/* Server */}
      <div className="mb-4">
        <label className="input-label">MT5 server</label>
        <input value={server} onChange={e => setServer(e.target.value)}
          placeholder="e.g. ICMarkets-Live01" className="input" />
        <p className="text-xs text-brand-muted mt-1.5">
          Find this in MT5: File → Open Account → Server name
        </p>
      </div>

      {/* Account number */}
      <div className="mb-4">
        <label className="input-label">Account number (login)</label>
        <input value={account} onChange={e => setAccount(e.target.value)}
          placeholder="e.g. 12345678" className="input" type="number" />
      </div>

      {/* Investor password */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="input-label mb-0">Investor password</label>
          <a href="#" className="text-xs text-brand-purple hover:text-brand-text transition-colors">
            How to find it ↗
          </a>
        </div>
        <div className="relative">
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            type={showPass ? 'text' : 'password'}
            placeholder="Your read-only investor password"
            className="input pr-10"
          />
          <button type="button" onClick={() => setShowPass(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors">
            {showPass ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/><path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/></svg>
            )}
          </button>
        </div>
        <p className="text-xs text-brand-muted mt-1.5">
          Find this in MT5: Tools → Options → Server tab → Investor password
        </p>
      </div>

      {/* Security callout */}
      <div className="flex gap-3 p-3.5 rounded-lg bg-brand-surface border border-brand-border mb-6">
        <svg className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
          <path d="M8 1.5L2 4v4c0 3.5 2.5 6.5 6 7.5 3.5-1 6-4 6-7.5V4L8 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
          <path d="M5.5 8l1.5 1.5L10.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="text-xs text-brand-dim leading-relaxed">
          <strong className="text-brand-text">Read-only access only.</strong> The investor password cannot place, modify, or close trades.
          Your trading password is never requested or stored. Credentials are encrypted at rest.
        </p>
      </div>

      {/* Error */}
      {status === 'error' && (
        <div className="flex gap-2 p-3 rounded-lg bg-brand-red bg-opacity-5 border border-brand-red border-opacity-20 mb-4">
          <svg className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M8 5v3M8 10.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <p className="text-xs text-brand-red">{errorMsg}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onSkip} className="btn-ghost flex-shrink-0">Skip for now</button>
        <button onClick={handleConnect} disabled={status === 'testing' || !server || !account || !password}
          className="btn-primary flex-1 justify-center py-3.5">
          {status === 'testing' ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/>
              </svg>
              Testing connection...
            </>
          ) : (
            <>
              Connect MT5
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
