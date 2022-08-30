export { default as Button } from './Button.svelte';

import { useFilter } from '$lib/logux';
import { createSyncMap, syncMapTemplate, Client } from '@logux/client';
import type { Filter, FilterOptions } from '@logux/client';
import type { Boost } from '@eligo/protocol';
import { nanoid } from 'nanoid';

const store = syncMapTemplate<Boost>('boosts', {
	offline: true
});

export const createBoost = (client: Client, fields: Omit<Boost, 'id'>) =>
	createSyncMap(client, store, {
		...fields,
		id: nanoid()
	});

export const useBoosts = (filter?: Filter<Boost>, opts?: FilterOptions) =>
	useFilter<Boost>(store, filter, opts);
