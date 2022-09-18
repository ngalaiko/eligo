import { nanoid } from 'nanoid';
import { picks } from '@eligo/state';
import { derived, get } from 'svelte/store';
import { auth, send, state } from '$lib/api';

export const list = derived(state, (state) => Object.values(state.picks));

export const create = (params: { listId: string }) =>
	send(
		picks.create({
			...params,
			id: nanoid(),
			userId: get(auth).user.id!,
			createTime: new Date().getTime()
		})
	);
