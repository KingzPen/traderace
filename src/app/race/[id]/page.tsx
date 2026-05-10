'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Status = 'racing' | 'tp_hit' | 'sl_hit' | 'cooldown'

interface LiveTrade {
  id: string
  symbol: string
  direction: string
  entry: number
  sl: number
  tp: number
  price: number
  progress: number
  riskPct: number
  pnlPips: number
  status: Status
}

export default function RacePage() {
  const params  = useParams()
  const router  = useRouter()
  const tradeId = params.id as string

  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const animRef     = useRef<number>()
  const stateRef    = useRef<LiveTrade | null>(null)
  const tickRef     = useRef<ReturnType<typeof setInterval>>()
  const carXRef     = useRef(0)
  const tickCount   = useRef(0)

  const [live, setLive]           = useState<LiveTrade | null>(null)
  const [paused, setPaused]       = useState(false)
  const [showDebrief, setDebrief] = useState(false)
  const [cooldownSecs, setCooldown] = useState(0)

  // Simulate live price updates (replace with real WebSocket in production)
  useEffect(() => {
    // Demo trade
    const demo: LiveTrade = {
      id: tradeId,
      symbol: 'XAUUSD',
      direction: 'BUY',
      entry: 2320,
      sl: 2300,
      tp: 2360,
      price: 2320,
      progress: 0,
      riskPct: 1,
      pnlPips: 0,
      status: 'racing',
    }
    stateRef.current = demo
    setLive(demo)
    carXRef.current = 0

    tickRef.current = setInterval(() => {
      if (paused) return
      const s = stateRef.current
      if (!s || s.status !== 'racing') return
      const range = s.tp - s.sl
      const noise = (Math.random() - 0.5) * 0.035 * range
      const drift = 0.012 * range * 0.1
      const mr    = (s.entry - s.price) * 0.005
      const newPrice = Math.max(s.sl - 2, Math.min(s.tp + 2, s.price + drift + noise + mr))
      const tpDist = s.tp - s.entry
      const slDist = Math.abs(s.sl - s.entry)
      const progress = (newPrice - s.entry) / tpDist
      const riskPct = Math.max(0, 1 - Math.max(0, s.entry - newPrice) / slDist)
      const pnlPips = parseFloat(((newPrice - s.entry) * 10).toFixed(1))
      const status: Status = newPrice <= s.sl ? 'sl_hit' : newPrice >= s.tp ? 'tp_hit' : 'racing'
      const next = { ...s, price: newPrice, progress, riskPct, pnlPips, status }
      stateRef.current = next
      setLive(next)

      if (status !== 'racing') {
        clearInterval(tickRef.current)
        setTimeout(() => setDebrief(true), 1800)
      }
    }, 500)

    return () => clearInterval(tickRef.current)
  }, [tradeId, paused])

  // Canvas draw loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function draw() {
      if (!ctx || !canvas) return
      const W = canvas.width, H = canvas.height
      const s = stateRef.current
      tickCount.current++
      const t = tickCount.current

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#07090C'
      ctx.fillRect(0, 0, W, H)

      // Grid
      ctx.strokeStyle = 'rgba(28,39,51,0.5)'
      ctx.lineWidth = 0.5
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }

      if (!s) { animRef.current = requestAnimationFrame(draw); return }

      const startX = 60, endX = W - 60, trackY = H * 0.5, trackH = 90, trkW = endX - startX

      // SL danger zone
      if (s.riskPct < 0.5) {
        const alpha = (1 - s.riskPct / 0.5) * 0.18
        ctx.fillStyle = `rgba(255,71,87,${alpha})`
        ctx.fillRect(startX, trackY - trackH / 2 - 6, trkW * 0.28, trackH + 12)
      }

      // Track
      ctx.fillStyle = '#0D1117'
      ctx.beginPath(); ctx.roundRect(startX, trackY - trackH/2, trkW, trackH, 10); ctx.fill()
      ctx.strokeStyle = '#1C2733'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.roundRect(startX, trackY - trackH/2, trkW, trackH, 10); ctx.stroke()

      // Rumble strips
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = i%2===0 ? 'rgba(255,71,87,0.6)' : 'rgba(255,255,255,0.6)'
        ctx.fillRect(startX + i * 7, trackY - trackH/2, 6, 10)
        ctx.fillRect(startX + i * 7, trackY + trackH/2 - 10, 6, 10)
      }

      // Lane dash
      ctx.setLineDash([18, 12]); ctx.strokeStyle = 'rgba(61,85,112,0.5)'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(startX+20, trackY); ctx.lineTo(endX-10, trackY); ctx.stroke()
      ctx.setLineDash([])

      // SL marker
      ctx.strokeStyle = '#FF4757'; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(startX,trackY-trackH/2-14); ctx.lineTo(startX,trackY+trackH/2+14); ctx.stroke()
      ctx.fillStyle = '#FF4757'; ctx.font = '500 11px DM Mono, monospace'; ctx.textAlign = 'center'
      ctx.fillText('SL', startX, trackY - trackH/2 - 20)
      ctx.fillStyle = 'rgba(255,71,87,0.5)'; ctx.font = '10px DM Mono, monospace'
      ctx.fillText(s.sl.toFixed(2), startX, trackY + trackH/2 + 26)

      // Entry
      const entryX = startX + trkW * 0.08
      ctx.strokeStyle = 'rgba(107,130,153,0.35)'; ctx.lineWidth = 1; ctx.setLineDash([4,4])
      ctx.beginPath(); ctx.moveTo(entryX,trackY-trackH/2-6); ctx.lineTo(entryX,trackY+trackH/2+6); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = 'rgba(107,130,153,0.6)'; ctx.font = '500 10px DM Mono'; ctx.textAlign = 'center'
      ctx.fillText('ENTRY', entryX, trackY - trackH/2 - 14)

      // Finish / TP
      for (let i=0; i<10; i++) {
        ctx.fillStyle = i%2===0 ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)'
        ctx.fillRect(endX, trackY-trackH/2 + i*(trackH/10), 11, trackH/10)
      }
      ctx.fillStyle = '#00E5A0'; ctx.font = '500 11px DM Mono'; ctx.textAlign = 'left'
      ctx.fillText('TP', endX+14, trackY-trackH/2-14)
      ctx.fillStyle = 'rgba(0,229,160,0.5)'; ctx.font = '10px DM Mono'
      ctx.fillText(s.tp.toFixed(2), endX+14, trackY+trackH/2+26)

      // Car target
      const entryRelX = entryX
      const targetX = entryRelX + s.progress * (trkW * 0.88)
      const clampedTarget = Math.max(startX-10, Math.min(endX+8, targetX))
      carXRef.current += (clampedTarget - carXRef.current) * 0.07
      const bounce = Math.sin(t * 0.18) * (s.status==='racing' ? 2 : 0)
      const cx = carXRef.current, cy = trackY + bounce

      // Speed lines
      if (s.status === 'racing') {
        ctx.strokeStyle = 'rgba(139,108,247,0.4)'; ctx.lineWidth = 1.2
        ;[-8,-2,4].forEach(dy => {
          const len = 10 + Math.random()*16
          ctx.beginPath(); ctx.moveTo(cx-28,cy+dy); ctx.lineTo(cx-28-len,cy+dy); ctx.stroke()
        })
      }

      // Crash
      if (s.status === 'sl_hit') {
        for (let i=0; i<10; i++) {
          const angle = (i/10)*Math.PI*2 + t*0.05
          const r = 22+Math.sin(t*0.3+i)*8
          ctx.fillStyle = i%2===0 ? `rgba(255,71,87,0.8)` : `rgba(255,176,32,0.7)`
          ctx.beginPath(); ctx.arc(cx+Math.cos(angle)*r, cy+Math.sin(angle)*r, 6, 0, Math.PI*2); ctx.fill()
        }
        ctx.fillStyle = 'rgba(255,71,87,0.12)'
        ctx.beginPath(); ctx.arc(cx,cy,40+Math.sin(t*0.1)*4,0,Math.PI*2); ctx.fill()
      }

      // Win glow
      if (s.status === 'tp_hit') {
        ctx.fillStyle = 'rgba(0,229,160,0.15)'
        ctx.beginPath(); ctx.arc(cx,cy,44+Math.sin(t*0.12)*5,0,Math.PI*2); ctx.fill()
      }

      if (s.status !== 'sl_hit') {
        const bodyCol = s.status==='tp_hit' ? '#00E5A0' : '#8B6CF7'
        const deckCol = s.status==='tp_hit' ? '#00A370' : '#5E3FD6'

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.35)'
        ctx.beginPath(); ctx.ellipse(cx, cy+17, 26, 6, 0, 0, Math.PI*2); ctx.fill()

        // Body
        ctx.fillStyle = bodyCol
        ctx.beginPath(); ctx.roundRect(cx-26,cy-12,52,24,6); ctx.fill()

        // Cockpit
        ctx.fillStyle = deckCol
        ctx.beginPath(); ctx.roundRect(cx-10,cy-10,24,16,4); ctx.fill()

        // Windshield
        ctx.fillStyle='rgba(180,220,255,0.3)'
        ctx.beginPath(); ctx.roundRect(cx-8,cy-8,11,11,2); ctx.fill()

        // Wheels
        ;[[-20,-14],[13,-14],[-20,9],[13,9]].forEach(([wx,wy])=>{
          ctx.fillStyle='#07090C'; ctx.beginPath(); ctx.ellipse(cx+wx,cy+wy,6.5,4,0,0,Math.PI*2); ctx.fill()
          ctx.strokeStyle='#1C2733'; ctx.lineWidth=0.8; ctx.stroke()
        })

        // Side pods
        ctx.fillStyle=bodyCol
        ctx.beginPath(); ctx.roundRect(cx+15,cy-16,14,8,2); ctx.fill()
        ctx.beginPath(); ctx.roundRect(cx+15,cy+8,14,8,2); ctx.fill()
        ctx.beginPath(); ctx.roundRect(cx-28,cy-16,12,8,2); ctx.fill()
        ctx.beginPath(); ctx.roundRect(cx-28,cy+8,12,8,2); ctx.fill()

        // Front wing
        ctx.beginPath(); ctx.roundRect(cx+24,cy-6,10,12,2); ctx.fill()
      }

      // Result overlay
      if (s.status !== 'racing') {
        const won = s.status === 'tp_hit'
        ctx.fillStyle = won ? 'rgba(0,229,160,0.92)' : 'rgba(255,71,87,0.92)'
        ctx.beginPath(); ctx.roundRect(W/2-180,H/2-28,360,56,10); ctx.fill()
        ctx.fillStyle = '#07090C'
        ctx.font = '600 15px Syne, sans-serif'; ctx.textAlign = 'center'
        ctx.fillText(won ? '🏁  TP REACHED — RACE WON!' : '💥  SL HIT — TRADE CLOSED', W/2, H/2+4)
        ctx.font = '400 12px DM Sans'; ctx.fillStyle = 'rgba(0,0,0,0.6)'
        ctx.fillText('Opening debrief...', W/2, H/2+22)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [])

  if (showDebrief) {
    return <DebriefModal trade={live} onDone={() => router.push('/dashboard')} />
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Race nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-bg">
        <Link href="/dashboard" className="flex items-center gap-2 text-brand-muted hover:text-brand-text transition-colors text-sm">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L4 8l6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Pit lane
        </Link>

        <div className="flex items-center gap-3">
          {live && (
            <>
              <span className="font-display font-semibold text-brand-bright">{live.symbol}</span>
              <span className={`badge-${live.direction==='BUY'?'green':'red'} text-xs`}>{live.direction}</span>
            </>
          )}
          <span className="dot-live" />
        </div>

        <button onClick={() => setPaused(p => !p)} className="btn-ghost text-xs">
          {paused ? '▶ Resume' : '⏸ Pause'}
        </button>
      </header>

      {/* HUD */}
      {live && (
        <div className="grid grid-cols-4 gap-3 px-6 py-3 border-b border-brand-border bg-brand-surface">
          {[
            { label: 'Price',     val: live.price.toFixed(live.symbol.includes('JPY') ? 2 : 2), color: '' },
            { label: 'P&L pips', val: (live.pnlPips>=0?'+':'')+live.pnlPips, color: live.pnlPips>0?'text-brand-green':live.pnlPips<0?'text-brand-red':'' },
            { label: '% to TP',  val: Math.max(0,Math.min(100,Math.round(live.progress*100)))+'%', color: live.progress>0.6?'text-brand-green':'' },
            { label: 'Risk left',val: Math.round(live.riskPct*100)+'%', color: live.riskPct<0.35?'text-brand-red':live.riskPct<0.6?'text-brand-amber':'text-brand-green' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-xs text-brand-muted font-display uppercase tracking-wider mb-1">{s.label}</div>
              <div className={`font-mono font-medium text-lg ${s.color||'text-brand-bright'}`}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-6">
        <canvas ref={canvasRef} width={900} height={340}
          className="w-full max-w-4xl rounded-xl border border-brand-border bg-brand-bg"
          style={{ aspectRatio: '900/340' }} />
      </div>

      {/* Bottom info */}
      <div className="px-6 py-3 border-t border-brand-border flex items-center justify-between text-xs text-brand-muted">
        <span>Entry: <span className="font-mono text-brand-text">{live?.entry}</span></span>
        <span>SL: <span className="font-mono text-brand-red">{live?.sl}</span></span>
        <span>TP: <span className="font-mono text-brand-green">{live?.tp}</span></span>
        <span>Lots: <span className="font-mono text-brand-text">0.1</span></span>
      </div>
    </div>
  )
}

function DebriefModal({ trade, onDone }: { trade: LiveTrade | null; onDone: () => void }) {
  const [interference, setInterference] = useState<string>('')
  const [emotion, setEmotion]           = useState<string>('')
  const [notes, setNotes]               = useState('')
  const [step, setStep]                 = useState(0)

  const won = trade?.status === 'tp_hit'

  function submit() {
    // POST to /api/debrief in production
    onDone()
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Result */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6 ${won ? 'bg-brand-green bg-opacity-10 border border-brand-green border-opacity-20' : 'bg-brand-red bg-opacity-10 border border-brand-red border-opacity-20'}`}>
          <span className="text-2xl">{won ? '🏆' : '💥'}</span>
        </div>

        <h2 className="font-display font-bold text-2xl text-brand-bright text-center mb-1">
          {won ? 'Race won!' : 'Trade closed'}
        </h2>
        <p className="text-brand-dim text-sm text-center mb-8">
          Quick debrief — 60 seconds. It feeds your discipline score.
        </p>

        <div className="card space-y-6">
          {/* Q1 - Interference */}
          <div>
            <p className="font-display font-medium text-brand-bright text-sm mb-3">Did you touch the trade while it was open?</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 'none',          label: 'No — let it run' },
                { val: 'closed_early',  label: 'Closed early' },
                { val: 'moved_sl',      label: 'Moved SL' },
                { val: 'added',         label: 'Added position' },
              ].map(o => (
                <button key={o.val} onClick={() => setInterference(o.val)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                    interference === o.val ? 'border-brand-purple bg-brand-purple bg-opacity-10 text-brand-bright' : 'border-brand-border text-brand-muted hover:border-brand-border-hi'
                  }`}>{o.label}</button>
              ))}
            </div>
          </div>

          {/* Q2 - Emotion */}
          <div>
            <p className="font-display font-medium text-brand-bright text-sm mb-3">How did you feel during the trade?</p>
            <div className="flex flex-wrap gap-2">
              {[
                { val: 'calm',       label: '😌 Calm' },
                { val: 'anxious',    label: '😰 Anxious' },
                { val: 'confident',  label: '💪 Confident' },
                { val: 'frustrated', label: '😤 Frustrated' },
                { val: 'greedy',     label: '🤑 Greedy' },
                { val: 'fearful',    label: '😨 Fearful' },
              ].map(o => (
                <button key={o.val} onClick={() => setEmotion(o.val)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                    emotion === o.val ? 'border-brand-purple bg-brand-purple bg-opacity-10 text-brand-bright' : 'border-brand-border text-brand-muted hover:border-brand-border-hi'
                  }`}>{o.label}</button>
              ))}
            </div>
          </div>

          {/* Q3 - Notes */}
          <div>
            <p className="font-display font-medium text-brand-bright text-sm mb-2">Anything to note? (optional)</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} maxLength={280}
              placeholder="What would you do differently next time?"
              className="input resize-none h-20 text-xs leading-relaxed" />
          </div>

          <button onClick={submit} disabled={!interference || !emotion}
            className="btn-primary w-full justify-center py-3">
            Submit debrief →
          </button>
        </div>

        <p className="text-center text-xs text-brand-muted mt-4">
          Your discipline score will update after submitting.
        </p>
      </div>
    </div>
  )
}
