import { subprotocol } from '@eligo/protocol';
import { Server } from '@logux/server';
import yargs from 'yargs';

import openDB from './db/index.js';
import registerAuthModule from './modules/auth.js';
import registerItemsModule from './modules/items.js';
import registerListsModule from './modules/lists.js';
import registerPicksModule from './modules/picks.js';
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
	.parseSync();

const server = new Server({
	subprotocol,
	port: argv.port,
	host: argv.host,
	supports: subprotocol
});

const { keys, users, items, lists, picks, memberships } = openDB(argv.database);

await registerAuthModule(server, keys, users);
registerItemsModule(server, items, lists, memberships);
registerListsModule(server, lists, memberships);
registerPicksModule(server, picks, items, memberships, lists);
registerUsersModule(server, users, memberships, lists);
registerMembershipsModule(server, memberships, lists);

server.listen();
