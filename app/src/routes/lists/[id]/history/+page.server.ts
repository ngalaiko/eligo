import Api from '$lib/server/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent, locals }) => {
    const { user, items } = await parent();
    const { database } = locals;
    return {
        items,
        boosts: database.filter('boosts', { listId: params.id }),
        picks: database.filter('picks', { listId: params.id }),
        memberships: database.filter('memberships', { listId: params.id }),
        users: Api(locals).users.list(user.id)
    };
};
