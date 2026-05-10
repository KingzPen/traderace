'use client'
import { useState } from 'react'
import Link from 'next/link'

const tiers = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    desc: 'One game skin, live demo, manual trade entry. Enough to feel the difference.',
    cta: 'Start free',
    ctaHref: '/auth/signup',
    featured: false,
    features: [
      'Racing game (1 skin)',
      'Manual trade entry',
      'Live price feed (XAUUSD, EURUSD)',
      'Basic HUD',
      'Post-trade debrief',
      '1 broker connection',
    ],
  },
  {
    name: 'Pro',
    price: { monthly: 19, annual: 15 },
    desc: 'Live MT5 sync, all game skins, full analytics and discipline score.',
    cta: 'Start 7-day trial',
    ctaHref: '/auth/signup?plan=pro',
    featured: true,
    features: [
      'Everything in Free',
      'MT5 / MT4 investor password sync',
      'Auto trade detection',
      'All symbols + all skins',
      'Pit lane multi-trade dashboard',
      'Cooldown gate',
      'Discipline score + analytics',
      'Trade history + replay',
      'Push notifications',
      'Up to 3 broker accounts',
    ],
  },
  {
    name: 'Prop desk',
    price: { monthly: 99, annual: 79 },
    desc: 'Per seat. For prop firms to mandate for funded traders. Reduces blowups.',
    cta: 'Contact us',
    ctaHref: 'mailto:hello@traderace.io',
    featured: false,
    features: [
      'Everything in Pro',
      'Firm admin dashboard',
      'All trader discipline scores',
      'Behaviour alert system',
      'Monthly PDF reports',
      'Bulk seat management',
      'White-label option',
      'Priority support + SLA',
    ],
  },
]

export function PricingSection() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <p className="section-label mb-3">Pricing</p>
        <h2 className="font-display font-700 text-3xl md:text-4xl text-brand-bright mb-4">
          Simple, transparent
        </h2>
        <div className="inline-flex items-center gap-3 p-1 bg-brand-surface border border-brand-border rounded-lg">
          <button onClick={() => setAnnual(false)}
            className={`px-4 py-1.5 rounded-md text-sm font-500 transition-all ${!annual ? 'bg-brand-panel text-brand-bright shadow-sm' : 'text-brand-muted'}`}>
            Monthly
          </button>
          <button onClick={() => setAnnual(true)}
            className={`px-4 py-1.5 rounded-md text-sm font-500 transition-all ${annual ? 'bg-brand-panel text-brand-bright' : 'text-brand-muted'}`}>
            Annual <span className="text-brand-green text-xs ml-1">-20%</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {tiers.map(tier => (
          <div key={tier.name}
            className={`rounded-xl p-6 flex flex-col ${
              tier.featured
                ? 'bg-brand-panel border-2 border-brand-purple relative'
                : 'bg-brand-surface border border-brand-border'
            }`}
          >
            {tier.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="badge-purple text-xs px-3 py-1">Most popular</span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-display font-600 text-brand-bright text-lg mb-1">{tier.name}</h3>
              <div className="flex items-baseline gap-1 my-3">
                <span className="font-display font-700 text-3xl text-brand-bright">
                  ${annual ? tier.price.annual : tier.price.monthly}
                </span>
                {tier.price.monthly > 0 && (
                  <span className="text-brand-muted text-sm">/month</span>
                )}
                {tier.price.monthly === 0 && (
                  <span className="text-brand-muted text-sm">forever</span>
                )}
              </div>
              <p className="text-brand-dim text-xs leading-relaxed">{tier.desc}</p>
            </div>

            <ul className="flex-1 space-y-2.5 mb-6">
              {tier.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-brand-text">
                  <svg className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <Link href={tier.ctaHref}
              className={tier.featured ? 'btn-primary w-full justify-center' : 'btn-secondary w-full justify-center'}>
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-brand-muted mt-8">
        No credit card required for Free tier. Pro trial cancels automatically. Prop desk billed annually.
      </p>
    </div>
  )
}
