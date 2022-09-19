import { Database } from '../db.js';
import { hash, compare } from 'bcrypt';
import { nanoid } from 'nanoid';
import { boosts, items, lists, memberships, picks, users } from '@eligo/state';
import { Tokens } from '../tokens.js';
import { serialize, parse as parseCookie } from 'cookie';
import { addDays } from 'date-fns';
import { Polka } from 'polka';
import parse from 'body-parser';
import { Server } from 'socket.io';
import type { User, Error as APIError } from '@eligo/protocol';
import { Notifications } from '../notifications.js';
import { errEmpty, errInvalid, errNotFound, errRequired } from '../validation.js';

const authCookieName = 'token';

class HTTPError extends Error {
	status: number;
	apiError: APIError;
	constructor(status: number, apiError: APIError) {
		super(`${apiError.code}: ${apiError.message}`);
		this.status = status;
		this.apiError = apiError;
	}
}

export default (
	app: Polka,
	database: Database,
	tokens: Tokens,
	io: Server,
	notifications: Notifications
) => {
	app
		.use(parse.json())
		.delete('/auth', async (_req, res) => {
			const cookie = serialize(authCookieName, '', {
				httpOnly: true,
				expires: addDays(new Date(), -1)
			});
			res.setHeader('Set-Cookie', cookie);
			res.statusCode = 204;
			res.end();
		})
		.get('/health', (_req, res) => {
			res.statusCode = 200;
			res.end();
		})
		.post('/join/:id', async (req, res) => {
			try {
				const token = parseCookie(req.headers.cookie ?? '')[authCookieName];
				const { payload } = await tokens.verify(token);
				const list = await database.find('lists', { invitatationId: req.params.id });
				if (!list) throw new HTTPError(404, errNotFound('Not found'));
				const existing = await database.find('memberships', {
					listId: list.id,
					userId: payload.sub
				});
				if (existing) {
					res.setHeader('Content-Type', 'application/json');
					res.end(JSON.stringify(existing));
					return;
				}
				const membership = {
					id: nanoid(),
					listId: list.id,
					userId: payload.sub!,
					createTime: new Date().getTime()
				};
				await database.append(memberships.create(membership));

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
				listItems.forEach(({ userId }) => userIds.add(userId));
				listMembers.forEach(({ userId }) => userIds.add(userId));

				const listUsers = await Promise.all(
					Array.from(userIds.values()).map((userId) => database.find('users', { id: userId }))
				).then((uu) => uu.filter((u) => !!u) as User[]);

				[
					lists.updated(list),
					...listBoosts.map((b) => boosts.updated(b)),
					...listPicks.map((p) => picks.updated(p)),
					...listItems.map((i) => items.updated(i)),
					...listUsers.map((u) => users.updated(u)),
					...listMembers.map((m) => memberships.updated(m))
				].forEach((action) => {
					io.in(payload.sub!).socketsJoin(action.payload.id);
					io.to(payload.sub!).emit(action.type, action.payload);
				});

				Promise.all([
					database.find('users', { id: membership.userId }),
					database.find('lists', { id: membership.listId }),
					database.filter('memberships', { listId: membership.listId })
				]).then(([user, list, memberships]) => {
					if (!list) return;
					if (!user) return;

					const membersIds = memberships.map(({ userId }) => userId);
					const userIds = [...membersIds, list.userId].filter(
						(userId) => userId !== membership.userId
					);
					userIds.forEach((userId) =>
						notifications.notify(userId, {
							title: `New member`,
							options: {
								body: `${user.name} joined ${list.title}`
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
		.post('/auth', async (req, res) => {
			try {
				const { name, password } = req.body;
				if (name === 'undefined') throw new HTTPError(400, errRequired(`'name' is required`));
				if (typeof name !== 'string')
					throw new HTTPError(400, errInvalid(`'name' must be a string`));
				if (name.length === 0) throw new HTTPError(400, errEmpty(`'name' can not be empty`));
				if (password === 'undefined')
					throw new HTTPError(400, errRequired(`'pasword' is required`));
				if (typeof password !== 'string')
					throw new HTTPError(400, errInvalid(`'password' must be a string`));
				if (password.length === 0)
					throw new HTTPError(400, errEmpty(`'password' can not be empty`));

				const user = await database.find('users', { name });
				if (!user) throw new HTTPError(404, errNotFound('User does not exist'));

				const isPasswordCorrect = await compare(password, user.hash!);
				if (!isPasswordCorrect) throw new HTTPError(403, errInvalid('Wrong password'));

				const token = await tokens.sign({ sub: user.id });
				const cookie = serialize(authCookieName, token, {
					httpOnly: true,
					expires: addDays(new Date(), 28)
				});
				res.setHeader('Set-Cookie', cookie);
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({ id: user.id, name: user.name }));
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
		.post('/users', async (req, res) => {
			try {
				const { name, password } = req.body;
				if (name === 'undefined') throw new HTTPError(400, errRequired(`'name' is required`));
				if (typeof name !== 'string')
					throw new HTTPError(400, errInvalid(`'name' must be a string`));
				if (name.length === 0) throw new HTTPError(400, errEmpty(`'name' can not be empty`));
				if (password === 'undefined')
					throw new HTTPError(400, errRequired(`'pasword' is required`));
				if (typeof password !== 'string')
					throw new HTTPError(400, errInvalid(`'password' must be a string`));
				if (password.length === 0)
					throw new HTTPError(400, errEmpty(`'password' can not be empty`));

				const existing = await database.find('users', { name });
				if (existing) throw new HTTPError(409, errInvalid('User already exists'));

				const passwordHash = await hash(password, 10);

				const user = {
					id: nanoid(),
					name,
					hash: passwordHash,
					createTime: new Date().getTime()
				};
				await database.append(users.create(user));
				const token = await tokens.sign({ sub: user.id });
				const cookie = serialize(authCookieName, token, {
					httpOnly: true,
					expires: addDays(new Date(), 28)
				});
				res.setHeader('Set-Cookie', cookie);
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({ id: user.id, name: user.name }));
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
		.patch('/users/:id', async (req, res) => {
			try {
				const user = await database.find('users', { id: req.params.id });
				if (!user) throw new HTTPError(404, errNotFound('Not found'));
				try {
					const token = parseCookie(req.headers.cookie ?? '')[authCookieName];
					await tokens.verify(token);
				} catch {
					throw new HTTPError(404, errNotFound('Not found'));
				}

				const { password } = req.body;

				if (password === 'undefined')
					throw new HTTPError(400, errRequired(`'pasword' is required`));
				if (typeof password !== 'string')
					throw new HTTPError(400, errInvalid(`'password' must be a string`));
				if (password.length === 0)
					throw new HTTPError(400, errEmpty(`'password' can not be empty`));

				await database.append(users.update({ id: user.id, hash: await hash(password, 10) }));

				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({ id: user.id, name: user.name }));
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
		});
};
