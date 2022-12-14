import type { LayoutServerLoad } from './$types';
import api from '$lib/server/api';

export const load: LayoutServerLoad = async ({ cookies, locals }) => {
	const user = await api(locals).users.fromCookies(cookies);
	return user ? { user: { ...user, hash: undefined } } : {};
};
