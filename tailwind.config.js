/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    screens: {
      tablet: '960px',
      desktop: '1400px'
    },
    fontSize: {
      xs: ['14px', { lineHeight: '24px', letterSpacing: '-0.03em' }],
      sm: ['16px', { lineHeight: '28px', letterSpacing: '-0.03em' }],
      lg: ['18px', { lineHeight: '28px', letterSpacing: '-0.03em' }],
      xl: ['24px', { lineHeight: '36px', letterSpacing: '-0.03em' }],
      '2xl': ['36px', { lineHeight: '48px', letterSpacing: '-0.032em' }],
      '3xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.032em' }],
      '4xl': ['56px', { lineHeight: '64px', letterSpacing: '-0.032em' }],
      '5xl': ['80px', { lineHeight: '80px', letterSpacing: '-0.032em' }],
    },
    boxShadow: {
      sm: '0px 2px 4px 0px rgba(11, 10, 55, 0.15',
      lg: '0px 8px 20px 0px rgba(18, 16, 99, 0.06',
    },
    fontFamily: {
      pretendard: 'Pretendard Variable, sans-serif',
      origa: 'origa, sans-serif',
      arcade: 'ARCADECLASSIC, -apple-system, BlinkMacSystemFont, system-ui',
    },
    extend: {
      backgroundImage: {
        'phaser-frame': "url('/app/assets/images/frame.svg')",
      }
    },
  },
  plugins: [require("daisyui")],
}
