import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A4D3E',
        accent: '#F4845F',
        ivory: '#FAF7F0',
        selected: '#FFF3ED',
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', '"Inter"', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'highlight': 'highlight 2s ease-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        highlight: {
          '0%': { boxShadow: '0 0 0 0 rgba(244, 132, 95, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(244, 132, 95, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(244, 132, 95, 0)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
