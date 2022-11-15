import type { WebNotification } from '@eligo/protocol';

self.addEventListener('push', (event: PushEvent) => {
    const { title, options } = event.data.json() as WebNotification;
    // @ts-ignore
    self.registration.showNotification(title, {
        ...options,
        icon: '/android-chrome-192x192.png',
        badge: '/favicon-32x32.png'
    });
});
