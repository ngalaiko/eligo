import type { Actions, PageServerLoad } from './$types';
import { invalid, redirect } from '@sveltejs/kit';
import { compare } from 'bcrypt';
import { addDays } from 'date-fns';

export const load: PageServerLoad = async ({ url, parent }) => {
    const { user } = await parent();

    const redirectTo = url.searchParams.get('redirect') ?? '/lists/';
    if (user !== undefined) throw redirect(303, redirectTo);
};

export const actions: Actions = {
    default: async ({ request, cookies, locals, url }) => {
        const { database, tokens } = locals;

        const data = await request.formData();

        const username = data.get('username') as string;
        if (!username) return invalid(400, { error: 'username is required' });

        const password = data.get('password') as string;
        if (!password) return invalid(400, { error: 'username is required' });

        const user = await database.find('users', { name: username });
        if (!user) return invalid(400, { error: 'user does not exist' });

        const isPasswordCorrect = await compare(password, user.hash!);
        if (!isPasswordCorrect) return invalid(400, { error: 'password is invalid' });

        const token = await tokens.sign({ sub: user.id });
        cookies.set('token', token, {
            path: '/',
            httpOnly: true,
            expires: addDays(new Date(), 28)
        });

        throw redirect(303, url.searchParams.get('redirect') ?? '/lists/');
    }
};
