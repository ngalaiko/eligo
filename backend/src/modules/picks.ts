import { addSyncMap, addSyncMapFilter, BaseServer, NoConflictResolution } from '@logux/server';
import { defineSyncMapActions, LoguxNotFoundError } from '@logux/actions';
import type { Pick } from '@eligo/protocol';

import { Picks, Items, ItemRecord } from '../db/index.js';

const modelName = 'picks';

const pickNext = (items: ItemRecord[], picks: Pick[]): string => {
	const itemIds = items.map((item) => item.id);
	let itemIdsHistory = picks.filter(({ itemId }) => itemId).map(({ itemId }) => itemId!);
	itemIdsHistory = itemIdsHistory.slice(Math.max(itemIdsHistory.length - itemIds.length, 0));
	const weights = itemIds.map((itemId) => {
		const pickedAgo = itemIdsHistory.length - itemIdsHistory.lastIndexOf(itemId);
		const wasPicked = pickedAgo !== -1;
		if (!wasPicked) return itemIds.length;
		return pickedAgo;
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

const [createAction, changeAction, deleteAction, _createdAction, changedAction, _deletedAction] =
	defineSyncMapActions<Pick>(modelName);

export default (server: BaseServer, picks: Picks, items: Items): void => {
	addSyncMap<Pick>(server, modelName, {
		access: async (ctx, _id, action) => {
			if (createAction.match(action)) {
				// can't impersonate another user
				return ctx.userId === action.fields.userId;
			} else if (changeAction.match(action)) {
				// picks are immutable
				return false;
			} else if (deleteAction.match(action)) {
				// picks are immutable
				return false;
			} else {
				return true;
			}
		},
		load: async (_, id) => {
			const pick = await picks.find({ id });
			if (!pick) throw new LoguxNotFoundError();
			return {
				id,
				listId: NoConflictResolution(pick.listId),
				itemId: NoConflictResolution(pick.itemId),
				userId: NoConflictResolution(pick.userId),
				createTime: NoConflictResolution(pick.createTime)
			};
		},

		create: async (_ctx, id, fields, _time, _action) => {
			// create pick in the db
			const pick = await picks.create({ ...fields, id });

			// actually pick
			const randomItemId = await Promise.all([
				items.filter({ listId: fields.listId }),
				picks.filter({ listId: fields.listId })
			]).then(([items, picks]) => {
				if (items.length === 0) throw new LoguxNotFoundError();
				return pickNext(items, picks);
			});
			const patch = { itemId: randomItemId };
			await picks.update(pick.id, patch);

			// send back picked item
			await server.process(changedAction({ id: pick.id, fields: patch }));
		}
	});

	addSyncMapFilter<Pick>(server, modelName, {
		access: () => true,
		initial: (_, filter) =>
			picks.filter(filter).then((picks) =>
				picks.map(({ id, listId, itemId, userId, createTime }) => ({
					id,
					listId: NoConflictResolution(listId),
					itemId: NoConflictResolution(itemId),
					userId: NoConflictResolution(userId),
					createTime: NoConflictResolution(createTime)
				}))
			)
	});
};
