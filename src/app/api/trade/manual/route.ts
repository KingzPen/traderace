import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { symbol, direction, entry, sl, tp, lots = 0.01 } = body

    if (!symbol || !direction || !entry || !sl || !tp) {
      return NextResponse.json({ error: 'All trade fields are required' }, { status: 400 })
    }

    // Validate SL/TP direction
    if (direction === 'BUY') {
      if (sl >= entry) return NextResponse.json({ error: 'SL must be below entry for BUY' }, { status: 400 })
      if (tp <= entry) return NextResponse.json({ error: 'TP must be above entry for BUY' }, { status: 400 })
    } else {
      if (sl <= entry) return NextResponse.json({ error: 'SL must be above entry for SELL' }, { status: 400 })
      if (tp >= entry) return NextResponse.json({ error: 'TP must be below entry for SELL' }, { status: 400 })
    }

    // In production: save to Supabase, associate with user session
    const tradeId = `trade_manual_${Date.now()}`

    // Store trade in DB:
    // await supabase.from('trades').insert({
    //   id: tradeId, user_id: userId, symbol, direction,
    //   entry, sl, tp, lots, status: 'open', open_time: new Date()
    // })

    return NextResponse.json({ tradeId, success: true })
  } catch (err) {
    console.error('Trade create error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
