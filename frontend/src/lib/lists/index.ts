export { default as Card } from './Card.svelte';
export { default as Form } from './Form.svelte';

import { useFilter, useSync } from '$lib/logux';
import { changeSyncMapById, Client, createSyncMap, syncMapTemplate } from '@logux/client';
import type { Filter, FilterOptions } from '@logux/client';
import type { List } from '@eligo/protocol';
import { nanoid } from 'nanoid';

const store = syncMapTemplate<List>('lists', {
	offline: true
});

export const useList = (id: string) => useSync(store, id);

export const useLists = (filter?: Filter<List>, opts?: FilterOptions) =>
	useFilter<List>(store, filter, opts);

export const updateList = (client: Client, id: string, diff: Partial<Omit<List, 'id'>>) =>
	changeSyncMapById(client, store, id, diff);

export const createList = (client: Client, fields: Omit<List, 'id'>) =>
	createSyncMap(client, store, {
		...fields,
		id: nanoid()
	});
