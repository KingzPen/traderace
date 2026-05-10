'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

const SYMBOLS = ['XAUUSD', 'EURUSD', 'GBPUSD', 'NAS100']
const DEFAULTS: Record<string, { entry: number; sl: number; tp: number }> = {
  XAUUSD: { entry: 2320, sl: 2300, tp: 2360 },
  EURUSD: { entry: 1.0850, sl: 1.0800, tp: 1.0950 },
  GBPUSD: { entry: 1.2700, sl: 1.2640, tp: 1.2820 },
  NAS100: { entry: 19800, sl: 19600, tp: 20100 },
}

type Scenario = 'bull' | 'chop' | 'bear'

interface TradeSetup {
  symbol: string
  entry: number
  sl: number
  tp: number
  price: number
  progress: number
  riskPct: number
  pnlPips: number
  status: 'racing' | 'tp_hit' | 'sl_hit'
}

function simulateTick(s: TradeSetup, scenario: Scenario): TradeSetup {
  const range = s.tp - s.sl
  const drifts = { bull: 0.018, chop: 0, bear: -0.018 }
  const drift = drifts[scenario]
  const noise = (Math.random() - 0.5) * 0.04 * range
  const meanRevert = (s.entry - s.price) * 0.005
  const newPrice = Math.max(s.sl - range * 0.02, Math.min(s.tp + range * 0.02, s.price + drift * range * 0.08 + noise + meanRevert))
  const tpDist = s.tp - s.entry
  const slDist = Math.abs(s.sl - s.entry)
  const progress = (newPrice - s.entry) / tpDist
  const riskPct = Math.max(0, 1 - Math.max(0, s.entry - newPrice) / slDist)
  const pnlPips = parseFloat(((newPrice - s.entry) * 10).toFixed(1))
  const status: TradeSetup['status'] = newPrice <= s.sl ? 'sl_hit' : newPrice >= s.tp ? 'tp_hit' : 'racing'
  return { ...s, price: newPrice, progress, riskPct, pnlPips, status }
}

