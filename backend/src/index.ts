import { subprotocol } from '@eligo/protocol';
import { Server } from '@logux/server';
import yargs from 'yargs';
import { readFileSync } from 'fs';

import openDB from './db/index.js';
import createNotifications from './notifications/index.js';
import registerAuthModule from './modules/auth.js';
import registerItemsModule from './modules/items.js';
import registerListsModule from './modules/lists.js';
import registerPicksModule from './modules/picks.js';
import registerBoostsModule from './modules/boosts.js';
import registerUsersModule from './modules/users.js';
import registerMembershipsModule from './modules/memberships.js';

const argv = yargs(process.argv.slice(2))
	.usage('Usage: $0 <command> [options]')
	.option('database', {
		alias: 'd',
		describe: 'Database path',
		default: './database.dev.json'
	})
	.option('port', {
		alias: 'p',
		describe: 'Port to listen on',
		default: 31337
	})
	.option('host', {
		alias: 'h',
		describe: 'Host to listen on',
		default: '127.0.0.1'
	})
	.option('vapid-public-key', {
		describe: 'Public VAPID key to send WebPush notifications',
		default:
			'BOf5qTvP_zovZipWAEL9lKsiGJC7nMs6qeTIvWoef05EQdSpGksLXCwVJ147qbAM4DO9tOrs8dAQEkQJCxXV0kc'
	})
	.option('vapid-private-key-path', {
		describe: 'Path to a file with VALID private key to send WebPush notifications',
		default: './vapid-private-key.txt'
	})
	.parseSync();

const server = new Server({
	subprotocol,
	port: argv.port,
	host: argv.host,
	supports: subprotocol,
	logger: {
		type: process.env.NODE_ENV === 'production' ? 'json' : 'human'
	}
});

const { keys, users, items, lists, picks, memberships, boosts, pushSubscriptions } = openDB(
	argv.database
);

const notifications = createNotifications(
	{
		subject: 'mailto:nikita@galaiko.rocks',
		privateKey: readFileSync(argv.vapidPrivateKeyPath).toString().trim(),
		publicKey: argv.vapidPublicKey
	},
	pushSubscriptions
);

await registerAuthModule(server, keys, users, pushSubscriptions);

registerItemsModule(server, items, lists, memberships, users, notifications);
registerListsModule(server, lists, memberships);
registerPicksModule(server, picks, items, boosts, memberships, lists, users, notifications);
registerBoostsModule(server, boosts, items, memberships, lists, users, notifications);
registerUsersModule(server, users, memberships, lists);
registerMembershipsModule(server, memberships, lists, users, notifications);

server.listen();
