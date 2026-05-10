import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────────────────────
// Price Feed API
//
// Fetches live price for a given symbol from Twelve Data.
// In production this is backed by a WebSocket connection that stays open
// and pushes ticks to connected clients via Server-Sent Events or
// our own WebSocket relay.
//
// Free tier: 800 API calls/day, 8 calls/minute
// Paid tier: real-time WebSocket, unlimited symbols
//
// Symbol mapping:
//   MT5 symbol → Twelve Data symbol
//   XAUUSD     → XAU/USD
//   EURUSD     → EUR/USD
//   NAS100     → NDX (requires Twelve Data plan)
// ─────────────────────────────────────────────────────────────────────────────

const SYMBOL_MAP: Record<string, string> = {
  XAUUSD: 'XAU/USD',
  EURUSD: 'EUR/USD',
  GBPUSD: 'GBP/USD',
  USDJPY: 'USD/JPY',
  GBPJPY: 'GBP/JPY',
  AUDUSD: 'AUD/USD',
  USDCAD: 'USD/CAD',
  NAS100: 'NDX',
  US30:   'DJI',
  BTCUSD: 'BTC/USD',
  ETHUSD: 'ETH/USD',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol') ?? 'XAUUSD'

  const tdSymbol = SYMBOL_MAP[symbol.toUpperCase()]
  if (!tdSymbol) {
    return NextResponse.json({ error: `Symbol ${symbol} not supported` }, { status: 400 })
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY

  if (!apiKey) {
    // Return a realistic simulated price for development
    const basePrices: Record<string, number> = {
      XAUUSD: 2320, EURUSD: 1.0850, GBPUSD: 1.2700, USDJPY: 149.50,
      NAS100: 19800, US30: 39000, BTCUSD: 67000, ETHUSD: 3500,
    }
    const base = basePrices[symbol] ?? 1.0
    const jitter = (Math.random() - 0.5) * base * 0.001
    const price = parseFloat((base + jitter).toFixed(symbol.includes('JPY') ? 2 : 5))
    return NextResponse.json({ symbol, price, source: 'simulated', timestamp: Date.now() })
  }

  try {
    const url = `https://api.twelvedata.com/price?symbol=${encodeURIComponent(tdSymbol)}&apikey=${apiKey}`
    const res = await fetch(url, { next: { revalidate: 0 } })
    const data = await res.json()

    if (data.status === 'error') {
      throw new Error(data.message)
    }

    return NextResponse.json({
      symbol,
      price: parseFloat(data.price),
      source: 'twelvedata',
      timestamp: Date.now(),
    })
  } catch (err) {
    console.error('Price fetch error:', err)
    return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 })
  }
}
