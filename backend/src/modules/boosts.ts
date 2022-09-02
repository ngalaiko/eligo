import {
	addSyncMap,
	addSyncMapFilter,
	BaseServer,
	NoConflictResolution,
	Context,
	SyncMapData
} from '@logux/server';
import { defineSyncMapActions, LoguxNotFoundError } from '@logux/actions';
import type { Boost } from '@eligo/protocol';
import type { Items, Memberships, Lists, BoostResord, Boosts, Users } from '../db/index.js';
import { Notifications } from '../notifications/index.js';

const modelName = 'boosts';

const [createAction, changeAction, deleteAction, _createdAction, _changedAction, _deletedAction] =
	defineSyncMapActions<Boost>(modelName);

const toSyncMapValue = (boost: BoostResord): SyncMapData<Boost> => ({
	id: boost.id,
	itemId: NoConflictResolution(boost.itemId),
	listId: NoConflictResolution(boost.listId),
	userId: NoConflictResolution(boost.userId),
	createTime: NoConflictResolution(boost.createTime)
});

export default (
	server: BaseServer,
	boosts: Boosts,
	items: Items,
	memberships: Memberships,
	lists: Lists,
	users: Users,
	notifications: Notifications
): void => {
	const canAccess = async (ctx: Context, boost: BoostResord): Promise<boolean> => {
		// owner can access
		if (ctx.userId === boost.userId) return true;

		const item = await items.find({ id: boost.itemId });
		if (!item) throw new LoguxNotFoundError();

		// list owner can access
		const list = await lists.find({ id: item.listId });
		if (!list) throw new LoguxNotFoundError();
		if (ctx.userId === list.userId) return true;

		// list members can access
		const members = await memberships.filter({ listId: item.listId });
		const memberIds = members.map(({ userId }) => userId);
		return memberIds.includes(ctx.userId);
	};

	addSyncMap<Boost>(server, modelName, {
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
				const boost = await boosts.find({ id: id });
				if (!boost) throw new LoguxNotFoundError();
				return canAccess(ctx, boost);
			}
		},
		load: async (_, id) => {
			const pick = await boosts.find({ id });
			if (!pick) throw new LoguxNotFoundError();
			return toSyncMapValue(pick);
		},

		create: async (_ctx, id, fields, _time, _action) => {
			const boost = await boosts.create({ ...fields, id });

			Promise.all([
				users.find({ id: boost.userId }),
				lists.find({ id: boost.listId }),
				items.find({ id: boost.itemId }),
				memberships.filter({ listId: boost.listId })
			]).then(([user, list, item, memberships]) => {
				if (!list) return;
				if (!user) return;
				if (!item) return;

				const membersIds = memberships.map(({ userId }) => userId);
				const userIds = [...membersIds, list.userId].filter((userId) => userId !== boost.userId);
				userIds.forEach((userId) =>
					notifications.notify(userId, {
						title: `New boost`,
						options: {
							body: `${user.name} boosted ${item.text} in ${list.title}`
						}
					})
				);
			});
		}
	});

	addSyncMapFilter<Boost>(server, modelName, {
		access: () => true,
		initial: (ctx, filter, since) =>
			boosts
				.filter(filter)
				.then((boosts) => boosts.filter((boost) => boost.createTime >= (since ?? 0)))
				.then(async (boosts) => {
					const hasAccess = await Promise.all(boosts.map((pick) => canAccess(ctx, pick)));
					return boosts.filter((_, i) => hasAccess[i]);
				})
				.then((picks) => picks.map(toSyncMapValue)),
		actions: (ctx) => (_, action) =>
			boosts.find({ id: action.id }).then((boost) => {
				if (!boost) return false;
				return canAccess(ctx, boost);
			})
	});
};
