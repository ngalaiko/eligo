import type { WebNotification } from '@eligo/protocol';
import { build, files, version } from '$service-worker';
import {
	cleanupOutdatedCaches,
	createHandlerBoundToURL,
	precacheAndRoute
} from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope;

// display push notifications
self.addEventListener('push', (event: PushEvent) => {
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

precacheAndRoute(
	[
		...build.map((f) => ({
			url: f,
			revision: null
		})),
		...files.map((f) => ({
			url: f,
			revision: version
		}))
	],
	{
		ignoreURLParametersMatching: [/.*/]
	}
);
cleanupOutdatedCaches();

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL('/')));

self.skipWaiting();
clientsClaim();
