export { default as Card } from './Card.svelte';

import { useFilter, useSync } from '$lib/logux';
import { createSyncMap, syncMapTemplate } from '@logux/client';
import type { Filter, FilterOptions, Client } from '@logux/client';
import type { Item } from '@eligo/protocol';
import { nanoid } from 'nanoid';

const store = syncMapTemplate<Item>('items');

export const createItem = (client: Client, fields: Omit<Item, 'id'>) =>
	createSyncMap(client, store, {
		...fields,
		id: nanoid()
	});

export const useItems = (filter?: Filter<Item>, opts?: FilterOptions) =>
	useFilter<Item>(store, filter, opts);

export const useItem = (id: string) => useSync(store, id);
