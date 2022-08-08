import { subprotocol } from '@picker/protocol';
import { Server } from '@logux/server';

const server = new Server(
	Server.loadOptions(process, {
		subprotocol,
		supports: subprotocol,
		fileUrl: import.meta.url
	})
);

server.auth(() => true);
server.autoloadModules([`modules/*.${process.env.NODE_ENV === 'production' ? 'js' : 'ts'}`]);
server.listen();
