import { List } from '@eligo/protocol';
import { lists } from '@eligo/state';
import type { Server, Socket } from 'socket.io';
import type { Database } from '../db';
import { errNotFound, errRequired, validate } from '../validation.js';

export default (io: Server, socket: Socket, database: Database) => {
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

		await database.append(lists.create(list));

		const created = lists.created(list);

		socket.join(list.id);
		io.to(list.id).emit(created.type, created.payload);

		callback(null);
	});

	socket.on(lists.update.type, async (req: Partial<List>, callback) => {
		if (!req.id) {
			callback(errRequired(`'id' can not be empty`));
			return;
		}

		const patch = { ...req, id: req.id };

		const existing = await database.find('lists', { id: req.id });
		if (!existing) {
			callback(errNotFound(`list not found`));
			return;
		}

		if (existing === { ...existing, ...patch }) {
			callback(null);
			return;
		}

		await database.append(lists.update(patch));

		const updated = lists.updated(patch);

		socket.join(req.id);
		io.to(req.id).emit(updated.type, updated.payload);

		callback(null);
	});
};