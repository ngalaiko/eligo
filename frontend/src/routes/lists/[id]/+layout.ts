import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => ({ listId: params.id });