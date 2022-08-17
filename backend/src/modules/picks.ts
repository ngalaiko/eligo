import {
	addSyncMap,
	addSyncMapFilter,
	BaseServer,
	NoConflictResolution,
	Context,
	SyncMapData
} from '@logux/server';
import { defineSyncMapActions, LoguxNotFoundError } from '@logux/actions';
import type { Pick } from '@eligo/protocol';

import { Picks, Items, ItemRecord, PickRecord, Memberships, Lists } from '../db/index.js';

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

const toSyncMapValue = (pick: PickRecord): SyncMapData<Pick> => ({
	id: pick.id,
	listId: NoConflictResolution(pick.listId),
	itemId: NoConflictResolution(pick.itemId),
	userId: NoConflictResolution(pick.userId),
	createTime: NoConflictResolution(pick.createTime)
});

export default (
	server: BaseServer,
	picks: Picks,
	items: Items,
	memberships: Memberships,
	lists: Lists
): void => {
	const canAccess = async (ctx: Context, pick: PickRecord): Promise<boolean> => {
		// owner can access
		if (ctx.userId === pick.userId) return true;

		// list owner can access
		const list = await lists.find({ id: pick.listId });
		if (ctx.userId === list.userId) return true;

		// list members can access
		const members = await memberships.filter({ listId: pick.listId });
		const memberIds = members.map(({ userId }) => userId);
		return memberIds.includes(ctx.userId);
	};

	addSyncMap<Pick>(server, modelName, {
		access: async (ctx, id, action) => {
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
				const pick = await picks.find({ id: id });
				if (!pick) throw new LoguxNotFoundError();

				return canAccess(ctx, pick);
			}
		},
		load: async (_, id) => {
			const pick = await picks.find({ id });
			if (!pick) throw new LoguxNotFoundError();
			return toSyncMapValue(pick);
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
		initial: (ctx, filter) =>
			picks
				.filter(filter)
				.then(async (picks) => {
					const hasAccess = await Promise.all(picks.map((pick) => canAccess(ctx, pick)));
					return picks.filter((_, i) => hasAccess[i]);
				})
				.then((picks) => picks.map(toSyncMapValue))
	});
};
