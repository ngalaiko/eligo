import Api from '$lib/server/api';
import { lists } from '@eligo/protocol';
import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export let actions: Actions = {
	update: async ({ request, params, cookies, url, locals }) => {
		const { database } = locals;
		const api = Api(locals);

		const user = await api.users.fromCookies(cookies);
		if (!user) throw error(404);

		const list = await database.find('lists', { id: params.id });
		if (!list) throw error(404);

		if (!(await api.lists.hasAccess(user, list))) throw error(404);

		const data = await request.formData();

		const patch = {
			id: list.id,
			updateTime: new Date().getTime(),
			invitatationId: data.has('invitation-id') ? (data.get('invitation-id') as string) : null
		};

		await database.append(user.id, lists.update(patch));

		const redirectTo = url.searchParams.get('redirect');
		if (redirectTo) throw redirect(303, redirectTo);
		return { ...list, ...patch };
	},

	delete: async ({ params, cookies, url, locals }) => {
		const { database } = locals;
		const api = Api(locals);
		const user = await api.users.fromCookies(cookies);
		if (!user) throw error(404);

		const list = await database.find('lists', { id: params.id });
		if (!list) throw error(404);

		if (!(await api.lists.hasAccess(user, list))) throw error(404);

		const patch = {
			id: list.id,
			deleteTime: new Date().getTime()
		};

		await database.append(user.id, lists.delete(patch));

		const redirectTo = url.searchParams.get('redirect');
		if (redirectTo) throw redirect(303, redirectTo);
		return { ...list, ...patch };
	}
};
