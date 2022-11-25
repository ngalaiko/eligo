import polka from 'polka';
import { errEmpty, errInvalid, errNotFound, errRequired } from '../validation.js';
import { hash } from 'bcrypt';
import { users } from '@eligo/state';
import { nanoid } from 'nanoid';
import { serialize } from 'cookie';
import { addDays } from 'date-fns';
import { HTTPError } from './error.js';
import type { Database } from '../db.js';
import type { Tokens } from '../tokens.js';
import { authCookieName } from './auth.js';
import { Request } from './request.js';

export default (database: Database, tokens: Tokens) => ({
	handler: polka()
		.post('/', async (req, res) => {
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
				await database.append(user.id, users.create(user));

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
		.patch('/:id', async (req: Request, res) => {
			try {
				if (!req.userId || req.userId !== req.params.id)
					throw new HTTPError(404, errNotFound('Not found'));

				const { password } = req.body;

				if (password === 'undefined')
					throw new HTTPError(400, errRequired(`'pasword' is required`));
				if (typeof password !== 'string')
					throw new HTTPError(400, errInvalid(`'password' must be a string`));
				if (password.length === 0)
					throw new HTTPError(400, errEmpty(`'password' can not be empty`));

				const user = await database.find('users', { id: req.params.id });
				if (!user) throw new HTTPError(404, errNotFound('Not found'));

				await database.append(
					user.id,
					users.update({
						id: user.id,
						hash: await hash(password, 10),
						updateTime: new Date().getTime()
					})
				);

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
});
