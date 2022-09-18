import type { CorsOptions } from 'cors';

export default {
	methods: ['POST', 'PATCH', 'DELETE'],
	credentials: true,
	allowedHeaders: ['Content-Type'],
	maxAge: 86400,
	origin: [
		'http://127.0.0.1:5173',
		'http://127.0.0.1:4173',
		'https://eligo-six.vercel.app',
		/https:\/\/eligo(-.+)?-ngalaiko.vercel.app/,
		'https://eligo.galaiko.rocks',
		'https://eligo.rocks'
	]
} as CorsOptions;
