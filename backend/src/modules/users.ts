import { addSyncMap, addSyncMapFilter, BaseServer, ChangedAt } from '@logux/server';
import { defineSyncMapActions, LoguxNotFoundError } from '@logux/actions';
import type { User } from '@eligo/protocol';

import { Users } from '../db/index.js';

const modelName = 'users';

const [createAction, changeAction, deleteAction, _createdAction, _changedAction, _deletedAction] =
	defineSyncMapActions<User>(modelName);

export default (server: BaseServer, users: Users): void => {
	addSyncMap<User>(server, modelName, {
		access: async (ctx, id, action) => {
			if (createAction.match(action)) {
				// can't impersonate another user
				return ctx.userId === id;
			} else if (changeAction.match(action)) {
				// can't impersonate another user
				return ctx.userId === id;
			} else if (deleteAction.match(action)) {
				// deletion is not implemented
				return false;
			} else {
				return true;
			}
		},
		change: async (_ctx, id, fields, time) => {
			const user = await users.find({ id });
			if (!user) throw new LoguxNotFoundError();
			await users.update(id, {
				...fields,
				nameChangeTime: fields.name ? time : undefined
			});
		},
		load: async (_, id) => {
			const user = await users.find({ id });
			if (!user) throw new LoguxNotFoundError();
			return {
				id,
				name: ChangedAt(user.name, user.nameChangeTime)
			};
		}
	});

	addSyncMapFilter<User>(server, modelName, {
		access: () => true,
		initial: (_, filter) =>
			users.filter(filter).then((users) =>
				users.map((user) => ({
					id: user.id,
					name: ChangedAt(user.name, user.nameChangeTime)
				}))
			)
	});
};
