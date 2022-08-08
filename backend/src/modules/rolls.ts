import {
	addSyncMap,
	addSyncMapFilter,
	BaseServer,
	NoConflictResolution,
	SyncMapData
} from '@logux/server';
import { defineChangedSyncMap, LoguxNotFoundError } from '@logux/actions';

import { rolls, items } from '../db/index.js';
import type { Roll } from '@picker/protocol';

const modelName = 'rolls';

const random = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)];

const changedAction = defineChangedSyncMap<Roll>(modelName);

export default (server: BaseServer): void => {
	addSyncMap<Roll>(server, modelName, {
		access: () => true,

		load: async (_, id) => {
			// todo: await roll creation
			const roll = await rolls.find({ id });
			if (!roll) throw new LoguxNotFoundError();
			return {
				id,
				listId: NoConflictResolution(roll.listId),
				itemId: NoConflictResolution(roll.itemId)
			} as SyncMapData<Roll>;
		},

		create: async (_ctx, id, fields, _time, _action) => {
			// create roll in the db
			const roll = await rolls.create({ ...fields, id });

			// actually roll
			const listItems = await items.list({ listId: fields.listId });
			if (listItems.length === 0) throw new LoguxNotFoundError();
			const randomItem = random(listItems);
			const patch = { itemId: randomItem.id };
			await rolls.change(roll.id, patch);

			// send back rolled item
			await server.process(changedAction({ id: roll.id, fields: patch }));
		}
	});

	addSyncMapFilter<Roll>(server, modelName, {
		access: () => true,
		initial: (_, filter) =>
			rolls.list(filter).then((rolls) =>
				rolls.map(
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
