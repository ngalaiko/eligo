import { useFilter } from '$lib/logux';
import { createSyncMap, syncMapTemplate } from '@logux/client';
import type { Client } from '@logux/client';
import type { Roll } from '@picker/protocol';
import { derived } from 'svelte/store';
import { nanoid } from 'nanoid';

const store = syncMapTemplate<Roll>('rolls');

export const createRoll = (client: Client, fields: { listId: string }) =>
	createSyncMap(client, store, {
		...fields,
		itemId: undefined,
		id: nanoid()
	});

export const useRolls = (client: Client, { listId }: { listId: string }) =>
	derived(useFilter(client, store), (rolls) =>
		rolls
			? {
					...rolls,
					list: rolls.list.filter((list) => list.listId === listId)
			  }
			: { isLoading: true, list: [] }
	);
