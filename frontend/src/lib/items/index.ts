import { useFilter } from '$lib/logux';
import { createSyncMap, syncMapTemplate } from '@logux/client';
import type { Client } from '@logux/client';
import type { Item } from '@picker/protocol';
import { derived } from 'svelte/store';
import { nanoid } from 'nanoid';

const store = syncMapTemplate<Item>('items');

export const createItem = (client: Client, fields: Omit<Item, 'id'>) =>
	createSyncMap(client, store, {
		...fields,
		id: nanoid()
	});

export const useItems = (client: Client, { listId }: { listId: string }) =>
	derived(useFilter(client, store), (lists) => {
		if (!lists || lists.isLoading) return { isLoading: true, list: [] };
		return {
			...lists,
			list: lists.list.filter((list) => list.listId === listId)
		};
	});
