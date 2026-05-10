'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { DemoRaceEmbed } from '@/components/DemoRaceEmbed'
import { PricingSection } from '@/components/PricingSection'
import { FeaturesSection } from '@/components/FeaturesSection'
import { HookSlider } from '@/components/HookSlider'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <div className="min-h-screen bg-brand-bg overflow-x-hidden">

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-brand-bg/90 backdrop-blur border-b border-brand-border' : ''
      }`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-green flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h9M7 3l5 4-5 4" stroke="#07090C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-700 text-brand-bright text-lg tracking-tight">TradeRace</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-brand-dim">
            <a href="#features" className="animated-link hover:text-brand-text transition-colors">Features</a>
            <a href="#pricing"  className="animated-link hover:text-brand-text transition-colors">Pricing</a>
            <a href="#demo"     className="animated-link hover:text-brand-text transition-colors">Demo</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost text-xs px-3 py-1.5">Sign in</Link>
            <Link href="/auth/signup" className="btn-primary text-xs px-4 py-2">Start free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-6">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-purple opacity-5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-border bg-brand-surface text-xs text-brand-dim mb-8">
              <span className="dot-live" />
              Live on real MT5 price data
            </div>

            <h1 className="font-display font-800 text-5xl md:text-7xl text-brand-bright leading-[1.05] tracking-tight mb-6">
              Stop staring at{' '}
              <span className="text-brand-green">the chart.</span>
            </h1>

            <p className="text-lg md:text-xl text-brand-dim max-w-2xl mx-auto leading-relaxed mb-4">
              Most traders don't lose because of bad entries.
              They lose because they <em className="text-brand-text not-italic">interfere</em> after the trade is placed.
            </p>
            <p className="text-lg md:text-xl text-brand-text max-w-2xl mx-auto leading-relaxed mb-10">
              TradeRace turns your live MT5 trade into a race — your car drives to TP
              while you stay out of it.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
              <Link href="/auth/signup" className="btn-primary text-base px-8 py-4">
                Connect MT5 free
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <a href="#demo" className="btn-secondary text-base px-8 py-4">
                Watch a live race
              </a>
            </div>
          </motion.div>

          {/* Hook slider */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <HookSlider />
          </motion.div>
        </div>
      </section>

      {/* Live demo */}
      <section id="demo" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="section-label mb-3">Live demo</p>
            <h2 className="font-display font-700 text-3xl md:text-4xl text-brand-bright mb-4">
              Your trade, right now
            </h2>
            <p className="text-brand-dim max-w-xl mx-auto">
              This is running on real XAUUSD price data. Set an entry, SL, and TP — then watch your car race.
            </p>
          </div>
          <DemoRaceEmbed />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <FeaturesSection />
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <PricingSection />
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-border py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-brand-green flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M1 7h9M7 3l5 4-5 4" stroke="#07090C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-600 text-brand-bright text-sm">TradeRace</span>
          </div>
          <p className="text-xs text-brand-muted">Trading involves risk. TradeRace is a psychology tool, not financial advice.</p>
          <div className="flex gap-4 text-xs text-brand-muted">
            <a href="#" className="hover:text-brand-text transition-colors">Privacy</a>
            <a href="#" className="hover:text-brand-text transition-colors">Terms</a>
            <a href="#" className="hover:text-brand-text transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
