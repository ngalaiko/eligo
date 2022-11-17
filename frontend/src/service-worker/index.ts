import type { WebNotification } from '@eligo/protocol';
import { build, files, version } from '$service-worker';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { clientsClaim } from 'workbox-core';

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
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

precacheAndRoute(
    [
        ...build.map((f) => {
            return {
                url: f,
                revision: null
            };
        }),
        ...files.map((f) => {
            return {
                url: f,
                revision: `${version}`
            };
        })
    ],
    {
        ignoreURLParametersMatching: [/.*/]
    }
);

registerRoute(/\//, new StaleWhileRevalidate());
registerRoute(/\/lists\//, new StaleWhileRevalidate());
registerRoute(/\/lists\/.+\/pick\//, new StaleWhileRevalidate());
registerRoute(/\/lists\/.+\/items\//, new StaleWhileRevalidate());
registerRoute(/\/lists\/.+\/history\//, new StaleWhileRevalidate());
registerRoute(/\/settings\//, new StaleWhileRevalidate());

self.skipWaiting();
clientsClaim();
