import type { CorsOptions } from 'cors';

export default {
	methods: ['POST', 'PATCH', 'DELETE'],
	credentials: true,
	allowedHeaders: ['Content-Type'],
	maxAge: 86400,
	origin:
		process.env.NODE_ENV === 'production'
			? [
					'https://eligo-six.vercel.app',
					/https:\/\/eligo(-.+)?-ngalaiko.vercel.app/,
					'https://eligo.galaiko.rocks',
					'https://eligo.rocks'
			  ]
			: [
					'http://127.0.0.1:5173',
					'http://127.0.0.1:4173',
					'http://localhost:5173',
					'http://localhost:4173'
			  ]
} as CorsOptions;
