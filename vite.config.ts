import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
	server: {
		port: 8080 // will re-route to 443
	},
	plugins: [sveltekit(), viteCompression()]
});
