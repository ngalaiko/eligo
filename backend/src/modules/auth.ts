import { BaseServer } from '@logux/server';
import { keys, users } from '../db/index.js';
import { SignJWT, generateKeyPair, jwtVerify } from 'jose';
import { compare, hash } from 'bcrypt';
import { nanoid } from 'nanoid';
import { IncomingMessage, ServerResponse } from 'http';
import { User } from '@picker/protocol';

const authCookieName = 'token';

export default async (server: BaseServer): Promise<void> => {
	const { keyId, privateKey, keyAlg } = await generateKeyPair('ES256').then(
		({ privateKey, publicKey }) =>
			keys
				.create({
					id: nanoid(),
					publicKey,
					alg: 'ES256'
				})
				.then(({ id }) => ({ keyId: id, privateKey, keyAlg: 'ES256' }))
	);

	const verifyJWT = (token: string) =>
		jwtVerify(token, async (headers) => {
			if (!headers.kid) throw new Error('Missing kid');
			return keys.find({ id: headers.kid }).then((key) => {
				if (!key) throw new Error('Key not found');
				return key.publicKey;
			});
		});

	class HTTPError extends Error {
		status: number;
		constructor(status: number, message: string) {
			super(message);
			this.status = status;
		}
	}

	const newToken = ({ id }: User) =>
		new SignJWT({})
			.setSubject(id)
			.setProtectedHeader({ kid: keyId, alg: keyAlg })
			.setExpirationTime('2h')
			.setIssuedAt()
			.sign(privateKey);

	const signIn = (req: IncomingMessage): Promise<User> => {
		let data = '';
		req.on('data', (chunk) => {
			data += chunk;
		});
		return new Promise((resolve, reject) => {
			req.on('end', () => {
				parseJSON(data)
					.then(async ({ name, password }) => {
						if (!name) throw new HTTPError(400, 'Missing name');
						if (typeof name !== 'string') throw new HTTPError(400, 'Name must be a string');
						if (!password) throw new HTTPError(400, 'Missing password');
						if (typeof password !== 'string') throw new HTTPError(400, 'Password must be a string');
						return users.find({ name }).then(async (user) => {
							if (!user) throw new HTTPError(404, 'User does not exist');
							const isPasswordCorrect = await compare(password, user.hash);
							if (!isPasswordCorrect) throw new HTTPError(403, 'Wrong password');
							return user;
						});
					})
					.then(resolve)
					.catch(reject);
			});
		});
	};

	const parseJSON = async (raw: string): Promise<any> => {
		try {
			return JSON.parse(raw);
		} catch (e) {
			throw new HTTPError(406, 'can not parse json');
		}
	};

	const signUp = (req: IncomingMessage): Promise<User> => {
		let data = '';
		req.on('data', (chunk) => {
			data += chunk;
		});
		return new Promise((resolve, reject) => {
			req.on('end', () => {
				parseJSON(data)
					.then(async ({ name, password }) => {
						if (!name) throw new HTTPError(400, 'Missing name');
						if (typeof name !== 'string') throw new HTTPError(400, 'Name must be a string');
						if (!password) throw new HTTPError(400, 'Missing password');
						if (typeof password !== 'string') throw new HTTPError(400, 'Password must be a string');
						return users.find({ name }).then(async (user) => {
							if (user) throw new HTTPError(409, 'User already exists');
							return hash(password, 10).then((hash) => users.create({ id: nanoid(), name, hash }));
						});
					})
					.then(resolve)
					.catch(reject);
			});
		});
	};

	const setAuthCookie = (res: ServerResponse, token: string) => {
		const expires = new Date();
		const oneMonth = 30 * 24 * 60 * 60 * 1000;
		expires.setTime(expires.getTime() + oneMonth);
		res.setHeader(
			'Set-Cookie',
			`${authCookieName}=${token}; Path=/; HttpOnly; Expires=${expires.toUTCString()}`
		);
	};

	server.http((req, res) => {
		if (req.url === '/users') {
			if (req.method === 'POST') {
				signUp(req)
					.then(async (user) => {
						const token = await newToken(user);
						setAuthCookie(res, token);
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({ id: user.id, name: user.name, token }));
					})
					.catch((err) => {
						if (err instanceof HTTPError) {
							res.statusCode = err.status;
							res.end(err.message);
						} else {
							console.error(err);
							res.statusCode = 500;
							res.end('Internal server error');
						}
					});
			} else {
				res.statusCode = 405;
				res.end();
			}
		} else if (req.url === '/auth') {
			if (req.method === 'POST') {
				signIn(req)
					.then(async (user) => {
						const token = await newToken(user);
						setAuthCookie(res, token);
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({ id: user.id, name: user.name, token }));
					})
					.catch((err) => {
						if (err instanceof HTTPError) {
							res.statusCode = err.status;
							res.end(err.message);
						} else {
							console.error(err);
							res.statusCode = 500;
							res.end('Internal server error');
						}
					});
			} else {
				res.statusCode = 405;
				res.end();
			}
		} else {
			res.statusCode = 404;
			res.end();
		}
	});

	server.auth(
		({ userId, cookie }) =>
			userId === 'anonymous' ||
			verifyJWT(cookie[authCookieName])
				.then(({ payload }) => payload.sub === userId)
				.catch(() => false)
	);
};
