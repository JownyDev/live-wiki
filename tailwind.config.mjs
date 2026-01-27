/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				bg: 'var(--color-bg)',
				surface: 'var(--color-surface)',
				'surface-muted': 'var(--color-surface-muted)',
				text: 'var(--color-text)',
				muted: 'var(--color-muted)',
				border: 'var(--color-border)',
				accent: 'var(--color-accent)',
				'accent-strong': 'var(--color-accent-strong)',
			},
			spacing: {
				'space-1': 'var(--space-1)',
				'space-2': 'var(--space-2)',
				'space-3': 'var(--space-3)',
				'space-4': 'var(--space-4)',
				'space-5': 'var(--space-5)',
				'space-6': 'var(--space-6)',
				'space-7': 'var(--space-7)',
				'space-8': 'var(--space-8)',
			},
			borderRadius: {
				sm: 'var(--radius-sm)',
				md: 'var(--radius-md)',
				pill: 'var(--radius-pill)',
			},
			fontFamily: {
				sans: 'var(--font-sans)',
				serif: 'var(--font-serif)',
				mono: 'var(--font-mono)',
			},
			boxShadow: {
				soft: 'var(--shadow-soft)',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0', transform: 'translateY(4px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
			},
			animation: {
				fadeIn: 'fadeIn 0.3s ease',
			},
		},
	},
	plugins: [],
	darkMode: 'class',
};