import { addSyncMap, addSyncMapFilter, BaseServer, ChangedAt, SyncMapData } from '@logux/server';
import { defineSyncMapActions, LoguxNotFoundError } from '@logux/actions';
import type { List } from '@velit/protocol';

import { lists } from '../db/index.js';

const modelName = 'lists';

const [createAction, changeAction, deleteAction, _createdAction, _changedAction, _deletedAction] =
	defineSyncMapActions<List>(modelName);

export default (server: BaseServer): void => {
	addSyncMap<List>(server, modelName, {
		access: async (ctx, id, action) => {
			if (createAction.match(action)) {
				// can't impersonate another user
				return ctx.userId === action.fields.userId;
			} else if (changeAction.match(action)) {
				const list = await lists.find({ id });
				// can change own lists
				return ctx.userId === list?.userId;
			} else if (deleteAction.match(action)) {
				const list = await lists.find({ id });
				// can delete own lists
				return ctx.userId === list?.userId;
			} else {
				return true;
			}
		},

		load: async (_, id) => {
			const list = await lists.find({ id });
			if (!list) throw new LoguxNotFoundError();
			return {
				id,
				title: ChangedAt(list.title, list.titleChangeTime)
			} as SyncMapData<List>;
		},

		create: (_ctx, id, fields, time) => {
			lists.create({
				...fields,
				id,
				titleChangeTime: time
			});
		},

		change: async (_, id, fields) => {
			const list = await lists.find({ id });
			if (!list) throw new LoguxNotFoundError();
			await lists.update(id, fields);
		},

		delete: (_, id) => lists.delete(id)
	});

	addSyncMapFilter<List>(server, modelName, {
		access: () => true,
		initial: async (_, filter) =>
			lists.filter(filter).then((lists) =>
				lists.map(
					({ id, title, titleChangeTime }) =>
						({
							id,
							title: ChangedAt(title, titleChangeTime)
						} as SyncMapData<List>)
				)
			)
	});
};
