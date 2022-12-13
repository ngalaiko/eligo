import Api from '$lib/server/api';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, parent, url, locals }) => {
    const { user } = await parent();
    const { database } = locals;

    const list = await database.find('lists', { id: params.id });
    if (!list) throw error(404);

    if (!Api(locals).lists.hasAccess(user, list)) throw error(404);

    const items = await database.filter('items', { listId: list.id });

    return { list, items, key: url.pathname };
};
