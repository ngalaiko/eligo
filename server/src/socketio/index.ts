import {
	type List,
	type User,
	type WebNotification,
	boosts,
	items,
	lists,
	memberships,
	picks,
	users
} from '@eligo/protocol';
import type { Server as HTTPServer } from 'node:http';
import { Server } from 'socket.io';
import type { Database } from '../database.js';
import { verifier } from '../tokens.js';
import Notifications from '../notifications.js';
import { parse } from 'cookie';

export const notDeleted = <T extends { deleteTime?: number }>({ deleteTime }: T) =>
	deleteTime === undefined;

export const notNull = <T extends any>(obj: T | undefined) => obj !== undefined && obj !== null;

export const unique = <T extends any>(value: T, index: number, all: T[]) =>
	all.indexOf(value) === index;

export const flatten = (arrayOfArrays: any[][]) => arrayOfArrays.flatMap((array) => array);

const withUpdateTime = <
	T extends {
		deleteTime?: EpochTimeStamp;
		updateTime?: EpochTimeStamp;
		createTime: EpochTimeStamp;
	}
>(
	v: T
) => ({
	...v,
	updateTime: Math.max(v.deleteTime ?? 0, Math.max(v.updateTime ?? 0, v.createTime))
});

export default async (server: HTTPServer, database: Database) => {
	const io = new Server(server);
	const tokens = { ...verifier(database) };
	const notifications = Notifications(database);
	io.use(async (socket, next) => {
		if (!socket.handshake.headers.cookie) {
			next(new Error('unauthorized: token missing'));
			return;
		}
		const cookies = parse(socket.handshake.headers.cookie);
		const token = cookies['token'];
		try {
			const { payload } = await tokens.verify(token);
			if (!!socket.handshake.auth.userId && payload.sub !== socket.handshake.auth.userId) {
				next(new Error('unauthorized: invalid token'));
				return;
			}

			const user = await database.find('users', { id: payload.sub });
			if (!user) {
				next(new Error('user not found'));
			} else {
				socket.data.userId = user.id;
				next();
			}
		} catch {
			next(new Error('unauthorized: invalid token'));
		}
	});

	const online = new Map<string, boolean>();

	io.on('connection', async (socket) => {
		socket.onAny((event, ...args) => console.log(JSON.stringify({ event, args })));

		const userId = socket.data.userId;

		// keep track of connected
		online.set(userId, true);

		{
			const userConnected = users.update({
				id: userId,
				online: true,
				updateTime: new Date().getTime()
			});
			io.to([userId]).emit(userConnected.type, userConnected.payload);
		}

		socket.on('disconnect', () => {
			online.delete(userId);

			const userDisconnected = users.update({
				id: userId,
				online: false,
				updateTime: new Date().getTime()
			});
			io.to([userId]).emit(userDisconnected.type, userDisconnected.payload);
		});

		const lastSynched = socket.handshake.auth.lastSynched || 0;

		const mms = await database.filter('memberships', { userId });
		const memberOf = (await Promise.all(
			mms.map(({ listId }) => database.find('lists', { id: listId }))
		).then((ll) => ll.filter(notNull))) as List[];
		const owns = await database.filter('lists', { userId });
		const initLists = [...owns, ...memberOf].filter(unique);

		const initItems = await Promise.all(
			initLists.map(({ id }) => database.filter('items', { listId: id }))
		).then(flatten);

		const initBoosts = await Promise.all(
			initLists.map(({ id }) => database.filter('boosts', { listId: id }))
		).then(flatten);

		const initPicks = await Promise.all(
			initLists.map(({ id }) => database.filter('picks', { listId: id }))
		).then(flatten);

		const memberWith = await Promise.all(
			initLists.map(({ id }) => database.filter('memberships', { listId: id }))
		).then(flatten);

		const userIds = new Set<string>();
		userIds.add(userId);
		memberOf.forEach(({ userId }) => userIds.add(userId));
		initBoosts.forEach(({ userId }) => userIds.add(userId));
		initItems.forEach(({ userId }) => userIds.add(userId));
		memberWith.forEach(({ userId }) => userIds.add(userId));

		const initUsers = await Promise.all(
			Array.from(userIds.values()).map((id) => database.find('users', { id }))
		)
			.then((users) => users.filter(notNull) as User[])
			.then((users) => users.map((user) => ({ ...user, hash: undefined })));

		const initActions = [
			...initLists.map((l) => lists.update(withUpdateTime(l))),
			...initBoosts.map((b) => boosts.update(withUpdateTime(b))),
			...initPicks.map((p) => picks.update(withUpdateTime(p))),
			...initItems.map((i) => items.update(withUpdateTime(i))),
			...initUsers.map((u) => users.update(withUpdateTime(u))),
			...memberWith.map((m) => memberships.update(withUpdateTime(m))),
			...initUsers
				.filter((u) => online.has(u.id))
				.map((u) =>
					users.update({
						id: u.id,
						online: true,
						updateTime: new Date().getTime()
					})
				)
		];

		socket.join(userId);

		// join all the channels
		initActions.forEach((action) => socket.join(action.payload.id));

		// only send new events
		initActions
			.filter((action) => action.payload.updateTime > lastSynched)
			.sort((a, b) => a.payload.updateTime - b.payload.updateTime) // ensure earlier events are sent first
			.forEach((action) => socket.emit(action.type, action.payload));
	});

	const notifyListMembers = async (listId: string, sender: User, notification: WebNotification) => {
		const list = await database.find('lists', { id: listId });
		if (!list) return;
		const memberships = await database.filter('memberships', { listId });
		[list.id, ...memberships.map(({ userId }) => userId)]
			.filter(unique)
			.filter((userId) => userId !== sender.id)
			.forEach((user) => notifications.notify(user, notification));
	};

	database.on(async (action) => {
		if (boosts.create.match(action)) {
			io.to([action.payload.userId]).socketsJoin(action.payload.id);
			io.to([action.payload.id, action.payload.listId]).emit(action.type, action.payload);

			const user = await database.find('users', { id: action.payload.userId });
			if (!user) return;
			const item = await database.find('items', { id: action.payload.itemId });
			if (!item) return;
			const list = await database.find('lists', { id: action.payload.listId });
			if (!list) return;
			notifyListMembers(action.payload.listId, user, {
				title: `New boost`,
				options: {
					body: `${user.displayName ?? user.name} boosted ${item.text} in ${list.title}`,
					timestamp: action.payload.createTime
				}
			});
		} else if (items.create.match(action)) {
			io.to([action.payload.userId]).socketsJoin(action.payload.id);
			io.to([action.payload.id, action.payload.listId]).emit(action.type, action.payload);

			const user = await database.find('users', { id: action.payload.userId });
			if (!user) return;
			const list = await database.find('lists', { id: action.payload.listId });
			if (!list) return;
			notifyListMembers(action.payload.listId, user, {
				title: `New item`,
				options: {
					body: `${user.displayName ?? user.name} added ${action.payload.text} to ${list.title}`,
					timestamp: action.payload.createTime
				}
			});
		} else if (items.delete.match(action)) {
			io.to([action.payload.id]).emit(action.type, action.payload);
		} else if (items.update.match(action)) {
			io.to([action.payload.id]).emit(action.type, action.payload);
		} else if (lists.create.match(action)) {
			io.to([action.payload.userId]).socketsJoin(action.payload.id);
			io.to([action.payload.id]).emit(action.type, action.payload);
		} else if (lists.delete.match(action)) {
			io.to([action.payload.id]).emit(action.type, action.payload);
		} else if (lists.update.match(action)) {
			io.to([action.payload.id]).emit(action.type, action.payload);
		} else if (picks.create.match(action)) {
			io.to([action.payload.userId]).socketsJoin(action.payload.id);
			io.to([action.payload.id, action.payload.listId]).emit(action.type, action.payload);

			const user = await database.find('users', { id: action.payload.userId });
			if (!user) return;
			const list = await database.find('lists', { id: action.payload.listId });
			if (!list) return;
			const item = await database.find('items', { id: action.payload.itemId });
			if (!item) return;
			notifyListMembers(action.payload.listId, user, {
				title: `New pick`,
				options: {
					body: `${user.displayName ?? user.name} picked ${item.text} in ${list.title}`,
					timestamp: action.payload.createTime
				}
			});
		} else if (memberships.create.match(action)) {
			const membership = action.payload;
			const list = await database.find('lists', { id: action.payload.listId });
			if (!list) return;
			const user = await database.find('users', { id: action.payload.userId });
			if (!user) return;
			const listBoosts = await database.filter('boosts', { listId: list.id });
			const listPicks = await database.filter('picks', { listId: list.id });
			const listItems = await database.filter('items', { listId: list.id });
			const listMembers = await database.filter('memberships', {
				listId: list.id
			});
			const listUsers = await Promise.all(
				[list.id, ...listMembers.map(({ userId }) => userId)].map((userId) =>
					database.find('users', { id: userId })
				)
			).then((uu) => uu.filter(notNull) as User[]);

			io.to([
				action.payload.userId,
				list.userId,
				...listMembers.map(({ userId }) => userId)
			]).socketsJoin(action.payload.id);

			[users.update(withUpdateTime(user)), memberships.update(withUpdateTime(membership))].forEach(
				(action) => {
					io.to([list.userId, ...listMembers.map(({ userId }) => userId)]).socketsJoin(
						action.payload.id
					);
					io.to([list.userId, ...listMembers.map(({ userId }) => userId)]).emit(
						action.type,
						action.payload
					);
				}
			);

			[
				lists.update(withUpdateTime(list)),
				...listBoosts.map((b) => boosts.update(withUpdateTime(b))),
				...listPicks.map((p) => picks.update(withUpdateTime(p))),
				...listItems.map((i) => items.update(withUpdateTime(i))),
				...listUsers.map((u) => users.update(withUpdateTime(u))),
				...listMembers.map((m) => memberships.update(withUpdateTime(m)))
			].forEach((action) => {
				io.to([membership.userId]).socketsJoin(action.payload.id);
				io.to([membership.userId]).emit(action.type, action.payload);
			});

			notifyListMembers(action.payload.listId, user, {
				title: `New member`,
				options: {
					body: `${user.displayName ?? user.name} joined ${list.title}`,
					timestamp: action.payload.createTime
				}
			});
		} else if (memberships.delete.match(action)) {
			io.to([action.payload.id]).emit(action.type, action.payload);

			const membership = await database.find('memberships', {
				id: action.payload.id
			});
			if (!membership) return;
			const list = await database.find('lists', { id: membership.listId });
			if (!list) return;
			const listBoosts = await database.filter('boosts', { listId: list.id });
			const listPicks = await database.filter('picks', { listId: list.id });
			const listItems = await database.filter('items', { listId: list.id });
			const listMembers = await database.filter('memberships', {
				listId: list.id
			});
			const listUsers = await Promise.all(
				[list.id, ...listMembers.map(({ userId }) => userId)].map((userId) =>
					database.find('users', { id: userId })
				)
			).then((uu) => uu.filter(notNull) as User[]);

			io.to([list.userId, ...listMembers.map(({ userId }) => userId)]).socketsLeave(
				action.payload.id
			);

			[
				lists.update(withUpdateTime(list)),
				...listBoosts.map((b) => boosts.update(withUpdateTime(b))),
				...listPicks.map((p) => picks.update(withUpdateTime(p))),
				...listItems.map((i) => items.update(withUpdateTime(i))),
				...listUsers.map((u) => users.update(withUpdateTime(u))),
				...listMembers.map((m) => memberships.update(withUpdateTime(m)))
			].forEach((action) => {
				io.to([membership.userId]).socketsLeave(action.payload.id);
			});
		} else if (users.update.match(action)) {
			io.to([action.payload.id]).emit(action.type, action.payload);
		}
	});
};
