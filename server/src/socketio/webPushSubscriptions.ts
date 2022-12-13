import { webPushSuscriptions } from '@eligo/state';
import type { Server, Socket } from 'socket.io';
import type { Database } from '../database.js';
import type { Notifications } from '../notifications.js';

export default (io: Server, socket: Socket, database: Database, notifications: Notifications) => {
	socket.on(
		webPushSuscriptions.create.type,
		async (req: ReturnType<typeof webPushSuscriptions.create>['payload'], callback) => {
			await database.append(socket.data.userId, webPushSuscriptions.create(req));
			const created = webPushSuscriptions.create(req);

			socket.join(created.payload.id);
			io.to(created.payload.id).emit(created.type, created.payload);

			notifications.send(req, {
				title: 'Notifications enabled',
				options: {
					body: 'You will receive notifications now',
					timestamp: new Date().getTime()
				}
			});

			callback(null);
		}
	);

	socket.on(
		webPushSuscriptions.delete.type,
		async (req: ReturnType<typeof webPushSuscriptions.delete>['payload'], callback) => {
			await database.append(socket.data.userId, webPushSuscriptions.delete(req));
			const deleted = webPushSuscriptions.delete(req);

			socket.join(deleted.payload.id);
			io.to(deleted.payload.id).emit(deleted.type, deleted.payload);

			callback(null);
		}
	);
};
