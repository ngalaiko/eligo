import { SUBPROTOCOL } from '@picker/protocol';
import { Server } from '@logux/server';

import registerItems from './modules/items.js';
import registerLists from './modules/lists.js';

const server = new Server(
	Server.loadOptions(process, {
		subprotocol: SUBPROTOCOL,
		supports: SUBPROTOCOL,
		fileUrl: import.meta.url
	})
);

server.auth(() => true);
registerItems(server);
registerLists(server);
server.listen();
