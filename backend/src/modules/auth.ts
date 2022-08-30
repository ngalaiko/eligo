import { BaseServer } from '@logux/server';
import { Keys, UserRecord, Users } from '../db/index.js';
import { SignJWT, generateKeyPair, jwtVerify, exportSPKI, importSPKI } from 'jose';
import { compare, hash } from 'bcrypt';
import { nanoid } from 'nanoid';
import { IncomingMessage } from 'http';
import { User } from '@eligo/protocol';
import { serialize, parse } from 'cookie';
import { addDays } from 'date-fns';

const authCookieName = 'token';

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

	const newToken = ({ sub }: { sub: string }) =>
		new SignJWT({})
			.setSubject(sub)
			.setProtectedHeader({ kid: keyId, alg: keyAlg })
			.setExpirationTime('30d')
			.setIssuedAt()
			.sign(privateKey);

	const signIn = (req: IncomingMessage): Promise<UserRecord> => {
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

	const updateUser = (id: string, req: IncomingMessage): Promise<User & { id: string }> => {
		let data = '';
		req.on('data', (chunk) => {
			data += chunk;
		});
		return new Promise((resolve, reject) => {
			req.on('end', () => {
				parseJSON(data)
					.then(async ({ password }) => {
						const user = await users.find({ id });
						if (!user) throw new HTTPError(404, 'Not found');
						try {
							const token = parse(req.headers.cookie ?? '')[authCookieName];
							await verifyJWT(token);
						} catch {
							throw new HTTPError(404, 'Not found');
						}

						if (password) {
							user.hash = await hash(password, 10);
							await users.update(user.id, user);
						}

						return user;
					})
					.then(resolve)
					.catch(reject);
			});
		});
	};

	const signUp = (req: IncomingMessage): Promise<User & { id: string }> => {
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

	const wellKnownOrigins = [
		'http://127.0.0.1:5173',
		'https://eligo-six.vercel.app',
		'https://eligo.galaiko.rocks'
	];
	const vercelOriginRegexp = new RegExp('https://eligo(-.+)?-ngalaiko.vercel.app');

	const isOriginAllowed = (origin: string): boolean => {
		if (wellKnownOrigins.indexOf(origin) !== -1) return true;
		return vercelOriginRegexp.test(origin);
	};

	const userUrlRegexp = new RegExp('/users/(.+)');

	server.http((req, res) => {
		if (req.headers.origin && isOriginAllowed(req.headers.origin)) {
			res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
			res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
			res.setHeader('Access-Control-Allow-Credentials', 'true');
			res.setHeader('Access-Control-Max-Age', '86400');
		}

		if (userUrlRegexp.test(req.url!)) {
			if (req.method === 'PATCH') {
				const id = req.url?.slice(7) ?? '';
				updateUser(id, req)
					.then(async (user) => {
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({ id: user.id, name: user.name }));
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
			} else if (req.method === 'OPTIONS') {
				res.statusCode = 204;
				res.end();
			} else {
				res.statusCode = 405;
				res.end();
			}
		} else if (req.url === '/users') {
			if (req.method === 'POST') {
				signUp(req)
					.then(async (user) => {
						const token = await newToken({ sub: user.id });
						const cookie = serialize(authCookieName, token, {
							httpOnly: true,
							expires: addDays(new Date(), 28)
						});
						res.setHeader('Set-Cookie', cookie);
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({ id: user.id, name: user.name }));
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
			} else if (req.method === 'OPTIONS') {
				res.statusCode = 204;
				res.end();
			} else {
				res.statusCode = 405;
				res.end();
			}
		} else if (req.url === '/auth') {
			if (req.method === 'POST') {
				signIn(req)
					.then(async (user) => {
						const token = await newToken({ sub: user.id });
						const cookie = serialize(authCookieName, token, {
							httpOnly: true,
							expires: addDays(new Date(), 28)
						});
						res.setHeader('Set-Cookie', cookie);
						res.setHeader('Content-Type', 'application/json');
						res.end(JSON.stringify({ id: user.id, name: user.name }));
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
			} else if (req.method === 'DELETE') {
				const cookie = serialize(authCookieName, '', {
					httpOnly: true,
					expires: addDays(new Date(), -1)
				});
				res.setHeader('Set-Cookie', cookie);
				res.statusCode = 204;
				res.end();
			} else if (req.method === 'OPTIONS') {
				res.statusCode = 204;
				res.end();
			} else {
				res.statusCode = 405;
				res.end();
			}
		} else {
			res.statusCode = 404;
			res.end();
		}
	});

	server.auth(({ userId, cookie }) =>
		verifyJWT(cookie[authCookieName])
			.then(({ payload }) => payload.sub === userId)
			.catch(() => false)
	);
};
