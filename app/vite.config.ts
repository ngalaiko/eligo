//@ts-ignore
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { sveltekit } from '@sveltejs/kit/vite';
import mkcert from 'vite-plugin-mkcert';
import { setupSocketIO, openDatabase } from '@eligo/server';
import type { UserConfig } from 'vite';

const dev = process.env.NODE_ENV === 'development';

const config: UserConfig = {
	server: { https: true },
	ssr: {
		optimizeDeps: {
			disabled: 'build',
			include: ['@eligo/server']
		}
	},
	define: {
		'process.env.NODE_ENV': process.env.NODE_ENV === 'production' ? '"production"' : '"development"'
	},
	plugins: [
		sveltekit(),
		{
			name: 'inject-socket-io',
			configureServer(server) {
				const database = openDatabase(dev ? 'database.dev.jsonl' : '/data/database.jsonl');
				setupSocketIO(server.httpServer!, database);
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
				id: '/',
				short_name: 'eligo',
				description: 'The Paradox of Choice, solved.',
				name: 'eligo',
				start_url: '/',
				scope: '/',
				display: 'standalone',
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
			workbox: {
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
