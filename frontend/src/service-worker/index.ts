import type { WebNotification } from '@eligo/protocol';

self.addEventListener('push', (event: PushEvent) => {
	const data = event.data.json() as WebNotification;
	// @ts-ignore
	self.registration.showNotification(data.title, data.options);
});
