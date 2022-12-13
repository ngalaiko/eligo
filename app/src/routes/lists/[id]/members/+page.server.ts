import type { PageServerLoad } from './$types';
import Api from '$lib/server/api';

export const load: PageServerLoad = async ({ params, parent, locals }) => {
	const { user } = await parent();
	const { database } = locals;
	return {
		memberships: database.filter('memberships', { listId: params.id }),
		users: Api(locals).users.list(user.id),
		list: database.find('lists', { id: params.id })
	};
};
