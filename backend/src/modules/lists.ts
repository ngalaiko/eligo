import { addSyncMap, addSyncMapFilter, BaseServer, ChangedAt, SyncMapData } from '@logux/server';
import { LoguxNotFoundError } from '@logux/actions';

import { lists } from '../db/index.js';
import type { List } from '@picker/protocol';

const modelName = 'lists';

export default (server: BaseServer): void => {
	addSyncMap<List>(server, modelName, {
		access: () => true,

		load: async (_, id) => {
			const list = await lists.find({ id });
			if (!list) throw new LoguxNotFoundError();
			return {
				id,
				title: ChangedAt(list.title, list.titleChangeTime)
			} as SyncMapData<List>;
		},

		create: (_, id, fields, time) => {
			lists.create({
				...fields,
				id,
				titleChangeTime: time
			});
		}
	});

	addSyncMapFilter<List>(server, modelName, {
		access: () => true,
		initial: () =>
			lists.list().then((lists) =>
				lists.map(
					({ id, title, titleChangeTime }) =>
						({
							id,
							title: ChangedAt(title, titleChangeTime)
						} as SyncMapData<List>)
				)
			),
		actions: (filterCtx) => (actionCtx) => actionCtx.userId === filterCtx.userId
	});
};
