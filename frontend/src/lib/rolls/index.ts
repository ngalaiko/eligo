import { useFilter } from '$lib/logux';
import { createSyncMap, syncMapTemplate, Client } from '@logux/client';
import type { Filter, FilterOptions } from '@logux/client';
import type { Roll } from '@picker/protocol';
import { nanoid } from 'nanoid';

const store = syncMapTemplate<Roll>('rolls');

export const createRoll = (client: Client, fields: { listId: string }) =>
	createSyncMap(client, store, {
		...fields,
		id: nanoid()
	});

export const useRolls = (filter?: Filter<Roll>, opts?: FilterOptions) =>
	useFilter<Roll>(store, filter, opts);
