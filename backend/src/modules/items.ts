import {
	addSyncMap,
	addSyncMapFilter,
	BaseServer,
	ChangedAt,
	NoConflictResolution
} from '@logux/server';
import { defineSyncMapActions, LoguxNotFoundError } from '@logux/actions';
import type { Item } from '@eligo/protocol';

import { Items, Lists } from '../db/index.js';

const modelName = 'items';

const [createAction, changeAction, deleteAction, _createdAction, _changedAction, _deletedAction] =
	defineSyncMapActions<Item>(modelName);

export default (server: BaseServer, items: Items, lists: Lists): void => {
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
				return true;
			}
		},

		load: async (_, id) => {
			const item = await items.find({ id });
			if (!item) throw new LoguxNotFoundError();
			return {
				id,
				listId: NoConflictResolution(item.listId),
				text: ChangedAt(item.text, item.textChangeTime),
				userId: NoConflictResolution(item.userId),
				createTime: NoConflictResolution(item.createTime)
			};
		},

		create: (_ctx, id, fields, time) => {
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
		initial: (_ctx, filter) =>
			items.filter(filter).then((lists) =>
				lists.map(({ id, text, listId, textChangeTime, userId, createTime }) => ({
					id,
					listId: NoConflictResolution(listId),
					text: ChangedAt(text, textChangeTime),
					userId: NoConflictResolution(userId),
					createTime: NoConflictResolution(createTime)
				}))
			)
	});
};
