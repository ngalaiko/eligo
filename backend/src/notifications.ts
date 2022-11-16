// @ts-ignore
import webpush from 'web-push';
import type { WebNotification } from '@eligo/protocol';
import type { Database } from './db.js';
import { webPushSuscriptions } from '@eligo/state';

export type Notifications = {
    notify: (userId: string, notification: WebNotification) => void;
};

export default (
    vapidDetails: {
        subject: string;
        privateKey: string;
        publicKey: string;
    },
    database: Database
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
                            database.append(
                                userId,
                                webPushSuscriptions.deleted({
                                    id: subscription.id,
                                    deleteTime: new Date().getTime()
                                })
                            );
                        } else {
                            console.error(error);
                        }
                    });
            })
        )
});
