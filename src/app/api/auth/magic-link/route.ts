import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, plan } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    // In production: use Supabase Auth magic link
    // const supabase = createClient()
    // const { error } = await supabase.auth.signInWithOtp({
    //   email,
    //   options: {
    //     emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    //     data: { plan }
    //   }
    // })

    console.log(`[DEV] Magic link for: ${email}, plan: ${plan}`)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 })
  }
}
