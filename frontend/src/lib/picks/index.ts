import { useFilter } from '$lib/logux';
import { createSyncMap, syncMapTemplate, Client } from '@logux/client';
import type { Filter, FilterOptions } from '@logux/client';
import type { Pick } from '@eligo/protocol';
import { nanoid } from 'nanoid';

const store = syncMapTemplate<Pick>('picks', {
	offline: true
});

export const createPick = (client: Client, fields: Omit<Pick, 'id'>) =>
	createSyncMap(client, store, {
		...fields,
		id: nanoid()
	});

export const usePicks = (filter?: Filter<Pick>, opts?: FilterOptions) =>
	useFilter<Pick>(store, filter, opts);
