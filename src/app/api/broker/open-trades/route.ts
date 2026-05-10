import { NextRequest, NextResponse } from 'next/server'
import type { Trade } from '@/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const connectionId = searchParams.get('connectionId')

  if (!connectionId) {
    return NextResponse.json({ error: 'connectionId required' }, { status: 400 })
  }

  // In production: query MetaAPI or direct MT5 connection for open positions
  // const positions = await getOpenPositions(connectionId)

  // Demo: return simulated open trades
  const isDemoMode = process.env.NODE_ENV === 'development' || !process.env.METAAPI_TOKEN

  if (isDemoMode) {
    const mockTrades: Trade[] = [
      {
        id: `trade_${Date.now()}`,
        userId: 'demo-user',
        connectionId,
        brokerTicket: 123456,
        symbol: 'XAUUSD',
        direction: 'BUY',
        entry: 2320.50,
        sl: 2300.00,
        tp: 2360.00,
        lots: 0.1,
        openTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
        status: 'open',
        currentPrice: 2328.30,
      }
    ]

    return NextResponse.json({ trades: mockTrades })
  }

  return NextResponse.json({ trades: [] })
}
