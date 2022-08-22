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
import type { List } from '@eligo/protocol';

import { ListRecord, Lists, Memberships } from '../db/index.js';

const modelName = 'lists';

const [createAction, changeAction, deleteAction, _createdAction, _changedAction, _deletedAction] =
	defineSyncMapActions<List>(modelName);

const toSyncMapValue = (list: ListRecord): SyncMapData<List> => ({
	id: list.id,
	title: ChangedAt(list.title, list.titleChangeTime),
	userId: NoConflictResolution(list.userId),
	createTime: NoConflictResolution(list.createTime),
	invitatationId: ChangedAt(list.invitatationId, list.invitationIdChangeTime)
});

export default (server: BaseServer, lists: Lists, memberships: Memberships): void => {
	const canAccess = async (ctx: Context, list: ListRecord): Promise<boolean> => {
		// owner can access
		if (ctx.userId === list.userId) return true;
		// members can access
		const member = await memberships.find({ listId: list.id, userId: ctx.userId });
		return !!member;
	};

	addSyncMap<List>(server, modelName, {
		access: async (ctx, id, action) => {
			if (createAction.match(action)) {
				// can't impersonate another user
				return ctx.userId === action.fields.userId;
			} else if (changeAction.match(action)) {
				const list = await lists.find({ id });
				if (!list) throw new LoguxNotFoundError();
				// can change own lists
				if (ctx.userId === list?.userId) return true;
				// member can change invitationId
				if (Object.keys(action.fields).length === 1 && action.fields.invitatationId !== undefined) {
					const member = await memberships.find({ listId: list.id, userId: ctx.userId });
					return !!member;
				}
				return false;
			} else if (deleteAction.match(action)) {
				const list = await lists.find({ id });
				if (!list) throw new LoguxNotFoundError();
				// can delete own lists
				return ctx.userId === list?.userId;
			} else {
				const list = await lists.find({ id });
				if (!list) throw new LoguxNotFoundError();
				// lists with invitation id are public
				if (!!list.invitatationId) return true;
				return canAccess(ctx, list);
			}
		},

		load: async (_, id) => {
			const list = await lists.find({ id });
			if (!list) throw new LoguxNotFoundError();
			return toSyncMapValue(list);
		},

		create: (_ctx, id, fields, time) => {
			lists.create({
				...fields,
				id,
				titleChangeTime: time,
				invitationIdChangeTime: time
			});
		},

		change: async (_, id, fields, time) => {
			const list = await lists.find({ id });
			if (!list) throw new LoguxNotFoundError();
			await lists.update(id, {
				...fields,
				titleChangeTime: fields.title ? time : undefined,
				invitationIdChangeTime: fields.invitatationId !== undefined ? time : undefined
			});
		},

		delete: (_, id) => lists.delete(id)
	});

	addSyncMapFilter<List>(server, modelName, {
		access: () => true,
		initial: async (ctx, filter) =>
			filter && Object.keys(filter).length === 1 && filter?.invitatationId !== undefined // if only invitation id is set
				? lists.filter(filter).then((lists) => lists.map(toSyncMapValue)) // return all matching lists, they are public
				: lists
						.filter(filter)
						.then(async (lists) => {
							const hasAccess = await Promise.all(lists.map((list) => canAccess(ctx, list)));
							return lists.filter((_, i) => hasAccess[i]);
						})
						.then((lists) => lists.map(toSyncMapValue)),
		actions: (ctx) => async (_, action) =>
			lists.find({ id: action.id }).then((list) => {
				if (!list) return false;
				return canAccess(ctx, list);
			})
	});
};
