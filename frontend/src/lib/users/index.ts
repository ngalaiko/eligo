export { default as Single } from './Single.svelte';

import { auth, send, state } from '$lib/api';
import { users } from '@eligo/state';
import { derived, get } from 'svelte/store';

export const list = derived(state, (state) => Object.values(state.users));

export const update = (params: { displayName?: string }) =>
	send(
		users.update({
			...params,
			id: get(auth).user.id,
			updateTime: new Date().getTime()
		})
	);
