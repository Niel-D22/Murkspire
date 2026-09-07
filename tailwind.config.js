/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./index.html',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '1.5rem',
			screens: { '2xl': '1280px' },
		},
		extend: {
			colors: {
				/* ---- Murkspire brand ---- */
				murk: {
					DEFAULT: '#0C0D0F', // background
					900: '#0C0D0F',
					800: '#141518',
					700: '#1C1E22',
					600: '#2A2D33',
				},
				spire: {
					DEFAULT: '#FF5A36', // accent / mark
					600: '#E8482A',
					400: '#FF7A5C',
					300: '#FF9B84',
				},
				bone: '#F5F5F2',       // text / wordmark
				slatex: '#4A5158',     // secondary text

				/* ---- zinc remapped to Murkspire neutrals ----
				   keeps every existing bg-zinc-*/
				zinc: {
					50: '#FAFAF8',
					100: '#F5F5F2',
					200: '#C9CDD2',
					300: '#9BA1A8',
					400: '#6B727A',
					500: '#4A5158',
					600: '#3A3E45',
					700: '#2A2D33',
					800: '#1C1E22',
					900: '#141518',
					950: '#08090A',
				},

				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: { DEFAULT: '#FF5A36', foreground: '#0C0D0F' },
				secondary: { DEFAULT: '#4A5158', foreground: '#F5F5F2' },
				accent: { DEFAULT: '#FF5A36', foreground: '#0C0D0F' },
				destructive: { DEFAULT: '#FF5A36', foreground: '#0C0D0F' },
				muted: { DEFAULT: '#1C1E22', foreground: '#4A5158' },
				popover: { DEFAULT: '#141518', foreground: '#F5F5F2' },
				card: { DEFAULT: '#141518', foreground: '#F5F5F2' },
			},
			fontFamily: {
				sans: ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
				mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				glass: '24px',
			},
			boxShadow: {
				spire: '0 0 60px -15px rgba(255,90,54,0.45)',
				'spire-sm': '0 0 24px -8px rgba(255,90,54,0.5)',
				glass: '0 8px 32px -8px rgba(0,0,0,0.6)',
			},
			keyframes: {
				'accordion-down': { from: { height: 0 }, to: { height: 'var(--radix-accordion-content-height)' } },
				'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: 0 } },
				marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
				'beam-pulse': {
					'0%, 100%': { opacity: 0.75, transform: 'scaleY(1)' },
					'50%': { opacity: 1, transform: 'scaleY(1.06)' },
				},
				'bar-in': {
					from: { opacity: 0, transform: 'scaleX(0.55)' },
					to: { opacity: 1, transform: 'scaleX(1)' },
				},
				'page-in': {
					from: { opacity: 0, transform: 'translateY(10px)' },
					to:   { opacity: 1, transform: 'translateY(0)' },
				},
				'row-in': {
					'0%':   { opacity: 0, transform: 'translateY(-8px)', backgroundColor: 'rgba(255,90,54,.22)' },
					'55%':  { opacity: 1, transform: 'translateY(0)',    backgroundColor: 'rgba(255,90,54,.14)' },
					'100%': { opacity: 1, transform: 'translateY(0)',    backgroundColor: 'rgba(255,90,54,0)' },
				},
				'float-y': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-8px)' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				marquee: 'marquee 38s linear infinite',
				'beam-pulse': 'beam-pulse 3.5s ease-in-out infinite',
				'bar-in': 'bar-in 0.7s cubic-bezier(0.22,1,0.36,1) both',
				'float-y': 'float-y 7s ease-in-out infinite',
				'row-in': 'row-in 1.8s cubic-bezier(.22,1,.36,1) both',
				'page-in': 'page-in .42s cubic-bezier(.22,1,.36,1) both',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
}
