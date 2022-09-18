import { auth, send, state } from '$lib/api';
import { boosts } from '@eligo/state';
import { nanoid } from 'nanoid';
import { derived, get } from 'svelte/store';

export { default as Button } from './Button.svelte';

export const list = derived(state, (state) => Object.values(state.boosts));

export const create = (params: { listId: string; itemId: string }) =>
	send(
		boosts.create({
			...params,
			id: nanoid(),
			userId: get(auth).user.id,
			createTime: new Date().getTime()
		})
	);
