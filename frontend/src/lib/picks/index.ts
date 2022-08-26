export { default as Card } from './Card.svelte';
export { default as List } from './List.svelte';
export { default as Button } from './Button.svelte';
export { default as Current } from './Current.svelte';

import { useFilter } from '$lib/logux';
import { createSyncMap, syncMapTemplate, Client } from '@logux/client';
import type { Filter, FilterOptions } from '@logux/client';
import type { Pick } from '@eligo/protocol';
import { nanoid } from 'nanoid';

const store = syncMapTemplate<Pick>('picks');

export const createPick = (client: Client, fields: Omit<Pick, 'id'>) =>
	createSyncMap(client, store, {
		...fields,
		id: nanoid()
	});

export const usePicks = (filter?: Filter<Pick>, opts?: FilterOptions) =>
	useFilter<Pick>(store, filter, opts);
