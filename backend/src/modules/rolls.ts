import {
	addSyncMap,
	addSyncMapFilter,
	BaseServer,
	NoConflictResolution,
	SyncMapData
} from '@logux/server';
import { defineChangedSyncMap, LoguxNotFoundError } from '@logux/actions';

import { rolls, items } from '../db/index.js';
import type { Roll, Item } from '@picker/protocol';

const modelName = 'rolls';

const nextRoll = (items: Item[], rolls: Roll[]): string => {
	const itemIds = items.map((item) => item.id);
	let itemIdsHistory = rolls.filter(({ itemId }) => itemId).map(({ itemId }) => itemId!);
	itemIdsHistory = itemIdsHistory.slice(Math.max(itemIdsHistory.length - itemIds.length, 0));
	const weights = itemIds.map((itemId) => {
		const rolledAgo = itemIdsHistory.length - itemIdsHistory.lastIndexOf(itemId);
		const wasRolled = rolledAgo !== -1;
		if (!wasRolled) return itemIds.length;
		return rolledAgo;
	});
	return itemIds[weightedRandom(weights)];
};

const weightedRandom = (weights: number[]) => {
	const sum = weights.reduce((a, b) => a + b, 0);
	const r = Math.random() * sum;
	let acc = 0;
	for (let i = 0; i < weights.length; i++) {
		acc += weights[i];
		if (r < acc) {
			return i;
		}
	}
	return weights.length - 1;
};

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
			const randomItemId = await Promise.all([
				items.list({ listId: fields.listId }),
				rolls.list({ listId: fields.listId })
			]).then(([items, rolls]) => {
				if (items.length === 0) throw new LoguxNotFoundError();
				return nextRoll(items, rolls);
			});
			const patch = { itemId: randomItemId };
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
	});
};
