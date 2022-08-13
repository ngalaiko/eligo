import { subprotocol } from '@velit/protocol';
import { Server } from '@logux/server';

const server = new Server(
	Server.loadOptions(process, {
		subprotocol,
		supports: subprotocol,
		fileUrl: import.meta.url
	})
);

server
	.autoloadModules(['modules/*.js', 'modules/*.ts', '!modules/*.d.ts'])
	.then(() => server.listen());
