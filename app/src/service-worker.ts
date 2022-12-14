import type { WebNotification } from '@eligo/protocol';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

// display push notifications
self.addEventListener('push', (event: PushEvent) => {
	if (!event.data) return;
	const { title, options } = event.data.json() as WebNotification;
	self.registration.showNotification(title, {
		...options,
		icon: '/android-chrome-192x192.png',
		badge: '/favicon-32x32.png'
	});
});

self.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});

precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();
