/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        mono:    ['var(--font-geist-mono)', 'monospace'],
        body:    ['var(--font-dm-sans)', 'sans-serif'],
      },
      colors: {
        brand: {
          bg:       '#07090C',
          surface:  '#0D1117',
          panel:    '#111820',
          border:   '#1C2733',
          'border-hi': '#253040',
          muted:    '#3D5570',
          dim:      '#6B8299',
          text:     '#C8D8E8',
          bright:   '#EDF4FF',
          green:    '#00E5A0',
          'green-dim':'#00A370',
          red:      '#FF4757',
          'red-dim':'#C0392B',
          amber:    '#FFB020',
          purple:   '#8B6CF7',
          'purple-dim':'#5E3FD6',
        }
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231C2733' fill-opacity='0.5'%3E%3Cpath d='M0 0h1v40H0zM0 0v1h40V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'race-slide': 'raceSlide 0.3s ease-out',
        'fade-up':    'fadeUp 0.5s ease-out forwards',
        'glow':       'glow 2s ease-in-out infinite',
      },
      keyframes: {
        raceSlide: {
          '0%':   { transform: 'translateX(-4px)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        fadeUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(0,229,160,0.15)' },
          '50%':      { boxShadow: '0 0 28px rgba(0,229,160,0.35)' },
        }
      }
    },
  },
  plugins: [],
}
