import type { GetSession, Handle } from '@sveltejs/kit';
import { parse } from 'cookie';

const extractJWTSubject = (token: string) => {
	const [_headers, payload, _signature] = token.split('.');
	try {
		const { sub } = JSON.parse(payload);
		return sub;
	} catch {
		return undefined;
	}
};

export const handle: Handle = async ({ event, resolve }) => {
	const { token } = parse(event.request.headers.get('cookie') ?? '');
	if (token) {
		const sub = extractJWTSubject(token);
		event.locals.token = token;
		event.locals.user = { id: sub, name: '?' };
	}
	return await resolve(event);
};

export const getSession: GetSession = async (event) => {
	return { user: event.locals.user, token: event.locals.token };
};
