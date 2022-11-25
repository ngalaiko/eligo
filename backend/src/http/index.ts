import type { Database } from '../db.js';
import type { Tokens } from '../tokens.js';
import type { Polka } from 'polka';
import parse from 'body-parser';
import { Server } from 'socket.io';
import { Notifications } from '../notifications.js';
import { handler as healthHandler } from './health.js';
import Auth from './auth.js';
import Join from './join.js';
import Users from './users.js';

export default (
	app: Polka,
	database: Database,
	tokens: Tokens,
	io: Server,
	notifications: Notifications
) => {
	const auth = Auth(database, tokens);
	const join = Join(database, io, notifications);
	const users = Users(database, tokens);
	app
		.use(parse.json())
		.use('health', healthHandler)
		.use(auth.middleware)
		.use('auth', auth.handler)
		.use('join', join.handler)
		.use('users', users.handler);
};
