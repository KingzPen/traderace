# TradeRace

> Turn your live MT5 trades into a race. Stop staring at charts.

## What this is

TradeRace is a trading psychology tool that gamifies live MT5 trades. Your car's position on a race track maps to real price movement between your entry and TP. SL and TP are required — that's the first discipline habit.

## Phase 1 scope (this repo)

- Landing page with live demo race
- Magic link auth (email only, no password)
- 3-step onboarding: trader type → MT5 connect → first trade
- MT5 investor password connection (read-only, cannot touch trades)
- Pit lane dashboard (all active races)
- Full-screen race view with live price
- Post-trade debrief modal
- Discipline score tracking

## Tech stack

| Layer        | Choice                    | Why                                         |
|--------------|---------------------------|---------------------------------------------|
| Framework    | Next.js 14 (App Router)   | API routes + React in one deployment        |
| Auth         | Supabase Auth (magic link)| No password friction                        |
| Database     | Supabase (Postgres)       | Trades, users, debriefs, scores             |
| MT5 bridge   | MetaAPI.cloud             | Cloud MT5 investor password connector       |
| Price feed   | Twelve Data               | Real-time forex/metal/index prices          |
| Billing      | Stripe                    | Subscriptions + prop firm seats             |
| Deployment   | Vercel                    | Zero-config Next.js hosting                 |
| Styling      | Tailwind CSS + custom CSS | Dark racing aesthetic                       |
| Animation    | Framer Motion + Canvas    | Smooth UI + game rendering                  |

## Local setup

```bash
# 1. Clone and install
git clone https://github.com/your-org/traderace
cd traderace
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Fill in your keys (see below)

# 3. Run development server
npm run dev
# → http://localhost:3000
```

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL        # From supabase.com project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY   # From supabase.com project settings
SUPABASE_SERVICE_ROLE_KEY       # Server-only, never expose to client
METAAPI_TOKEN                   # From metaapi.cloud (MT5 connector)
TWELVE_DATA_API_KEY             # From twelvedata.com (price feed)
STRIPE_SECRET_KEY               # From stripe.com dashboard
STRIPE_WEBHOOK_SECRET           # From stripe.com webhook settings
```

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard or:
vercel env add METAAPI_TOKEN
vercel env add TWELVE_DATA_API_KEY
# ... etc

# Production deploy
vercel --prod
```

## MT5 connection — how it works

TradeRace uses the **investor (read-only) password** — the same mechanism used by TradeZella, Edgewonk, and other trade journals.

1. Trader enters: MT5 server name, account number, investor password
2. MetaAPI.cloud connects to the broker's MT5 server on our behalf
3. We read open positions in real time (entry, SL, TP, current price)
4. We cannot place, modify, or close any trades — the investor password is read-only by the MT5 protocol

**MetaAPI setup:**
1. Sign up at https://metaapi.cloud
2. Get your token from the dashboard
3. Set `METAAPI_TOKEN` in your environment

## Price feed — how it works

TradeRace uses Twelve Data for live price ticks.

- Free tier: 800 API calls/day (fine for early users)
- Paid tier: Real-time WebSocket, unlimited calls

**Twelve Data setup:**
1. Sign up at https://twelvedata.com
2. Get your API key
3. Set `TWELVE_DATA_API_KEY` in your environment

In development without an API key, prices are simulated.

## Supabase schema (run in SQL editor)

```sql
-- Users (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users primary key,
  name text,
  trader_type text check (trader_type in ('intraday','swing','scalper')),
  plan text default 'free' check (plan in ('free','pro','prop')),
  created_at timestamptz default now()
);

-- Broker connections
create table broker_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles not null,
  platform text check (platform in ('mt5','mt4','ctrader')),
  broker_name text,
  server text not null,
  account_number text not null,
  -- investor_password is NEVER stored. It's passed to MetaAPI and discarded.
  metaapi_account_id text, -- MetaAPI's internal account reference
  status text default 'connected',
  last_sync timestamptz,
  created_at timestamptz default now()
);

-- Trades
create table trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles not null,
  connection_id uuid references broker_connections,
  broker_ticket bigint,
  symbol text not null,
  direction text check (direction in ('BUY','SELL')),
  entry numeric not null,
  sl numeric not null,
  tp numeric not null,
  lots numeric default 0.01,
  open_time timestamptz default now(),
  close_time timestamptz,
  close_price numeric,
  status text default 'open',
  created_at timestamptz default now()
);

-- Post-trade debriefs
create table debriefs (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid references trades not null,
  user_id uuid references profiles not null,
  interference text check (interference in ('none','moved_sl','closed_early','added_position')),
  emotion text check (emotion in ('calm','anxious','confident','frustrated','greedy','fearful')),
  notes text,
  discipline_score_delta integer,
  created_at timestamptz default now()
);

-- Discipline scores (updated after each debrief)
create table discipline_scores (
  user_id uuid references profiles primary key,
  overall integer default 50,
  sl_respect integer default 50,
  no_early_exits integer default 50,
  plan_adherence integer default 50,
  debrief_streak integer default 0,
  current_streak integer default 0,
  updated_at timestamptz default now()
);

-- Row level security
alter table profiles enable row level security;
alter table broker_connections enable row level security;
alter table trades enable row level security;
alter table debriefs enable row level security;
alter table discipline_scores enable row level security;

-- Policies (users can only see their own data)
create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "own connections" on broker_connections for all using (auth.uid() = user_id);
create policy "own trades" on trades for all using (auth.uid() = user_id);
create policy "own debriefs" on debriefs for all using (auth.uid() = user_id);
create policy "own score" on discipline_scores for all using (auth.uid() = user_id);
```

## Folder structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── auth/
│   │   ├── login/page.tsx          # Magic link auth
│   │   └── signup/page.tsx
│   ├── onboarding/page.tsx         # 3-step onboarding
│   ├── dashboard/page.tsx          # Pit lane
│   ├── race/[id]/page.tsx          # Live race view
│   └── api/
│       ├── auth/magic-link/        # Magic link sender
│       ├── broker/
│       │   ├── connect/            # MT5 investor password connect
│       │   └── open-trades/        # Poll open positions
│       ├── price/                  # Twelve Data price feed
│       └── trade/
│           └── manual/             # Manual trade entry
├── components/
│   ├── DemoRaceEmbed.tsx           # Landing page live demo
│   ├── FeaturesSection.tsx
│   ├── HookSlider.tsx
│   ├── PricingSection.tsx
│   └── onboarding/
│       ├── WelcomeStep.tsx
│       ├── BrokerConnectStep.tsx   # MT5 connection UI
│       └── FirstTradeStep.tsx
├── types/index.ts                  # All TypeScript types
└── styles/globals.css
```

## Phase 2 (next)

- Analytics dashboard (discipline score breakdown, trade calendar)
- Trade history + replay
- Push notifications for swing traders
- Cooldown gate after SL hit
- Stripe billing integration
- Additional game skins
