// @ts-ignore
import webpush from 'web-push';
import { readFileSync } from 'fs';
import type { WebNotification, WebPushSubscription } from '@eligo/protocol';
import type { Database } from './database.js';
import { webPushSuscriptions } from '@eligo/state';

export type Notifications = {
	notify: (userId: string, notification: WebNotification) => void;
	send: (subscription: WebPushSubscription, notification: WebNotification) => void;
};

export const noop: Notifications = {
	notify: (_userId: string, _notification: WebNotification) => {},
	send: (_subscription: WebPushSubscription, _notification: WebNotification) => {}
};

const init = (
	vapidDetails: {
		subject: string;
		privateKey: string;
		publicKey: string;
	},
	database: Database
) => {
	const send = async (subscription: WebPushSubscription, notification: WebNotification) =>
		webpush
			.sendNotification(subscription, JSON.stringify(notification), {
				vapidDetails
			})
			.then(() => console.info(`${notification} sent to ${subscription.userId}`))
			.catch((error: any) => {
				if (error.statusCode === 410) {
					const deleted = webPushSuscriptions.delete({
						id: subscription.id,
						deleteTime: new Date().getTime()
					});

					database.append(subscription.userId, deleted);
				} else {
					console.error(error);
				}
			});

	return {
		send,
		notify: async (userId: string, notification: WebNotification) =>
			database
				.filter('webPushSuscriptions', { userId })
				.then((subscriptions) =>
					subscriptions.forEach((subscription) => send(subscription, notification))
				)
	};
};

export default process.env.NODE_ENV === 'production'
	? (database: Database) =>
			init(
				{
					subject: 'mailto:nikita@galaiko.rocks',
					privateKey: readFileSync('/data/vapid-private-key.txt').toString().trim(),
					publicKey:
						'BOf5qTvP_zovZipWAEL9lKsiGJC7nMs6qeTIvWoef05EQdSpGksLXCwVJ147qbAM4DO9tOrs8dAQEkQJCxXV0kc'
				},
				database
			)
	: (_database: Database) => noop;
