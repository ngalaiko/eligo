import { lists } from '@eligo/state';
import type { Server, Socket } from 'socket.io';
import type { Database } from '../db';

export default (io: Server, socket: Socket, database: Database) => {
	socket.on(
		lists.create.type,
		async (list: ReturnType<typeof lists.create>['payload'], callback) => {
			await database.append(lists.create(list));

			const created = lists.created(list);

			socket.join(list.id);
			io.to(list.id).emit(created.type, created.payload);

			callback(null);
		}
	);

	socket.on(
		lists.update.type,
		async (list: ReturnType<typeof lists.update>['payload'], callback) => {
			await database.append(lists.update(list));

			const updated = lists.updated(list);

			socket.join(list.id);
			io.to(list.id).emit(updated.type, updated.payload);

			callback(null);
		}
	);
};
