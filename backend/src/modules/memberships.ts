import {
	addSyncMap,
	addSyncMapFilter,
	BaseServer,
	Context,
	NoConflictResolution,
	SyncMapData
} from '@logux/server';
import { defineSyncMapActions, LoguxNotFoundError } from '@logux/actions';
import type { Membership } from '@eligo/protocol';

import { MembershipRecord, Memberships, Lists } from '../db/index.js';

const modelName = 'memberships';

const [createAction, _changeAction, deleteAction, _createdAction, _changedAction, _deletedAction] =
	defineSyncMapActions<Membership>(modelName);

const toSyncMapValue = (membership: MembershipRecord): SyncMapData<Membership> => ({
	id: membership.id,
	listId: NoConflictResolution(membership.listId),
	userId: NoConflictResolution(membership.userId),
	createTime: NoConflictResolution(membership.createTime)
});

export default (server: BaseServer, memberships: Memberships, lists: Lists): void => {
	const canAccess = async (ctx: Context, membership: MembershipRecord): Promise<boolean> => {
		// owner can access
		if (ctx.userId === membership.userId) return true;

		// owner of the list can access
		const list = await lists.find({ id: membership.listId });
		if (ctx.userId === list?.userId) return true;

		// members of the list can access
		const member = await memberships.find({ listId: membership.listId, userId: ctx.userId });
		return !!member;
	};

	addSyncMap<Membership>(server, modelName, {
		access: async (ctx, id, action) => {
			if (createAction.match(action)) {
				// can't impersonate another user
				return ctx.userId === action.fields.userId;
			} else if (deleteAction.match(action)) {
				const membersip = await memberships.find({ id });
				if (!membersip) throw new LoguxNotFoundError();
				// can delete own membersips
				if (ctx.userId === membersip?.userId) return true;
				const list = await lists.find({ id: membersip.listId });
				// can delete membersips in own lists
				return ctx.userId === list?.userId;
			} else {
				const membership = await memberships.find({ id });
				if (!membership) throw new LoguxNotFoundError();

				return canAccess(ctx, membership);
			}
		},

		load: async (_, id) => {
			const item = await memberships.find({ id });
			if (!item) throw new LoguxNotFoundError();
			return toSyncMapValue(item);
		},

		create: async (_ctx, id, fields) => {
			await memberships.create({
				...fields,
				id
			});
		},

		delete: async (_, id) => {
			await memberships.delete(id);
		}
	});

	addSyncMapFilter<Membership>(server, modelName, {
		access: () => true,
		initial: (ctx, filter) =>
			memberships
				.filter(filter)
				.then(async (membersips) => {
					const hasAccess = await Promise.all(membersips.map((list) => canAccess(ctx, list)));
					return membersips.filter((_, i) => hasAccess[i]);
				})
				.then((memberships) => memberships.map(toSyncMapValue)),
		actions: (ctx) => (_, action) =>
			memberships.find({ id: action.id }).then((membership) => {
				if (!membership) return false;
				return canAccess(ctx, membership);
			})
	});
};
