import {
	addSyncMap,
	addSyncMapFilter,
	BaseServer,
	ChangedAt,
	Context,
	NoConflictResolution,
	SyncMapData
} from '@logux/server';
import { defineSyncMapActions, LoguxNotFoundError } from '@logux/actions';
import type { Item } from '@eligo/protocol';

import { ItemRecord, Items, Lists, Memberships, Users } from '../db/index.js';
import { Notifications } from '../notifications/index.js';

const modelName = 'items';

const [createAction, changeAction, deleteAction, _createdAction, _changedAction, _deletedAction] =
	defineSyncMapActions<Item>(modelName);

const toSyncMapValue = (item: ItemRecord): SyncMapData<Item> => ({
	id: item.id,
	listId: NoConflictResolution(item.listId),
	text: ChangedAt(item.text, item.textChangeTime),
	userId: NoConflictResolution(item.userId),
	createTime: NoConflictResolution(item.createTime)
});

const isUpdatedSince = (item: ItemRecord, since: number | undefined) =>
	since === undefined ? true : item.createTime > since || item.textChangeTime > since;

export default (
	server: BaseServer,
	items: Items,
	lists: Lists,
	memberships: Memberships,
	users: Users,
	notifications: Notifications
): void => {
	const canAccess = async (ctx: Context, item: ItemRecord): Promise<boolean> => {
		// owner can access
		if (ctx.userId === item.userId) return true;
		// list owner can access
		const list = await lists.find({ id: item.listId });
		if (!list) throw new LoguxNotFoundError();
		if (list.userId === ctx.userId) return true;
		// members can access
		const member = await memberships.find({ listId: item.listId, userId: ctx.userId });
		return !!member;
	};

	addSyncMap<Item>(server, modelName, {
		access: async (ctx, id, action) => {
			if (createAction.match(action)) {
				// can't impersonate another user
				return ctx.userId === action.fields.userId;
			} else if (changeAction.match(action)) {
				const item = await items.find({ id });
				if (!item) throw new LoguxNotFoundError();
				// can change own items
				if (ctx.userId === item?.userId) return true;
				const list = await lists.find({ id: item.listId });
				// can change items in own lists
				return ctx.userId === list?.userId;
			} else if (deleteAction.match(action)) {
				const item = await items.find({ id });
				if (!item) throw new LoguxNotFoundError();
				// can delete own items
				if (ctx.userId === item?.userId) return true;
				const list = await lists.find({ id: item.listId });
				// can delete items in own lists
				return ctx.userId === list?.userId;
			} else {
				const item = await items.find({ id });
				if (!item) throw new LoguxNotFoundError();
				return canAccess(ctx, item);
			}
		},

		load: async (_, id, since) => {
			const item = await items.find({ id });
			if (!item) throw new LoguxNotFoundError();
			return isUpdatedSince(item, since) ? toSyncMapValue(item) : false;
		},

		create: async (_ctx, id, fields, time) => {
			if (!fields.text || fields.text.length === 0) throw new Error('text must be set');
			if (!fields.listId || fields.listId.length === 0) throw new Error('listId must be set');
			if (!fields.userId || fields.userId.length === 0) throw new Error('userId must be set');
			if (!fields.createTime) throw new Error('createTime must be set');

			const item = await items.create({
				...fields,
				id,
				textChangeTime: time
			});

			Promise.all([
				users.find({ id: item.userId }),
				lists.find({ id: item.listId }),
				memberships.filter({ listId: fields.listId })
			]).then(([user, list, memberships]) => {
				if (!list) return;
				if (!user) return;
				if (!item) return;

				const membersIds = memberships.map(({ userId }) => userId);
				const userIds = [...membersIds, list.userId].filter((userId) => userId !== item.userId);
				userIds.forEach((userId) =>
					notifications.notify(userId, {
						title: `New item`,
						options: {
							body: `${user.name} added ${item.text} to ${list.title}`
						}
					})
				);
			});
		},

		change: async (_, id, fields, time) => {
			const item = await items.find({ id });
			if (!item) throw new LoguxNotFoundError();
			await items.update(id, {
				...fields,
				textChangeTime: fields.text ? time : undefined
			});
		},

		delete: async (_, id) => {
			await items.delete(id);
		}
	});

	addSyncMapFilter<Item>(server, modelName, {
		access: () => true,
		initial: async (ctx, filter, since) =>
			await items
				.filter(filter)
				.then((items) => items.filter((item) => isUpdatedSince(item, since)))
				.then(async (items) => {
					const hasAccess = await Promise.all(items.map((list) => canAccess(ctx, list)));
					return items.filter((_, i) => hasAccess[i]);
				})
				.then((lists) => lists.map(toSyncMapValue)),
		actions: (ctx) => async (_, action) =>
			await items.find({ id: action.id }).then((item) => {
				if (!item) return false;
				return canAccess(ctx, item);
			})
	});
};
