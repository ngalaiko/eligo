import type { LayoutServerLoad } from './$types';
import api from '$lib/server/api';
import type { Cookies } from '@sveltejs/kit';

const getTheme = (cookies: Cookies): 'dark' | 'light' | 'auto' => {
	const parsed = cookies.get('theme');
	return parsed === 'dark' || parsed === 'light' || parsed === 'auto' ? parsed : 'auto';
};

export const load: LayoutServerLoad = async ({ cookies, locals }) => {
	const user = await api(locals).users.fromCookies(cookies);
	const theme = getTheme(cookies);
	return user ? { user: { ...user, hash: undefined }, theme } : { theme };
};
