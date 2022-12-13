import Api from '$lib/server/api';
import { items } from '@eligo/state';
import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	delete: async ({ params, cookies, url, locals }) => {
		const api = Api(locals);
		const { database } = locals;

		const user = await api.users.fromCookies(cookies);
		if (!user) throw error(404);

		const item = await database.find('items', { id: params.itemId });
		if (!item) throw error(404);

		if (!api.items.hasAccess(user, item)) throw error(404);

		const patch = { id: item.id, deleteTime: new Date().getTime() };
		await database.append(user.id, items.delete(patch));

		const redirectTo = url.searchParams.get('redirect');
		if (redirectTo) throw redirect(303, redirectTo);

		return { ...item, ...patch };
	}
};
