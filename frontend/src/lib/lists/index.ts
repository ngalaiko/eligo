export { default as Card } from './Card.svelte';

import { useFilter, useSync } from '$lib/logux';
import { Client, createSyncMap, syncMapTemplate } from '@logux/client';
import type { Filter, FilterOptions } from '@logux/client';
import type { List } from '@velit/protocol';
import { nanoid } from 'nanoid';

const store = syncMapTemplate<List>('lists');

export const useList = (id: string) => useSync(store, id);

export const useLists = (filter?: Filter<List>, opts?: FilterOptions) =>
	useFilter<List>(store, filter, opts);

export const createList = (client: Client, fields: Omit<List, 'id'>) =>
	createSyncMap(client, store, {
		...fields,
		id: nanoid()
	});
