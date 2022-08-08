import {
	addSyncMap,
	addSyncMapFilter,
	BaseServer,
	NoConflictResolution,
	SyncMapData
} from '@logux/server';
import { LoguxNotFoundError } from '@logux/actions';

import { rolls, items } from '../db/index.js';
import type { Roll } from '@picker/protocol';

const modelName = 'rolls';

const random = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export default (server: BaseServer): void => {
	addSyncMap<Roll>(server, modelName, {
		access: () => true,

		load: async (_, id) => {
			const roll = await rolls.find({ id });
			if (!roll) throw new LoguxNotFoundError();
			return {
				id,
				listId: NoConflictResolution(roll.listId),
				itemId: NoConflictResolution(roll.itemId)
			} as SyncMapData<Roll>;
		},

		create: (_, id, fields) => {
			items
				.list({ listId: fields.listId })
				.then((items) => random(items).id)
				.then((randomItemId) =>
					rolls.create({
						...fields,
						itemId: randomItemId,
						id
					})
				);
		}
	});

	addSyncMapFilter<Roll>(server, modelName, {
		access: () => true,
		initial: async (_, filter) =>
			rolls.list().then((rolls) =>
				rolls
					.filter(({ listId }) => {
						if (filter?.listId) return listId === filter.listId;
						return true;
					})
					.map(
						({ id, listId, itemId }) =>
							({
								id,
								listId: NoConflictResolution(listId),
								itemId: NoConflictResolution(itemId)
							} as SyncMapData<Roll>)
					)
			),
		actions: (filterCtx) => (actionCtx) => actionCtx.userId === filterCtx.userId
	});
};
