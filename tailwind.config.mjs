/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'selector',
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: {
				xl: '1024px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				heading: ['Outfit', 'system-ui', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace']
			},
			colors: {
				accent: {
					DEFAULT: 'var(--color-accent)',
					hover: 'var(--color-accent-hover)'
				},
				'accent-secondary': 'var(--color-accent-secondary)'
			},
			animation: {
				'fade-up': 'fadeUp 0.6s ease-out forwards',
				'fade-in': 'fadeIn 0.4s ease-out forwards',
				float: 'float 6s ease-in-out infinite',
				'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
				'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite'
			},
			keyframes: {
				fadeUp: {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				float: {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				pulseGlow: {
					'0%, 100%': { opacity: '0.5' },
					'50%': { opacity: '1' }
				},
				bounceSubtle: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(5px)' }
				}
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: '100%',
						a: {
							color: 'var(--color-accent)',
							'&:hover': {
								color: 'var(--color-accent-hover)'
							}
						}
					}
				}
			}
		}
	},
	plugins: [require('@tailwindcss/typography')]
};
