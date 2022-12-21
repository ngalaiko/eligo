import { setupSocketIO, openDatabase } from '@eligo/server';
import { createServer } from 'node:http';
import { handler } from './build/handler.js';
import compression from 'compression';
import morgan from 'morgan';
import polka from 'polka';

const env = (name, fallback) => {
	const prefixed = '' + name;
	return prefixed in process.env ? process.env[prefixed] : fallback;
};

const path = env('SOCKET_PATH', false);
const host = env('HOST', '0.0.0.0');
const port = env('PORT', !path && '3000');

const server = createServer();
polka({ server })
	.use(morgan('common'), compression({ threshold: 0 }), handler)
	.listen({ path, host, port }, () => {
		console.log(`listening on http://${path ? path : host + ':' + port}`);
	});

setupSocketIO(server, openDatabase('/data/database.jsonl'));
