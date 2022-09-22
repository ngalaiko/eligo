import { List } from '@eligo/protocol';
import { lists } from '@eligo/state';
import type { Server, Socket } from 'socket.io';
import type { Database } from '../db';
import { errNotFound, validate } from '../validation.js';

export default (io: Server, socket: Socket, database: Database) => {
	socket.on(
		lists.delete.type,
		async (req: Partial<{ id: string; deleteTime: EpochTimeStamp }>, callback) => {
			const validationErr = validate(req, {
				id: 'required',
				deleteTime: 'required'
			});
			if (validationErr) {
				callback(validationErr);
				return;
			}

			const list = await database.find('lists', { id: req.id });
			if (!list) {
				callback(errNotFound('list does not exist'));
				return;
			}

			if (list.userId !== socket.data.userId) {
				const membership = await database.find('memberships', {
					listId: list.id,
					userId: socket.data.userId
				});
				if (membership === undefined) {
					callback(errNotFound('list does not exist'));
					console.log(1);
				}
			}

			if (list.deleteTime !== undefined) {
				callback(null);
				return;
			}

			await database.append(
				socket.data.userId,
				lists.delete({ id: req.id!, deleteTime: req.deleteTime! })
			);

			const deleted = lists.deleted({ id: req.id!, deleteTime: req.deleteTime! });
			io.to(list.id).emit(deleted.type, deleted.payload);

			callback(null);
		}
	);

	socket.on(lists.create.type, async (req: Partial<List>, callback) => {
		const validationErr = validate(req, {
			id: 'required',
			title: 'required',
			userId: socket.data.userId,
			createTime: 'required'
		});
		if (validationErr) {
			callback(validationErr);
			return;
		}
		const list = req as List;

		await database.append(socket.data.userId, lists.create(list));

		const created = lists.created(list);

		socket.join(list.id);
		io.to(list.id).emit(created.type, created.payload);

		callback(null);
	});

	socket.on(lists.update.type, async (req: Partial<List>, callback) => {
		const validationErr = validate(req, {
			id: 'required',
			userId: socket.data.userId,
			updateTime: 'required'
		});
		if (validationErr) {
			callback(validationErr);
			return;
		}

		const patch = { ...req, id: req.id!, updateTime: req.updateTime! };

		const existing = await database.find('lists', { id: req.id });
		if (!existing) {
			callback(errNotFound(`list not found`));
			return;
		}

		if (existing === { ...existing, ...patch }) {
			callback(null);
			return;
		}

		await database.append(socket.data.userId, lists.update(patch));

		const updated = lists.updated(patch);

		socket.join(patch.id);
		io.to(patch.id).emit(updated.type, updated.payload);

		callback(null);
	});
};
