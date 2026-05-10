// ─── User & Auth ────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name?: string
  traderType: 'intraday' | 'swing' | 'scalper'
  createdAt: string
  plan: 'free' | 'pro' | 'prop'
}

// ─── Broker Connection ───────────────────────────────────────────────────────

export interface BrokerConnection {
  id: string
  userId: string
  platform: 'mt5' | 'mt4' | 'ctrader'
  brokerName: string
  server: string
  accountNumber: string
  // investorPassword never stored on client — server only
  status: 'connected' | 'disconnected' | 'error' | 'testing'
  lastSync?: string
  accountBalance?: number
  currency?: string
  leverage?: string
}

export interface MT5ConnectPayload {
  server: string
  accountNumber: string
  investorPassword: string
  brokerName: string
}

export interface MT5ConnectResult {
  success: boolean
  connection?: BrokerConnection
  error?: string
  accountInfo?: {
    balance: number
    currency: string
    leverage: string
    name: string
  }
}

// ─── Trade ───────────────────────────────────────────────────────────────────

export type TradeDirection = 'BUY' | 'SELL'
export type TradeStatus = 'open' | 'closed_tp' | 'closed_sl' | 'closed_manual'

export interface Trade {
  id: string
  userId: string
  connectionId?: string
  // MT5 ticket number if from broker sync
  brokerTicket?: number
  symbol: string
  direction: TradeDirection
  entry: number
  sl: number
  tp: number
  lots: number
  openTime: string
  closeTime?: string
  closePrice?: number
  status: TradeStatus
  // Computed in real-time
  currentPrice?: number
  pnlPips?: number
  progress?: number   // 0–1 toward TP
  riskPct?: number    // % of SL buffer remaining
}

export interface ManualTradePayload {
  symbol: string
  direction: TradeDirection
  entry: number
  sl: number
  tp: number
  lots?: number
}

// ─── Game State ──────────────────────────────────────────────────────────────

export type GameScenario = 'bull' | 'chop' | 'bear'
export type GameStatus = 'waiting' | 'racing' | 'tp_hit' | 'sl_hit' | 'cooldown'

export interface GameState {
  trade: Trade
  status: GameStatus
  priceHistory: number[]
  cooldownEndsAt?: string
}

// ─── Debrief ─────────────────────────────────────────────────────────────────

export type InterferenceType = 'none' | 'moved_sl' | 'closed_early' | 'added_position'
export type EmotionType = 'calm' | 'anxious' | 'confident' | 'frustrated' | 'greedy' | 'fearful'

export interface Debrief {
  id: string
  tradeId: string
  userId: string
  interference: InterferenceType
  emotion: EmotionType
  notes?: string
  disciplineScoreDelta: number
  createdAt: string
}

// ─── Discipline Score ────────────────────────────────────────────────────────

export interface DisciplineScore {
  overall: number
  slRespect: number
  noEarlyExits: number
  planAdherence: number
  debriefStreak: number
  currentStreak: number
  lastUpdated: string
}

// ─── Price Feed ──────────────────────────────────────────────────────────────

export interface PriceTick {
  symbol: string
  bid: number
  ask: number
  timestamp: number
}

export interface PriceUpdate {
  trade: Trade
  tick: PriceTick
}

// ─── Onboarding ──────────────────────────────────────────────────────────────

export type OnboardingStep = 'welcome' | 'connect' | 'first_trade'

export interface OnboardingState {
  step: OnboardingStep
  traderType?: User['traderType']
  connectionResult?: MT5ConnectResult
  complete: boolean
}
