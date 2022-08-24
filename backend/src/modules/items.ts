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

import { ItemRecord, Items, Lists, Memberships } from '../db/index.js';

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

export default (server: BaseServer, items: Items, lists: Lists, memberships: Memberships): void => {
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

		load: async (_, id) => {
			const item = await items.find({ id });
			if (!item) throw new LoguxNotFoundError();
			return toSyncMapValue(item);
		},

		create: async (_ctx, id, fields, time) => {
			items.create({
				...fields,
				id,
				textChangeTime: time
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

		delete: (_, id) => items.delete(id)
	});

	addSyncMapFilter<Item>(server, modelName, {
		access: () => true,
		initial: (ctx, filter) =>
			items
				.filter(filter)
				.then(async (items) => {
					const hasAccess = await Promise.all(items.map((list) => canAccess(ctx, list)));
					return items.filter((_, i) => hasAccess[i]);
				})
				.then((lists) => lists.map(toSyncMapValue)),
		actions: (ctx) => (_, action) =>
			items.find({ id: action.id }).then((item) => {
				if (!item) return false;
				return canAccess(ctx, item);
			})
	});
};
