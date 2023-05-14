/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />

import type { WebNotification } from '@eligo/protocol';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

// display push notifications
self.addEventListener('push', (event: PushEvent) => {
	if (!event.data) return;
	const { title, options } = event.data.json() as WebNotification;
	event.waitUntil(
		self.registration.showNotification(title, {
			...options,
			icon: '/android-chrome-192x192.png',
			badge: '/favicon-32x32.png'
		})
	);
});

self.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});

self.addEventListener('pushsubscriptionchange', () =>
	self.registration.pushManager
		.subscribe({
			userVisibleOnly: true,
			applicationServerKey:
				'BOf5qTvP_zovZipWAEL9lKsiGJC7nMs6qeTIvWoef05EQdSpGksLXCwVJ147qbAM4DO9tOrs8dAQEkQJCxXV0kc'
		})
		.then((subscription) => {
			if (!subscription) return;
			fetch('/web-push', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(subscription.toJSON())
			});
		})
);

const manifest = self.__WB_MANIFEST;

console.log(manifest);
cleanupOutdatedCaches();
precacheAndRoute(manifest);
