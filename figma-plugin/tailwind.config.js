/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/**/*.{jsx,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        gold: {
          50: 'rgba(var(--colors-gold-50))',
          100: 'rgba(var(--colors-gold-100))',
          200: 'rgba(var(--colors-gold-200))',
          300: 'rgba(var(--colors-gold-300))',
          400: 'rgba(var(--colors-gold-400))',
          500: 'rgba(var(--colors-gold-500))',
          600: 'rgba(var(--colors-gold-600))',
          700: 'rgba(var(--colors-gold-700))',
          800: 'rgba(var(--colors-gold-800))',
          900: 'rgba(var(--colors-gold-900))',
        },
        foreground: {
          mute: 'rgba(var(--colors-foreground-mute))',
          DEFAULT: 'rgba(var(--colors-foreground))',
        },
        background: {
          DEFAULT: 'rgba(var(--colors-background),1)',
          muted: 'rgba(var(--colors-background-muted))',
        },
        primary: {
          DEFAULT: 'rgba(var(--colors-primary))',
          foreground: 'rgba(var(--colors-primary-foreground))',
        },
        border: {
          muted: 'rgba(var(--colors-border-muted))',
          DEFAULT: 'rgba(var(--colors-border))',
          subtlest: 'rgba(var(--colors-border-subtlest))',
        },
        shadow: {
          DEFAULT: 'rgba(var(--colors-shadow))',
        },
        secondary: {
          DEFAULT: 'rgba(var(--colors-secondary))',
        },
        tag: {
          primary: {
            foreground: 'rgba(var(--colors-tag-primary-foreground))',
            border: 'rgba(var(--colors-tag-primary-border))',
          },
          red: {
            foreground: 'rgba(var(--colors-tag-red-foreground))',
            border: 'rgba(var(--colors-tag-red-border))',
          },
          emerald: {
            foreground: 'rgba(var(--colors-tag-emerald-foreground))',
            border: 'rgba(var(--colors-tag-emerald-border))',
          },
          purple: {
            foreground: 'rgba(var(--colors-tag-purple-foreground))',
            border: 'rgba(var(--colors-tag-purple-border))',
          },
          fuchsia: {
            foreground: 'rgba(var(--colors-tag-fuchsia-foreground))',
            border: 'rgba(var(--colors-tag-fuchsia-border))',
          },
        },
        'biloba-flower': {
          50: 'rgba(var(--colors-biloba-flower-50))',
          100: 'rgba(var(--colors-biloba-flower-100))',
          200: 'rgba(var(--colors-biloba-flower-200))',
          300: 'rgba(var(--colors-biloba-flower-300))',
          400: 'rgba(var(--colors-biloba-flower-400))',
          500: 'rgba(var(--colors-biloba-flower-500))',
          600: 'rgba(var(--colors-biloba-flower-600))',
          700: 'rgba(var(--colors-biloba-flower-700))',
          800: 'rgba(var(--colors-biloba-flower-800))',
          900: 'rgba(var(--colors-biloba-flower-900))',
          950: 'rgba(var(--colors-biloba-flower-950))',
        },
        input: {
          DEFAULT: 'rgba(var(--colors-input))',
        },
        ring: {
          DEFAULT: 'rgba(var(--colors-ring))',
        },
        accent: {
          DEFAULT: 'rgba(var(--colors-accent))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
