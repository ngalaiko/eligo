import {
	addSyncMap,
	addSyncMapFilter,
	BaseServer,
	ChangedAt,
	Context,
	SyncMapData
} from '@logux/server';
import { defineSyncMapActions, LoguxNotFoundError } from '@logux/actions';
import type { User } from '@eligo/protocol';

import {
	ListRecord,
	Lists,
	MembershipRecord,
	Memberships,
	UserRecord,
	Users
} from '../db/index.js';

const modelName = 'users';

const [createAction, changeAction, deleteAction, _createdAction, _changedAction, _deletedAction] =
	defineSyncMapActions<User>(modelName);

const toSyncMapValue = (user: UserRecord): SyncMapData<User> => ({
	id: user.id,
	name: ChangedAt(user.name, user.nameChangeTime)
});

export default (server: BaseServer, users: Users, memberships: Memberships, lists: Lists): void => {
	const canAccess = async (ctx: Context, user: UserRecord): Promise<boolean> => {
		// own can access
		if (ctx.userId === user.id) return true;

		// members of the same lists can access
		// TODO: refactor, there are too many queries
		const memberIn = await memberships.filter({ userId: ctx.userId });
		const memberOfListIds = memberIn.map(({ listId }) => listId);
		const memberOfLists = (await Promise.all(
			memberOfListIds.map((listId) => lists.find({ id: listId })).filter((list) => !!list)
		)) as ListRecord[];
		const comembers = (await Promise.all(
			memberOfListIds.map((listId) => memberships.find({ listId })).filter((m) => !!m)
		)) as MembershipRecord[];
		const allowedIds = comembers
			.map(({ userId }) => userId)
			.concat(memberOfLists.map(({ userId }) => userId));
		return allowedIds.includes(user.id);
	};

	addSyncMap<User>(server, modelName, {
		access: async (ctx, id, action) => {
			if (createAction.match(action)) {
				// can't impersonate another user
				return ctx.userId === id;
			} else if (changeAction.match(action)) {
				// can only change self
				return ctx.userId === id;
			} else if (deleteAction.match(action)) {
				// can only delete self
				return ctx.userId === id;
			} else {
				const user = await users.find({ id });
				if (!user) throw new LoguxNotFoundError();

				return canAccess(ctx, user);
			}
		},
		change: async (_ctx, id, fields, time) => {
			const user = await users.find({ id });
			if (!user) throw new LoguxNotFoundError();
			await users.update(id, {
				...fields,
				nameChangeTime: fields.name ? time : user.nameChangeTime
			});
		},
		load: async (_, id) => {
			const user = await users.find({ id });
			if (!user) throw new LoguxNotFoundError();
			return toSyncMapValue(user);
		}
	});

	addSyncMapFilter<User>(server, modelName, {
		access: () => true,
		initial: (ctx, filter) =>
			users
				.filter(filter)
				.then(async (users) => {
					const hasAccess = await Promise.all(users.map((user) => canAccess(ctx, user)));
					return users.filter((_, i) => hasAccess[i]);
				})
				.then((users) => users.map(toSyncMapValue)),
		actions: (ctx) => async (_, action) =>
			users.find({ id: action.id }).then((user) => {
				if (!user) return false;
				return canAccess(ctx, user);
			})
	});
};
