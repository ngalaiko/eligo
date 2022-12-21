import { lists } from '@eligo/protocol';
import { error, invalid } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { nanoid } from 'nanoid';
import Api from '$lib/server/api';

export const load: PageServerLoad = async ({ parent, locals }) => {
	const { user } = await parent();
	const api = Api(locals);
	return {
		lists: api.lists.list(user.id),
		users: api.users.list(user.id),
		memberships: api.memberships.list(user.id)
	};
};

export const actions: Actions = {
	create: async ({ request, cookies, locals }) => {
		const { database } = locals;

		const user = await Api(locals).users.fromCookies(cookies);
		if (!user) throw error(401);

		const data = await request.formData();

		const title = data.get('title') as string;
		if (!title) return invalid(400, { error: 'title is empty' });

		const list = {
			id: nanoid(),
			title,
			createTime: new Date().getTime(),
			userId: user.id
		};

		await database.append(user.id, lists.create(list));

		return { list };
	}
};
