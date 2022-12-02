// @ts-ignore
import webpush from 'web-push';
import type { WebNotification, WebPushSubscription } from '@eligo/protocol';
import type { Database } from './db.js';
import { webPushSuscriptions } from '@eligo/state';
import { Server } from 'socket.io';

export type Notifications = {
	notify: (userId: string, notification: WebNotification) => void;
	send: (subscription: WebPushSubscription, notification: WebNotification) => void;
};

export const noop: Notifications = {
	notify: (_userId: string, _notification: WebNotification) => {},
	send: (_subscription: WebPushSubscription, _notification: WebNotification) => {}
};

export default (
	vapidDetails: {
		subject: string;
		privateKey: string;
		publicKey: string;
	},
	database: Database,
	io: Server
) => {
	const send = async (subscription: WebPushSubscription, notification: WebNotification) =>
		webpush
			.sendNotification(subscription, JSON.stringify(notification), {
				vapidDetails
			})
			.then(() => console.info(`${notification} sent to ${subscription.userId}`))
			.catch((error) => {
				if (error.statusCode === 410) {
					const deleted = webPushSuscriptions.deleted({
						id: subscription.id,
						deleteTime: new Date().getTime()
					});

					database.append(subscription.userId, deleted);
					io.to(deleted.payload.id).emit(deleted.type, deleted.payload);
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
