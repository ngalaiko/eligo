import { subprotocol } from '@velit/protocol';
import { Server } from '@logux/server';
import yargs from 'yargs';

import openDB from './db/index.js';
import registerAuthModule from './modules/auth.js';
import registerItemsModule from './modules/items.js';
import registerListsModule from './modules/lists.js';
import registerRollsModule from './modules/rolls.js';
import registerUsersModule from './modules/users.js';

const argv = yargs(process.argv.slice(2))
	.usage('Usage: $0 <command> [options]')
	.option('database', {
		alias: 'd',
		describe: 'Database path',
		default: './database.dev.json'
	})
	.parseSync();

const server = new Server(
	Server.loadOptions(process, {
		subprotocol,
		supports: subprotocol,
		fileUrl: import.meta.url
	})
);

const { keys, users, items, lists, rolls } = openDB(argv.database);

await registerAuthModule(server, keys, users);
registerItemsModule(server, items, lists);
registerListsModule(server, lists);
registerRollsModule(server, rolls, items);
registerUsersModule(server, users);

server.listen();
