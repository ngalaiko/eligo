import { nanoid } from 'nanoid';
import polka from 'polka';
import type { Database } from '../db.js';
import { errNotFound } from '../validation.js';
import { HTTPError } from './error.js';
import type { Request } from './request.js';
import type { Server } from 'socket.io';
import { boosts, items, lists, memberships, picks, users } from '@eligo/state';
import type { Notifications } from '../notifications.js';
import type { User } from '@eligo/protocol';

export default (database: Database, io: Server, notifications: Notifications) => ({
	handler: polka().post('/:id', async (req: Request, res) => {
		try {
			const userId = req.userId;
			if (!userId) throw new HTTPError(404, errNotFound('Not found'));

			const list = await database.find('lists', { invitatationId: req.params.id });
			if (!list || list.deleteTime !== undefined)
				throw new HTTPError(404, errNotFound('Not found'));
			const existing = await database.find('memberships', {
				listId: list.id,
				userId
			});
			if (existing) {
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(existing));
				return;
			}
			const membership = {
				id: nanoid(),
				listId: list.id,
				userId,
				createTime: new Date().getTime()
			};
			await database.append(userId, memberships.create(membership));

			const created = memberships.created(membership);
			io.in(list.id).emit(created.type, created.payload);

			const listBoosts = await database.filter('boosts', { listId: membership.listId });
			const listPicks = await database.filter('picks', { listId: membership.listId });
			const listItems = await database.filter('items', { listId: membership.listId });
			const listMembers = await database.filter('memberships', { listId: membership.listId });

			const userIds = new Set<string>();
			userIds.add(list.userId);
			listBoosts.forEach(({ userId }) => userIds.add(userId));
			listPicks.forEach(({ userId }) => userIds.add(userId));
			listItems
				.filter(({ deleteTime }) => deleteTime === undefined)
				.forEach(({ userId }) => userIds.add(userId));
			listMembers.forEach(({ userId }) => userIds.add(userId));

			const listUsers = await Promise.all(
				Array.from(userIds.values()).map((userId) => database.find('users', { id: userId }))
			).then((uu) => uu.filter((u) => !!u) as User[]);

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
				updateTime: v.deleteTime ?? v.updateTime ?? v.createTime
			});

			[
				lists.updated(withUpdateTime(list)),
				...listBoosts.map((b) => boosts.updated(withUpdateTime(b))),
				...listPicks.map((p) => picks.updated(withUpdateTime(p))),
				...listItems.map((i) => items.updated(withUpdateTime(i))),
				...listUsers.map((u) => users.updated(withUpdateTime(u))),
				...listMembers.map((m) => memberships.updated(withUpdateTime(m)))
			].forEach((action) => {
				io.in(userId).socketsJoin(action.payload.id);
				io.to(userId).emit(action.type, action.payload);
			});

			Promise.all([
				database.find('users', { id: membership.userId }),
				database.find('lists', { id: membership.listId }),
				database.filter('memberships', { listId: membership.listId })
			]).then(([user, list, memberships]) => {
				if (!list) return;
				if (!user) return;

				const newUser = users.created(user);
				io.to(list.id).emit(newUser.type, newUser.payload);

				const membersIds = memberships.map(({ userId }) => userId);
				const userIds = [...membersIds, list.userId].filter(
					(userId) => userId !== membership.userId
				);
				userIds.forEach((userId) =>
					notifications.notify(userId, {
						title: `New member`,
						options: {
							body: `${user.name} joined ${list.title}`,
							timestamp: new Date().getTime()
						}
					})
				);
			});

			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify(membership));
		} catch (err) {
			if (err instanceof HTTPError) {
				res.statusCode = err.status;
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(err.apiError));
			} else {
				console.error(err);
				res.statusCode = 500;
				res.end('Internal server error');
			}
		}
	})
});
