import { BaseServer } from '@logux/server';
import { Keys, Users } from '../db/index.js';
import { SignJWT, generateKeyPair, jwtVerify, exportSPKI, importSPKI } from 'jose';
import { compare, hash } from 'bcrypt';
import { nanoid } from 'nanoid';
import { IncomingMessage } from 'http';
import { User } from '@eligo/protocol';

export default async (server: BaseServer, keys: Keys, users: Users): Promise<void> => {
	const { keyId, privateKey, keyAlg } = await generateKeyPair('ES256').then(
		async ({ privateKey, publicKey }) =>
			keys
				.create({
					id: nanoid(),
					spki: await exportSPKI(publicKey),
					alg: 'ES256'
				})
				.then(({ id }) => ({ keyId: id, privateKey, keyAlg: 'ES256' }))
	);

	const verifyJWT = (token: string) =>
		jwtVerify(token, async (headers) => {
			if (!headers.kid) throw new Error('Missing kid');
			return keys.find({ id: headers.kid }).then((key) => {
				if (!key) throw new Error('Key not found');
				return importSPKI(key.spki, key.alg);
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
			.setExpirationTime('30d')
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
							return hash(password, 10).then((hash) =>
								users.create({ id: nanoid(), name, hash, nameChangeTime: new Date().getTime() })
							);
						});
					})
					.then(resolve)
					.catch(reject);
			});
		});
	};

	server.http((req, res) => {
		if (req.url === '/users') {
			if (req.method === 'POST') {
				signUp(req)
					.then(async (user) => {
						const token = await newToken(user);
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
			} else if (req.method === 'GET') {
				const [type, token] = req.headers.authorization?.split(' ') || [];
				if (type.toLowerCase() !== 'bearer') {
					res.statusCode = 401;
					res.end();
					return;
				}
				verifyJWT(token)
					.then(({ payload }) => users.find({ id: payload.sub }))
					.then((user) => {
						if (!user) {
							res.statusCode = 401;
							res.end();
							return;
						}
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({ id: user.id, name: user.name, token: token }));
					})
					.catch((err) => {
						console.error(err);
						res.statusCode = 500;
						res.end('Internal server error');
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
		({ userId, token }) =>
			userId === 'anonymous' ||
			verifyJWT(token)
				.then(({ payload }) => payload.sub === userId)
				.catch(() => false)
	);
};
