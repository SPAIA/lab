/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				secondary: '#1f3f4a'
			},
			minHeight: {
				'screen-64': 'calc(100vh-64)'
			}
		}
	},
	plugins: []
};
