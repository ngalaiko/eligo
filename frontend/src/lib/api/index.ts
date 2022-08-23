const host =
	process.env.NODE_ENV === 'production'
		? 'https://eligo-backend.fly.dev/'
		: 'http://127.0.0.1:31337/';

export const httpHost = host;
export const wsHost = host.replace('http', 'ws');
