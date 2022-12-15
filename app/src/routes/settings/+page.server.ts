import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { users } from '@eligo/state';
import { hash } from 'bcrypt';
import Api from '$lib/server/api';
import { redirect } from '@sveltejs/kit';
import { addYears } from 'date-fns';

export const load: PageServerLoad = async ({ parent, url }) => {
    const { user, theme } = await parent();
    if (!user) throw redirect(303, `/?redirect=${encodeURIComponent(url.pathname)}`);
    return { user, theme };
};

export const actions: Actions = {
    theme: async ({ request, cookies }) => {
        const data = await request.formData();
        cookies.set('theme', data.get('theme') as string, {
            path: '/',
            httpOnly: true,
            expires: addYears(new Date(), 999)
        });
        return {};
    },

    update: async ({ request, cookies, locals }) => {
        const { database } = locals;
        const data = await request.formData();

        const user = await Api(locals).users.fromCookies(cookies);
        if (!user) throw error(404);

        let patch: { displayName?: string; hash?: string } = {};

        const displayName = data.get('display-name') as string;
        if (displayName.length > 0) {
            patch.displayName = displayName;
        }

        const password = data.get('password') as string;
        if (password.length > 0) {
            patch.hash = await hash(password, 10);
        }

        if (Object.keys(patch).length > 0) {
            await database.append(
                user.id,
                users.update({
                    id: user.id,
                    updateTime: new Date().getTime(),
                    ...patch
                })
            );
        }

        return {};
    }
};
