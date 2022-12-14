import Api from '$lib/server/api';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, parent, url, locals }) => {
	const { user } = await parent();
	const { database } = locals;

	const list = await database.find('lists', { id: params.id, deleteTime: undefined });
	if (!list) throw error(404);

	if (!(await Api(locals).lists.hasAccess(user, list))) throw error(404);

	return {
		list,
		key: url.pathname,
		items: await database.filter('items', { listId: list.id, deleteTime: undefined }),
		memberships: await database.filter('memberships', { listId: list.id, deleteTime: undefined })
	};
};
