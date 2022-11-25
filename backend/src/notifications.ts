// @ts-ignore
import webpush from 'web-push';
import type { WebNotification } from '@eligo/protocol';
import type { Database } from './db.js';
import { webPushSuscriptions } from '@eligo/state';
import { Server } from 'socket.io';

export type Notifications = {
	notify: (userId: string, notification: WebNotification) => void;
};

export default (
	vapidDetails: {
		subject: string;
		privateKey: string;
		publicKey: string;
	},
	database: Database,
	io: Server
) => ({
	notify: async (userId: string, notification: WebNotification) =>
		database.filter('webPushSuscriptions', { userId }).then((subscriptions) =>
			subscriptions.forEach((subscription) => {
				webpush
					.sendNotification(subscription, JSON.stringify(notification), {
						vapidDetails
					})
					.then(() => console.info(`${notification} sent to ${userId}`))
					.catch((error) => {
						if (error.statusCode === 410) {
							const deleted = webPushSuscriptions.deleted({
								id: subscription.id,
								deleteTime: new Date().getTime()
							});

							database.append(userId, deleted);
							io.to(deleted.payload.id).emit(deleted.type, deleted.payload);
						} else {
							console.error(error);
						}
					});
			})
		)
});
