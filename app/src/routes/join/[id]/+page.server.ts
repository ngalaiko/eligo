import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { memberships } from '@eligo/state';
import { nanoid } from 'nanoid';

export const load: PageServerLoad = async ({ parent, params, locals }) =>
	parent().then(async ({ user }) => {
		const { database } = locals;
		if (!user) throw error(404);

		const list = await database.find('lists', { invitatationId: params.id });
		if (!list) throw error(404);

		const exists = await database.find('memberships', { listId: list.id, userId: user.id });
		if (!exists)
			await database.append(
				'membership',
				memberships.create({
					id: nanoid(),
					listId: list.id,
					userId: user.id,
					createTime: new Date().getTime()
				})
			);

		throw redirect(303, `/lists/${list.id}/pick/`);
	});
