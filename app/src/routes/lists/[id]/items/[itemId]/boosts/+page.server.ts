import Api from '$lib/server/api';
import { boosts } from '@eligo/state';
import { error, redirect } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import type { Actions } from './$types';

export const actions: Actions = {
	create: async ({ params, cookies, url, locals }) => {
		const api = Api(locals);
		const { database } = locals;

		const user = await api.users.fromCookies(cookies);
		if (!user) throw error(404);

		const item = await database.find('items', { id: params.itemId });
		if (!item) throw error(404);

		if (!api.items.hasAccess(user, item)) throw error(404);

		const boost = {
			id: nanoid(),
			userId: user.id,
			itemId: item.id,
			listId: item.listId,
			createTime: new Date().getTime()
		};

		await database.append(user.id, boosts.create(boost));

		const redirectTo = url.searchParams.get('redirect');
		if (redirectTo) throw redirect(303, redirectTo);

		return boost;
	}
};
