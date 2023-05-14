import { flatten, merge, notDeleted, notNull, unique } from '../utils';
import type { Item, Membership, User, List } from '@eligo/protocol';
import type { Cookies } from '@sveltejs/kit';
import type { Database, Tokens } from '@eligo/server';

export default ({ database, tokens }: { database: Database; tokens: Tokens }) => {
	const lists = {
		hasAccess: (user: User, list: List) =>
			list.userId === user.id ||
			database
				.find('memberships', { listId: list.id, userId: user.id, deleteTime: undefined })
				.then((membership) => membership !== undefined),

		list: async (userId: string) => {
			const ownerOf = await database.filter('lists', { userId });
			const memberships = await database
				.filter('memberships', { userId })
				.then((memberships) => memberships.filter(notDeleted));
			const memberOf = await Promise.all(
				memberships.map(({ listId }) => database.find('lists', { id: listId }))
			)
				.then((lists) => lists.filter(notNull) as List[])
				.then((lists) => lists.filter(notDeleted));

			return merge(ownerOf, memberOf).filter(notDeleted);
		}
	};

	const users = {
		fromCookies: async (cookies: Cookies) => {
			const token = cookies.get('token');
			if (!token) return undefined;

			try {
				const { payload } = await tokens.verify(token);
				return await database.find('users', { id: payload.sub });
			} catch {
				return undefined;
			}
		},

		list: async (userId: string) => {
			const userLists = await lists.list(userId);

			const members = await Promise.all(
				userLists.map(({ id }) => database.filter('memberships', { listId: id }))
			)
				.then(flatten)
				.then((memberships) => memberships.filter(notNull) as Membership[])
				.then((memberships) => memberships.filter(notDeleted));

			return Promise.all(
				[...members.map(({ userId }) => userId), ...userLists.map(({ userId }) => userId)]
					.filter(unique)
					.map((id) => database.find('users', { id }))
			)
				.then((users) => users.filter(notNull) as User[])
				.then((users) => users.filter(notDeleted))
				.then((users) => users.map((user) => ({ ...user, hash: undefined })));
		}
	};

	return {
		lists,
		users,
		memberships: {
			list: async (userId: string) => {
				const ownerOf = await database.filter('lists', { userId });
				const memberships = await database.filter('memberships', { userId });
				const members = await Promise.all(
					ownerOf.map(({ id }) => database.filter('memberships', { listId: id }))
				)
					.then(flatten)
					.then((memberships) => memberships.filter(notNull) as Membership[]);
				return merge(memberships, members).filter(notDeleted);
			}
		},
		items: {
			hasAccess: async (user: User, item: Item): Promise<boolean> => {
				const isItemOwner = item.userId === user.id;
				const isListOwner = await database
					.find('lists', { id: item.listId, userId: user.id })
					.then((list) => list !== undefined);
				const isListMember = await database
					.find('memberships', { listId: item.listId, userId: user.id })
					.then((membership) => membership !== undefined);
				return isItemOwner || isListOwner || isListMember;
			}
		}
	};
};
