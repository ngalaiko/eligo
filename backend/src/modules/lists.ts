import {
	addSyncMap,
	addSyncMapFilter,
	BaseServer,
	ChangedAt,
	NoConflictResolution,
	SyncMapData
} from '@logux/server';
import { defineSyncMapActions, LoguxNotFoundError } from '@logux/actions';
import type { List } from '@eligo/protocol';

import { ListRecord, Lists } from '../db/index.js';

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

export default (server: BaseServer, lists: Lists): void => {
	addSyncMap<List>(server, modelName, {
		access: async (ctx, id, action) => {
			if (createAction.match(action)) {
				// can't impersonate another user
				return ctx.userId === action.fields.userId;
			} else if (changeAction.match(action)) {
				const list = await lists.find({ id });
				// can change own lists
				return ctx.userId === list?.userId;
			} else if (deleteAction.match(action)) {
				const list = await lists.find({ id });
				// can delete own lists
				return ctx.userId === list?.userId;
			} else {
				return true;
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
				invitationIdChangeTime: fields.invitatationId ? time : undefined
			});
		},

		delete: (_, id) => lists.delete(id)
	});

	addSyncMapFilter<List>(server, modelName, {
		access: () => true,
		initial: async (_, filter) => lists.filter(filter).then((lists) => lists.map(toSyncMapValue))
	});
};
