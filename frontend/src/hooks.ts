import type { GetSession, Handle } from '@sveltejs/kit';
import { parse } from 'cookie';
import { httpHost as apiHost } from '$lib/api';

export const handle: Handle = async ({ event, resolve }) => {
	const { token } = parse(event.request.headers.get('cookie') ?? '');
	if (!token) return await resolve(event);

	const res = await fetch(new URL('/auth', apiHost), {
		headers: { authorization: `Bearer ${token}` }
	});
	if (res.status !== 200) return await resolve(event);

	const { id, name } = await res.json();
	event.locals.token = token;
	event.locals.user = { id, name };

	return await resolve(event);
};

export const getSession: GetSession = async (event) => {
	return { user: event.locals.user, token: event.locals.token };
};
