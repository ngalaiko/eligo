import { useFilter } from '$lib/logux';
import { createSyncMap, syncMapTemplate } from '@logux/client';
import { derived } from 'svelte/store';
import type { Client } from '@logux/client';
import type { List } from '@picker/protocol';
import { nanoid } from 'nanoid';

const store = syncMapTemplate<List>('lists');

export const useLists = (client: Client) => useFilter(client, store);

export const createList = (client: Client, fields: Omit<List, 'id'>) =>
	createSyncMap(client, store, {
		...fields,
		id: nanoid()
	});

// todo: this works, but it doesn't work with filter provded into the useFilter function. need to figure out why
export const useList = (client: Client, { id }: { id: string }) =>
	derived(useFilter(client, store), (lists) => {
		if (!lists || lists.isLoading) return { isLoading: true };
		const list = lists.list.find((list) => list.id === id);
		if (!list) return { isLoading: false, isEmpty: true };
		return list;
	});