export function DemoRaceEmbed() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef   = useRef<number>()
  const tickRef   = useRef<ReturnType<typeof setInterval>>()
  const stateRef  = useRef<TradeSetup | null>(null)
  const tickCount = useRef(0)

  const [scenario, setScenario]     = useState<Scenario>('chop')
  const [paused, setPaused]         = useState(false)
  const [symbol, setSymbol]         = useState('XAUUSD')
  const [setup, setSetup]           = useState(DEFAULTS.XAUUSD)
  const [liveState, setLiveState]   = useState<TradeSetup | null>(null)
  const [trail, setTrail]           = useState<Array<{ x: number; y: number; life: number }>>([])

  const initState = useCallback((): TradeSetup => ({
    ...DEFAULTS[symbol],
    ...setup,
    symbol,
    price: setup.entry,
    progress: 0,
    riskPct: 1,
    pnlPips: 0,
    status: 'racing',
  }), [symbol, setup])

  // Reset when symbol changes
  useEffect(() => {
    setSetup(DEFAULTS[symbol])
  }, [symbol])

  // Simulation tick
  useEffect(() => {
    const state = initState()
    stateRef.current = state
    setLiveState(state)

    clearInterval(tickRef.current)
    if (!paused) {
      tickRef.current = setInterval(() => {
        if (!stateRef.current) return
        if (stateRef.current.status !== 'racing') return
        const next = simulateTick(stateRef.current, scenario)
        stateRef.current = next
        setLiveState(next)
      }, 600)
    }
    return () => clearInterval(tickRef.current)
  }, [symbol, scenario, paused, initState])

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let carX = 80
    let tick = 0

    function draw() {
      if (!ctx || !canvas) return
      const W = canvas.width
      const H = canvas.height
      const st = stateRef.current
      if (!st) { animRef.current = requestAnimationFrame(draw); return }

      tick++
      ctx.clearRect(0, 0, W, H)

      // BG
      ctx.fillStyle = '#07090C'
      ctx.fillRect(0, 0, W, H)

      // Grid
      ctx.strokeStyle = 'rgba(28,39,51,0.6)'
      ctx.lineWidth = 0.5
      for (let x = 0; x < W; x += 36) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
      for (let y = 0; y < H; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

      const startX = 60, endX = W - 60, trackY = H * 0.52, trackH = 72
      const trkW   = endX - startX

      // Danger glow
      if (st.riskPct < 0.5) {
        const alpha = (1 - st.riskPct / 0.5) * 0.2
        ctx.fillStyle = `rgba(255,71,87,${alpha})`
        ctx.fillRect(startX, trackY - trackH / 2 - 4, trkW * 0.25, trackH + 8)
      }

      // Track
      ctx.fillStyle = '#0D1117'
      ctx.beginPath()
      const r = 8
      ctx.roundRect(startX, trackY - trackH / 2, trkW, trackH, r)
      ctx.fill()

      // Track border
      ctx.strokeStyle = '#1C2733'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(startX, trackY - trackH / 2, trkW, trackH, r)
      ctx.stroke()

      // Lane dash
      ctx.setLineDash([14, 10])
      ctx.strokeStyle = 'rgba(61,85,112,0.6)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(startX + 10, trackY)
      ctx.lineTo(endX - 10, trackY)
      ctx.stroke()
      ctx.setLineDash([])

      // SL marker
      ctx.strokeStyle = '#FF4757'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(startX, trackY - trackH / 2 - 12)
      ctx.lineTo(startX, trackY + trackH / 2 + 12)
      ctx.stroke()
      ctx.fillStyle = '#FF4757'
      ctx.font = '500 10px DM Mono, monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SL', startX, trackY - trackH / 2 - 18)

      // Entry marker
      const entryX = startX + trkW * 0.1
      ctx.strokeStyle = 'rgba(107,130,153,0.4)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(entryX, trackY - trackH / 2 - 6)
      ctx.lineTo(entryX, trackY + trackH / 2 + 6)
      ctx.stroke()
      ctx.fillStyle = 'rgba(107,130,153,0.7)'
      ctx.fillText('ENTRY', entryX, trackY - trackH / 2 - 12)

      // Checkered TP
      const sqH = trackH / 8
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(10,14,20,0.9)'
        ctx.fillRect(endX, trackY - trackH / 2 + i * sqH, 9, sqH)
      }
      ctx.fillStyle = '#00E5A0'
      ctx.fillText('TP', endX + 4, trackY - trackH / 2 - 12)

      // Price sparkline (above track)
      // stored in liveState pricePoints — draw from stateRef trail
      // (simplified: just show the current position dot)

      // Car target X
      const entryRelX = entryX
      const targetX = entryRelX + st.progress * (trkW * 0.85)
      const clampedTarget = Math.max(startX - 8, Math.min(endX + 6, targetX))
      carX += (clampedTarget - carX) * 0.07

      const bounce = Math.sin(tick * 0.2) * (st.status !== 'racing' ? 0 : 1.8)
      const cy = trackY + bounce

      // Speed lines
      if (st.status === 'racing' && !paused) {
        ctx.strokeStyle = 'rgba(139,108,247,0.3)'
        ctx.lineWidth = 1
        ;[-5, 0, 5].forEach(dy => {
          const len = 8 + Math.random() * 12
          ctx.beginPath()
          ctx.moveTo(carX - 26, cy + dy)
          ctx.lineTo(carX - 26 - len, cy + dy)
          ctx.stroke()
        })
      }

      if (st.status === 'sl_hit') {
        // Explosion
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + tick * 0.04
          const rad = 18 + Math.sin(tick * 0.3 + i) * 6
          ctx.fillStyle = i % 2 === 0 ? 'rgba(255,71,87,0.8)' : 'rgba(255,176,32,0.8)'
          ctx.beginPath()
          ctx.arc(carX + Math.cos(angle) * rad, cy + Math.sin(angle) * rad, 5, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (st.status === 'tp_hit') {
        // Win glow
        ctx.fillStyle = 'rgba(0,229,160,0.15)'
        ctx.beginPath()
        ctx.arc(carX, cy, 36 + Math.sin(tick * 0.15) * 4, 0, Math.PI * 2)
        ctx.fill()
      }

      if (st.status !== 'sl_hit') {
        const bodyCol = st.status === 'tp_hit' ? '#00E5A0' : '#8B6CF7'
        const deckCol = st.status === 'tp_hit' ? '#00A370' : '#5E3FD6'

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)'
        ctx.beginPath()
        ctx.ellipse(carX, cy + 14, 24, 5, 0, 0, Math.PI * 2)
        ctx.fill()

        // Body
        ctx.fillStyle = bodyCol
        ctx.beginPath()
        ctx.roundRect(carX - 22, cy - 10, 44, 20, 5)
        ctx.fill()

        // Cockpit
        ctx.fillStyle = deckCol
        ctx.beginPath()
        ctx.roundRect(carX - 8, cy - 8, 20, 13, 3)
        ctx.fill()

        // Windshield
        ctx.fillStyle = 'rgba(180,220,255,0.3)'
        ctx.beginPath()
        ctx.roundRect(carX - 6, cy - 6, 9, 9, 2)
        ctx.fill()

        // Wheels
        ;[[-17, -12], [11, -12], [-17, 8], [11, 8]].forEach(([wx, wy]) => {
          ctx.fillStyle = '#07090C'
          ctx.beginPath()
          ctx.ellipse(carX + wx, cy + wy, 5.5, 3.5, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.strokeStyle = '#1C2733'
          ctx.lineWidth = 0.8
          ctx.stroke()
        })

        // Front wing
        ctx.fillStyle = bodyCol
        ctx.beginPath()
        ctx.roundRect(carX + 20, cy - 5, 9, 9, 2)
        ctx.fill()
      }

      // Result banner
      if (st.status !== 'racing') {
        const won = st.status === 'tp_hit'
        ctx.fillStyle = won ? 'rgba(0,229,160,0.9)' : 'rgba(255,71,87,0.9)'
        ctx.beginPath()
        ctx.roundRect(W / 2 - 150, H / 2 - 22, 300, 44, 8)
        ctx.fill()
        ctx.fillStyle = '#07090C'
        ctx.font = '600 14px Syne, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(won ? '🏁  TP REACHED — RACE WON!' : '💥  SL HIT — TRADE CLOSED', W / 2, H / 2 + 5)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [paused])

  const reset = () => {
    const state = initState()
    stateRef.current = state
    setLiveState(state)
  }

  return (
    <div className="card overflow-hidden">
      {/* Controls top */}
      <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
        <div className="flex gap-2">
          {SYMBOLS.map(s => (
            <button key={s} onClick={() => setSymbol(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                symbol === s ? 'bg-brand-purple text-white' : 'bg-brand-bg text-brand-dim border border-brand-border hover:border-brand-border-hi'
              }`}>{s}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['bull','chop','bear'] as Scenario[]).map(sc => (
            <button key={sc} onClick={() => setScenario(sc)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                scenario === sc ? 'bg-brand-surface border border-brand-border-hi text-brand-text' : 'text-brand-muted hover:text-brand-dim'
              }`}>{sc === 'bull' ? '📈' : sc === 'chop' ? '〰' : '📉'} {sc}</button>
          ))}
          <button onClick={() => setPaused(p => !p)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-brand-muted hover:text-brand-dim transition-all">
            {paused ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button onClick={reset}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-brand-muted hover:text-brand-dim transition-all">
            ↺ Reset
          </button>
        </div>
      </div>

      {/* HUD */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Price',      val: liveState?.price.toFixed(2) ?? '—', color: '' },
          { label: 'P&L pips',  val: liveState ? (liveState.pnlPips >= 0 ? '+' : '') + liveState.pnlPips : '—', color: liveState && liveState.pnlPips > 0 ? 'text-brand-green' : liveState && liveState.pnlPips < 0 ? 'text-brand-red' : '' },
          { label: '% to TP',   val: liveState ? Math.max(0, Math.min(100, Math.round(liveState.progress * 100))) + '%' : '—', color: '' },
          { label: 'Risk left', val: liveState ? Math.round(liveState.riskPct * 100) + '%' : '—', color: liveState && liveState.riskPct < 0.35 ? 'text-brand-red' : liveState && liveState.riskPct < 0.6 ? 'text-brand-amber' : 'text-brand-green' },
        ].map(s => (
          <div key={s.label} className="bg-brand-bg rounded-lg p-3 text-center">
            <div className="text-xs text-brand-muted font-display uppercase tracking-wider mb-1">{s.label}</div>
            <div className={`font-mono font-medium text-base ${s.color || 'text-brand-bright'}`}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} width={760} height={200}
        className="w-full rounded-lg bg-brand-bg" style={{ aspectRatio: '760/200' }} />

      {/* Trade inputs */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {(['entry','sl','tp'] as const).map(field => (
          <div key={field}>
            <label className="input-label">{field === 'sl' ? 'Stop loss' : field === 'tp' ? 'Take profit' : 'Entry'}</label>
            <input type="number" className="input" value={(setup as any)[field]}
              onChange={e => setSetup(prev => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }))}
              step={symbol.includes('USD') && !symbol.includes('XAU') ? 0.0001 : 1}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-brand-border flex items-center justify-between">
        <p className="text-xs text-brand-muted">Live price feed via Twelve Data API when connected</p>
        <a href="/auth/signup" className="btn-primary text-xs px-4 py-2">Connect MT5 to go live →</a>
      </div>
    </div>
  )
}
