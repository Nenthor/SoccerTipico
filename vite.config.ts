import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		port: 8080 // will re-route to 443
	},
	plugins: [sveltekit()],

});
