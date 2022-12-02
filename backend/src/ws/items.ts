import { Item } from '@eligo/protocol';
import { items } from '@eligo/state';
import type { Socket, Server } from 'socket.io';
import type { Database } from '../db.js';
import { Notifications } from '../notifications.js';
import { errNotFound, validate } from '../validation.js';

export default (io: Server, socket: Socket, database: Database, notifications: Notifications) => {
	socket.on(
		items.delete.type,
		async (req: Partial<{ id: string; deleteTime: EpochTimeStamp }>, callback) => {
			const validationErr = validate(req, {
				id: 'required',
				deleteTime: 'required'
			});
			if (validationErr) {
				callback(validationErr);
				return;
			}

			const item = await database.find('items', { id: req.id });
			if (!item) {
				callback(errNotFound('item does not exist'));
				return;
			}
			if (item.deleteTime !== undefined) {
				callback(null);
				return;
			}

			const list = await database.find('lists', { id: item.listId });
			if (list && list.userId !== socket.data.userId) {
				const membership = database.find('memberships', {
					listId: item.listId,
					userId: socket.data.userId
				});
				if (!membership) {
					callback(errNotFound('item does not exist'));
					return;
				}
			}

			await database.append(
				socket.data.userId,
				items.delete({ id: req.id!, deleteTime: req.deleteTime! })
			);

			const deleted = items.deleted({ id: req.id!, deleteTime: req.deleteTime! });

			io.to([item.id, item.listId]).emit(deleted.type, deleted.payload);

			callback(null);
		}
	);

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

		await database.append(socket.data.userId, items.create(item));
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
			new Set(userIds).forEach((userId) =>
				notifications.notify(userId, {
					title: `New item`,
					options: {
						body: `${user.name} added ${item.text} to ${list.title}`,
						timestamp: new Date().getTime()
					}
				})
			);
		});

		callback(null);
	});

	socket.on(items.update.type, async (req: Partial<Item>, callback) => {
		const validationErr = validate(req, {
			id: 'required',
			updateTime: 'required'
		});
		if (validationErr) {
			callback(validationErr);
			return;
		}

		const item = await database.find('items', { id: req.id });
		if (!item) {
			callback(errNotFound('item not found'));
			return;
		}

		const patch = { text: req.text, updateTime: req.updateTime! };
		await database.append(req.id, items.update({ id: item.id, ...patch }));

		const updated = items.updated({ id: item.id, ...patch });
		io.to([item.id, item.listId]).emit(updated.type, updated.payload);

		callback(null);
	});
};
