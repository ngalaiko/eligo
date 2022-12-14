import Api from '$lib/server/api';
import { memberships } from '@eligo/state';
import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	delete: async ({ locals, cookies, params, url }) => {
		const { database } = locals;
		const api = Api(locals);

		const user = await api.users.fromCookies(cookies);
		if (!user) throw error(404);

		const membership = await database.find('memberships', {
			id: params.membershipId,
			userId: user.id
		});
		if (!memberships) throw error(404);

		const patch = { id: params.membershipId, deleteTime: new Date().getTime() };
		await database.append(user.id, memberships.delete(patch));

		const redirectTo = url.searchParams.get('redirect');
		if (redirectTo) throw redirect(303, redirectTo);

		return { ...membership, ...patch };
	}
};
