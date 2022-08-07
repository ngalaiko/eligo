import { useFilter } from '$lib/logux';
import { syncMapTemplate } from '@logux/client';
import { derived } from 'svelte/store';
import type { Client } from '@logux/client';
import type { List } from '@picker/protocol';

export const store = syncMapTemplate<List>('lists');

export const useLists = (client: Client) => useFilter(client, store);

export const useList = (client: Client, { id }: { id: string }) =>
	derived(useFilter(client, store, { id }), (lists) =>
		lists && lists.list.length > 0 ? lists.list[0] : null
	);
