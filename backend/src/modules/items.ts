import {
	addSyncMap,
	addSyncMapFilter,
	BaseServer,
	ChangedAt,
	NoConflictResolution,
	SyncMapData
} from '@logux/server';
import { LoguxNotFoundError } from '@logux/actions';

import { items } from '../db/index.js';
import type { Item } from '@picker/protocol';

const modelName = 'items';

export default (server: BaseServer): void => {
	addSyncMap<Item>(server, modelName, {
		access: () => true,

		load: async (_, id) => {
			const item = await items.find({ id });
			if (!item) throw new LoguxNotFoundError();
			return {
				id,
				listId: NoConflictResolution(item.listId),
				text: ChangedAt(item.text, item.textChangeTime)
			} as SyncMapData<Item>;
		},

		create: (_, id, fields, time) => {
			items.create({
				...fields,
				id,
				textChangeTime: time
			});
		},

		change: async (_, id, fields) => {
			const item = await items.find({ id });
			if (!item) throw new LoguxNotFoundError();
			await items.change(id, fields);
		},

		delete: (_, id) => items.delete(id)
	});

	addSyncMapFilter<Item>(server, modelName, {
		access: () => true,
		initial: () =>
			items.list().then((lists) =>
				lists.map(
					({ id, text, listId, textChangeTime }) =>
						({
							id,
							listId: NoConflictResolution(listId),
							text: ChangedAt(text, textChangeTime)
						} as SyncMapData<Item>)
				)
			),
		actions: (filterCtx) => (actionCtx) => actionCtx.userId === filterCtx.userId
	});
};
