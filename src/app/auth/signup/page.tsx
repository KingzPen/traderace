'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

function SignupForm() {
  const params    = useSearchParams()
  const isSignup  = params.get('mode') !== 'login'
  const plan      = params.get('plan') ?? 'free'

  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan }),
      })
      if (!res.ok) throw new Error('Failed')
      setSent(true)
    } catch {
      toast.error('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-brand-green bg-opacity-10 border border-brand-green border-opacity-20 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M4 14l7 7L24 7" stroke="#00E5A0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="font-display font-bold text-2xl text-brand-bright mb-3">Check your inbox</h2>
        <p className="text-brand-dim text-sm leading-relaxed mb-6">
          We sent a magic link to <strong className="text-brand-text">{email}</strong>.<br/>
          Click it to sign in — no password needed.
        </p>
        <p className="text-xs text-brand-muted">
          Link expires in 15 minutes.{' '}
          <button onClick={() => setSent(false)} className="text-brand-purple hover:text-brand-text transition-colors">
            Use a different email
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="font-display font-bold text-3xl text-brand-bright mb-2">
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-brand-dim text-sm">
          {isSignup ? 'No credit card. No password. Just your email.' : 'Enter your email to sign in.'}
        </p>
        {isSignup && plan === 'pro' && (
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-brand-purple bg-opacity-10 border border-brand-purple border-opacity-20 text-xs text-brand-purple">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 9l-3 1.5.5-3.5L1 4.5l3.5-.5L6 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
            Pro trial — 7 days free
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">Email address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input"
            required
            autoFocus
          />
        </div>

        <button type="submit" disabled={loading || !email}
          className="btn-primary w-full justify-center py-3.5 text-sm">
          {loading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/>
            </svg>
          ) : (
            <>
              {isSignup ? 'Send magic link' : 'Sign in with magic link'}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </>
          )}
        </button>

        <div className="relative flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-brand-border" />
          <span className="text-xs text-brand-muted">or</span>
          <div className="flex-1 h-px bg-brand-border" />
        </div>

        <button type="button"
          className="btn-secondary w-full justify-center py-3 text-sm"
          onClick={() => toast('Google SSO coming soon!')}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M15.5 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.2a3.6 3.6 0 01-1.56 2.36v1.96h2.52C14.74 12.55 15.5 10.53 15.5 8.18z" fill="#4285F4"/>
            <path d="M8 16c2.1 0 3.87-.7 5.16-1.88l-2.52-1.96c-.7.47-1.59.75-2.64.75-2.03 0-3.74-1.37-4.35-3.21H1.06v2.02A8 8 0 008 16z" fill="#34A853"/>
            <path d="M3.65 9.7A4.8 4.8 0 013.4 8c0-.59.1-1.16.25-1.7V4.28H1.06A8 8 0 000 8c0 1.29.31 2.51.86 3.59L3.65 9.7z" fill="#FBBC04"/>
            <path d="M8 3.18c1.14 0 2.17.39 2.98 1.16l2.22-2.22C11.86.79 10.09 0 8 0A8 8 0 001.06 4.28l2.59 2.02C4.26 4.56 5.97 3.18 8 3.18z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </form>

      <p className="text-center text-xs text-brand-muted mt-6">
        {isSignup ? 'Already have an account? ' : 'No account yet? '}
        <Link href={isSignup ? '/auth/login?mode=login' : '/auth/login'}
          className="text-brand-purple hover:text-brand-text transition-colors">
          {isSignup ? 'Sign in' : 'Create one free'}
        </Link>
      </p>

      <p className="text-center text-xs text-brand-muted mt-4 leading-relaxed">
        By continuing you agree to our{' '}
        <a href="#" className="hover:text-brand-text transition-colors">Terms</a> and{' '}
        <a href="#" className="hover:text-brand-text transition-colors">Privacy Policy</a>.
      </p>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
