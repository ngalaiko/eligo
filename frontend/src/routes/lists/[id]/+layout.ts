import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ params, url }) => ({
    listId: params.id,
    key: url.pathname
});
