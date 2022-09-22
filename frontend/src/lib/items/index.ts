import { auth, send, state } from '$lib/api';
import { items } from '@eligo/state';
import { nanoid } from 'nanoid';
import { derived, get } from 'svelte/store';

export { default as Card } from './Card.svelte';
export { default as Form } from './Form.svelte';
export { default as Single } from './Single.svelte';

export const list = derived(state, (state) => Object.values(state.items));

export const create = (params: { listId: string; text: string }) =>
	send(
		items.create({
			...params,
			id: nanoid(),
			userId: get(auth).user.id!,
			createTime: new Date().getTime()
		})
	);

const _delete = (params: { id: string }) =>
	send(items.delete({ ...params, deleteTime: new Date().getTime() }));

export { _delete as delete };
