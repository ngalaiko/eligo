import type { Actions, PageServerLoad } from './$types';
import Api from '$lib/server/api';
import { error, invalid } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import { items } from '@eligo/state';

export const load: PageServerLoad = async ({ params, parent, locals }) => {
	const { user } = await parent();
	const { database } = locals;
	return {
		items: database.filter('items', { listId: params.id }),
		boosts: database.filter('boosts', { listId: params.id }),
		picks: database.filter('picks', { listId: params.id }),
		users: Api(locals).users.list(user.id)
	};
};

export const actions: Actions = {
	create: async ({ cookies, request, params, locals }) => {
		const { database } = locals;
		const user = await Api(locals).users.fromCookies(cookies);
		if (!user) throw error(404);

		const data = await request.formData();

		const text = data.get('text') as string;
		if (!text) return invalid(400, { error: 'text is empty' });

		const item = {
			id: nanoid(),
			text,
			createTime: new Date().getTime(),
			userId: user.id,
			listId: params.id
		};

		await database.append(user.id, items.create(item));

		return { item };
	}
};
