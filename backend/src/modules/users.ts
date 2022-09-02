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

import { Lists, Memberships, UserRecord, Users } from '../db/index.js';

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

		// owner of the list I am in
		const myMemberships = await memberships.filter({ userId: ctx.userId });
		const listsIAmIn = await Promise.all(
			myMemberships.map(({ listId }) => lists.find({ id: listId }))
		).then((lists) => lists.filter((l) => !!l).map((l) => l!));
		const isOwnerOfAListIAmIn = listsIAmIn.some(({ userId }) => userId === user.id);
		if (isOwnerOfAListIAmIn) return true;

		// member of the list I own
		const listsIOwn = await lists.filter({ userId: ctx.userId });
		const membersOfListsIOwn = await Promise.all(
			listsIOwn.map(({ id }) => memberships.filter({ listId: id }))
		).then((mm) => mm.flatMap((m) => m));
		const isMemberOfAListIOwn = membersOfListsIOwn.some(({ userId }) => userId === user.id);
		if (isMemberOfAListIOwn) return true;

		// comembers
		const coMembers = await Promise.all(
			listsIAmIn.map(({ id }) => memberships.filter({ listId: id }))
		).then((mm) => mm.flatMap((m) => m));
		const isComember = coMembers.some(({ userId }) => userId === user.id);
		if (isComember) return true;

		return false;
	};

	addSyncMap<User>(server, modelName, {
		access: async (ctx, id, action) => {
			if (createAction.match(action)) {
				// users are created via http endpoints
				return false;
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
		initial: async (ctx, filter, since) =>
			await users
				.filter(filter)
				.then((users) => users.filter((user) => user.nameChangeTime > (since ?? 0)))
				.then(async (users) => {
					const hasAccess = await Promise.all(users.map((user) => canAccess(ctx, user)));
					return users.filter((_, i) => hasAccess[i]);
				})
				.then((users) => users.map(toSyncMapValue)),
		actions: (ctx) => async (_, action) =>
			await users.find({ id: action.id }).then((user) => {
				if (!user) return false;
				return canAccess(ctx, user);
			})
	});
};
