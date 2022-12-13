import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: ({ cookies }) => {
		cookies.set('token', '', {
			path: '/',
			httpOnly: true,
			expires: new Date()
		});
		throw redirect(303, '/');
	}
};
