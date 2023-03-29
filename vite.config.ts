import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import fs from 'fs';

export default defineConfig({
	server: {
		port: 8080, // will re-route to 443
		https: {
			key: fs.readFileSync('./src/lib/server/data/private.pem'),
			cert: fs.readFileSync('./src/lib/server/data/certificate.cer')
		},
		watch: {
			ignored: ['**/settingss.json']
		}
	},
	plugins: [sveltekit(), viteCompression()]
});
