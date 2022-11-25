import polka, { NextHandler, Response } from 'polka';
import { serialize, parse as parseCookie } from 'cookie';
import { addDays } from 'date-fns';
import { Tokens } from '../tokens.js';
import type { Request } from './request.js';
import { HTTPError } from './error.js';
import { errEmpty, errInvalid, errNotFound, errRequired } from '../validation.js';
import type { Database } from '../db.js';
import { compare } from 'bcrypt';

export const authCookieName = 'token';

export default (database: Database, tokens: Tokens) => ({
	middleware: async (req: Request, res: Response, next: NextHandler) => {
		if (req.headers.cookie === undefined) {
			next();
			return;
		}

		const token = parseCookie(req.headers.cookie)[authCookieName];
		if (token === undefined) {
			next();
			return;
		}

		try {
			const { payload } = await tokens.verify(token);
			req.userId = payload.sub;
			next();
		} catch (err) {
			res.statusCode = 401;
			res.end();
		}
	},

	handler: polka()
		.delete('/', async (_req, res) => {
			const cookie = serialize(authCookieName, '', {
				httpOnly: true,
				expires: addDays(new Date(), -1)
			});
			res.setHeader('Set-Cookie', cookie);
			res.statusCode = 204;
			res.end();
		})
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
});
