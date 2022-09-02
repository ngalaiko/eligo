import {
	addSyncMap,
	addSyncMapFilter,
	BaseServer,
	NoConflictResolution,
	Context,
	SyncMapData
} from '@logux/server';
import { defineSyncMapActions, LoguxNotFoundError } from '@logux/actions';
import type { Boost, Pick } from '@eligo/protocol';
import type {
	Picks,
	Items,
	PickRecord,
	Memberships,
	Lists,
	ItemRecord,
	Boosts,
	Users
} from '../db/index.js';
import { getWeights } from '@eligo/protocol';
import { Notifications } from '../notifications/index.js';

const pickNext = (items: (ItemRecord & { id: string })[], picks: Pick[], boosts: Boost[]) => {
	if (items.length === 0) return undefined;
	const itemIds = items.map((item) => item.id);
	const weightByItemId = getWeights(items, picks, boosts);
	const weights = itemIds.map((itemId) => weightByItemId[itemId]);
	return items[weightedRandom(weights)];
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

const modelName = 'picks';

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
	boosts: Boosts,
	memberships: Memberships,
	lists: Lists,
	users: Users,
	notifications: Notifications
): void => {
	const canAccess = async (ctx: Context, pick: PickRecord): Promise<boolean> => {
		// owner can access
		if (ctx.userId === pick.userId) return true;

		// list owner can access
		const list = await lists.find({ id: pick.listId });
		if (!list) throw new LoguxNotFoundError();
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
			if (!fields.listId || fields.listId.length === 0) throw new Error('listId must be set');
			if (!fields.userId || fields.userId.length === 0) throw new Error('userId must be set');
			if (!fields.createTime) throw new Error('createTime must be set');

			const randomItem = await Promise.all([
				items.filter({ listId: fields.listId }),
				picks.filter({ listId: fields.listId }),
				boosts.filter({ listId: fields.listId })
			]).then(([items, picks, boosts]) => pickNext(items, picks, boosts));

			if (!randomItem) throw new LoguxNotFoundError();

			// create pick in the db
			const pick = await picks.create({ ...fields, id, itemId: randomItem.id });

			// send back picked item
			await server.process(changedAction({ id: pick.id, fields: { itemId: randomItem.id } }));

			Promise.all([
				users.find({ id: pick.userId }),
				lists.find({ id: pick.listId }),
				memberships.filter({ listId: fields.listId })
			]).then(([user, list, memberships]) => {
				if (!list) return;
				if (!user) return;

				const membersIds = memberships.map(({ userId }) => userId);
				const userIds = [...membersIds, list.userId].filter((userId) => userId !== pick.userId);
				userIds.forEach((userId) =>
					notifications.notify(userId, {
						title: `New pick`,
						options: {
							body: `${user.name} picked ${randomItem.text} in ${list.title}`
						}
					})
				);
			});
		}
	});

	addSyncMapFilter<Pick>(server, modelName, {
		access: () => true,
		initial: async (ctx, filter, since) =>
			await picks
				.filter(filter)
				.then((picks) => picks.filter((pick) => pick.createTime > (since ?? 0)))
				.then(async (picks) => {
					const hasAccess = await Promise.all(picks.map((pick) => canAccess(ctx, pick)));
					return picks.filter((_, i) => hasAccess[i]);
				})
				.then((picks) => picks.map(toSyncMapValue)),
		actions: (ctx) => async (_, action) =>
			await picks.find({ id: action.id }).then((pick) => {
				if (!pick) return false;
				return canAccess(ctx, pick);
			})
	});
};
