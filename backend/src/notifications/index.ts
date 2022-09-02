// @ts-ignore
import webpush from 'web-push';
import { PushSubscriptions } from '../db/index.js';
import { WebNotification } from '@eligo/protocol';

export type Notifications = {
	notify: (userId: string, notification: WebNotification) => void;
};

export default (
	vapidDetails: {
		subject: string;
		privateKey: string;
		publicKey: string;
	},
	pushSubscriptions: PushSubscriptions
) => ({
	notify: async (userId: string, notification: WebNotification) =>
		pushSubscriptions.filter({ userId }).then((subscriptions) =>
			subscriptions.forEach((subscription) => {
				webpush
					.sendNotification(subscription, JSON.stringify(notification), {
						vapidDetails
					})
					.catch(console.error);
			})
		)
});
