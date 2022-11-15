import type { WebNotification } from '@eligo/protocol';

const worker = self as unknown as ServiceWorkerGlobalScope;

// display push notifications
self.addEventListener('push', (event: PushEvent) => {
    const { title, options } = event.data.json() as WebNotification;
    worker.registration.showNotification(title, {
        ...options,
        icon: '/android-chrome-192x192.png',
        badge: '/favicon-32x32.png'
    });
});
