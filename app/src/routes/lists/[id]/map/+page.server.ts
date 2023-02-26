import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals: { database }, parent }) => {
    const { items } = await parent();
    return {
        items,
        picks: database.filter('picks', { listId: params.id })
    };
};
