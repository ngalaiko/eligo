import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import mkcert from 'vite-plugin-mkcert';
import { setupSocketIO, openDatabase } from '@eligo/server';

const dev = process.env.NODE_ENV === 'development';

/** @type {import('vite').UserConfig} */
const config = {
	server: { https: true },
	plugins: [
		sveltekit(),
		{
			name: 'inject-socket-io',
			configureServer(server) {
				const database = openDatabase(dev ? 'database.dev.jsonl' : '/data/database.jsonl');
				setupSocketIO(server.httpServer, database);
				console.log('socket.io injected');
			}
		},
		mkcert(),
		SvelteKitPWA({
			srcDir: './src',
			registerType: 'autoUpdate',
			injectRegister: 'auto',
			strategies: 'injectManifest',
			filename: 'service-worker.ts',
			scope: '/',
			base: '/',
			manifest: {
				short_name: 'eligo',
				name: 'eligo',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				theme_color: '#ffffff',
				background_color: '#ffffff',
				icons: [
					{
						src: '/android-chrome-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/android-chrome-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: '/android-chrome-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable'
					}
				]
			},
			injectManifest: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}']
			},
			devOptions: {
				enabled: true,
				type: 'module',
				navigateFallback: '/'
			},
			kit: {}
		})
	]
};

export default config;
