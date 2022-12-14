import type { Actions } from './$types';
import { addDays } from 'date-fns';
import { invalid, redirect } from '@sveltejs/kit';
import { hash } from 'bcrypt';
import { nanoid } from 'nanoid';
import { users } from '@eligo/state';

export const actions: Actions = {
	default: async ({ request, cookies, url, locals }) => {
		const { database, tokens } = locals;
		const data = await request.formData();

		const username = data.get('username') as string;
		if (!username) return invalid(400, { error: 'username is required' });

		const password = data.get('password') as string;
		if (!password) return invalid(400, { error: 'username is required' });

		const passwordRepeat = data.get('password-repeat');
		if (password !== passwordRepeat) return invalid(400, { error: 'passwords did not match' });

		const existing = await database.find('users', { name: username });
		if (existing) return invalid(400, { error: `${username} is taken` });

		const passwordHash = await hash(password, 10);
		const user = {
			id: nanoid(),
			name: username,
			hash: passwordHash,
			createTime: new Date().getTime()
		};

		await database.append(user.id, users.create(user));

		const token = await tokens.sign({ sub: user.id });
		cookies.set('token', token, {
			path: '/',
			httpOnly: true,
			expires: addDays(new Date(), 28)
		});

		throw redirect(303, url.searchParams.get('redirect') ?? '/lists/');
	}
};
