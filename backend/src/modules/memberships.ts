import {
	addSyncMap,
	addSyncMapFilter,
	BaseServer,
	NoConflictResolution,
	SyncMapData
} from '@logux/server';
import { defineSyncMapActions, LoguxNotFoundError } from '@logux/actions';
import type { Membership } from '@eligo/protocol';

import { MembershipRecord, Memberships, Lists } from '../db/index.js';

const modelName = 'memberships';

const [createAction, _changeAction, deleteAction, _createdAction, _changedAction, _deletedAction] =
	defineSyncMapActions<Membership>(modelName);

const toSyncMapValue = (item: MembershipRecord): SyncMapData<Membership> => ({
	id: item.id,
	listId: NoConflictResolution(item.listId),
	userId: NoConflictResolution(item.userId)
});

export default (server: BaseServer, membersips: Memberships, lists: Lists): void => {
	addSyncMap<Membership>(server, modelName, {
		access: async (ctx, id, action) => {
			if (createAction.match(action)) {
				// can't impersonate another user
				return ctx.userId === action.fields.userId;
			} else if (deleteAction.match(action)) {
				const membersip = await membersips.find({ id });
				if (!membersip) throw new LoguxNotFoundError();
				// can delete own membersips
				if (ctx.userId === membersip?.userId) return true;
				const list = await lists.find({ id: membersip.listId });
				// can delete membersips in own lists
				return ctx.userId === list?.userId;
			} else {
				return true;
			}
		},

		load: async (_, id) => {
			const item = await membersips.find({ id });
			if (!item) throw new LoguxNotFoundError();
			return toSyncMapValue(item);
		},

		create: async (_ctx, id, fields) => {
			membersips.create({
				...fields,
				id
			});
		},

		delete: (_, id) => membersips.delete(id)
	});

	addSyncMapFilter<Membership>(server, modelName, {
		access: () => true,
		initial: (_ctx, filter) => membersips.filter(filter).then((lists) => lists.map(toSyncMapValue))
	});
};
