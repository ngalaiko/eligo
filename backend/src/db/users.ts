import type { User } from '@velit/protocol';

export type UserRecord = User & {
	hash: string;
};

let users: UserRecord[] = [];

export default {
	find: ({ id, name }: { id?: string; name?: string }): Promise<UserRecord | undefined> =>
		Promise.resolve(
			users.find((user) => {
				if (id) return user.id === id;
				if (name) return user.name === name;
				return false;
			})
		),
	create: (user: UserRecord): Promise<UserRecord> => {
		users.push(user);
		return Promise.resolve(user);
	},
	change: (id: string, patch: Partial<Omit<UserRecord, 'id'>>): Promise<UserRecord> => {
		users = users.map((user) => {
			if (user.id !== id) return user;
			return { ...user, ...patch };
		});
		return Promise.resolve(users.find((user) => user.id === id)!);
	}
};
