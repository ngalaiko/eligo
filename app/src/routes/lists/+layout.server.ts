import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ parent, url }) => {
    const { user } = await parent();
    if (!user) throw redirect(303, `/?redirect=${encodeURIComponent(url.pathname)}`);
    return { user };
};
