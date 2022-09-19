import { Item } from '@eligo/protocol';
import { items } from '@eligo/state';
import type { Socket, Server } from 'socket.io';
import type { Database } from '../db.js';
import { Notifications } from '../notifications.js';
import { validate } from '../validation.js';

export default (io: Server, socket: Socket, database: Database, notifications: Notifications) => {
	socket.on(items.create.type, async (req: Partial<Item>, callback) => {
		const validationErr = validate(req, {
			id: 'required',
			text: 'required',
			userId: socket.data.userId,
			listId: 'required',
			createTime: 'required'
		});
		if (validationErr) {
			callback(validationErr);
			return;
		}
		const item = req as Item;

		await database.append(items.create(item));
		const created = items.created(item);

		socket.join(created.payload.id);
		io.to([created.payload.id, created.payload.listId]).emit(created.type, created.payload);

		Promise.all([
			database.find('users', { id: item.userId }),
			database.find('lists', { id: item.listId }),
			database.filter('memberships', { listId: item.listId })
		]).then(([user, list, memberships]) => {
			if (!list) return;
			if (!user) return;
			if (!item) return;

			const membersIds = memberships.map(({ userId }) => userId);
			const userIds = [...membersIds, list.userId].filter((userId) => userId !== item.userId);
			userIds.forEach((userId) =>
				notifications.notify(userId, {
					title: `New item`,
					options: {
						body: `${user.name} added ${item.text} to ${list.title}`
					}
				})
			);
		});

		callback(null);
	});
};