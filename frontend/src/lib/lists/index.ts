export { default as Card } from './Card.svelte';
export { default as Form } from './Form.svelte';

import { auth, send, state } from '$lib/api';
import { lists } from '@eligo/state';
import { derived, get } from 'svelte/store';
import { nanoid } from 'nanoid';

export const update = (fields: {
	id: string;
	updateTime: EpochTimeStamp;
	invitatationId?: string | null;
}) => send(lists.update({ ...fields }));

export const create = (fields: { title: string }) =>
	send(
		lists.create({
			...fields,
			id: nanoid(),
			createTime: new Date().getTime(),
			userId: get(auth).user.id
		})
	);

export const list = derived(state, (state) => Object.values(state.lists));
