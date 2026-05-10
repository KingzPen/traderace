import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'TradeRace — Turn your trades into a race',
  description: 'Stop staring at charts. TradeRace gamifies your live MT5 trades — your car races to TP while you stay out of the trade.',
  keywords: ['trading psychology', 'trade journal', 'MT5', 'forex gamification', 'discipline'],
  openGraph: {
    title: 'TradeRace',
    description: 'Stop staring at charts. Your trade, gamified.',
    type: 'website',
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#111820',
              color: '#C8D8E8',
              border: '1px solid #1C2733',
              borderRadius: '10px',
              fontSize: '13px',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#00E5A0', secondary: '#07090C' } },
            error:   { iconTheme: { primary: '#FF4757', secondary: '#07090C' } },
          }}
        />
      </body>
    </html>
  )
}
