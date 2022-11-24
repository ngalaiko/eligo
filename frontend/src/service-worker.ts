import type { WebNotification } from '@eligo/protocol';
import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
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

precacheAndRoute(self.__WB_MANIFEST);

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL('/'), { allowlist: [/^\/$/] }));
registerRoute(
    new NavigationRoute(createHandlerBoundToURL('/settings'), { allowlist: [/^\/settings\/?$/] })
);
registerRoute(
    new NavigationRoute(createHandlerBoundToURL('/lists'), { allowlist: [/^\/lists\/?$/] })
);

self.skipWaiting();
clientsClaim();
