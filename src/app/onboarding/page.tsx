'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { WelcomeStep } from '@/components/onboarding/WelcomeStep'
import { BrokerConnectStep } from '@/components/onboarding/BrokerConnectStep'
import { FirstTradeStep } from '@/components/onboarding/FirstTradeStep'
import type { OnboardingState } from '@/types'

const STEPS = ['welcome', 'connect', 'first_trade'] as const

export default function OnboardingPage() {
  const router = useRouter()
  const [state, setState] = useState<OnboardingState>({
    step: 'welcome',
    complete: false,
  })

  const stepIndex = STEPS.indexOf(state.step)

  function next(update?: Partial<OnboardingState>) {
    const nextStep = STEPS[stepIndex + 1]
    if (!nextStep) {
      router.push('/dashboard')
      return
    }
    setState(prev => ({ ...prev, ...update, step: nextStep }))
  }

  function skip() {
    const nextStep = STEPS[stepIndex + 1]
    if (!nextStep) { router.push('/dashboard'); return }
    setState(prev => ({ ...prev, step: nextStep }))
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      {/* Progress bar */}
      <div className="relative z-10 px-8 pt-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-brand-green flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7h9M7 3l5 4-5 4" stroke="#07090C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-display font-700 text-brand-bright">TradeRace</span>
            </div>
            <span className="text-xs text-brand-muted font-mono">Step {stepIndex + 1} of {STEPS.length}</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill bg-brand-green"
              style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {state.step === 'welcome' && (
                <WelcomeStep onNext={(traderType) => next({ traderType })} />
              )}
              {state.step === 'connect' && (
                <BrokerConnectStep
                  onNext={(result) => next({ connectionResult: result })}
                  onSkip={skip}
                />
              )}
              {state.step === 'first_trade' && (
                <FirstTradeStep
                  connection={state.connectionResult?.connection}
                  onNext={() => router.push('/dashboard')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
