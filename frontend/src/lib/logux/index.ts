export { default as Context } from './Context.svelte';

import context from './context';
import { get } from 'svelte/store';
export const useClient = () => {
	const clientStore = context.get();
	if (!clientStore) throw new Error('Client is not set');
	const client = get(clientStore);
	if (!client) throw new Error('Client is not set');
	return client;
};

import { createFilter } from '@logux/client';
import type { SyncMapTemplate, Filter, FilterOptions } from '@logux/client';
import type { SyncMapValues } from '@logux/actions';

export const useFilter = <Value extends SyncMapValues>(
	Template: SyncMapTemplate<Value>,
	filter?: Filter<Value>,
	opts?: FilterOptions
) => createFilter<Value>(useClient(), Template, filter, opts);
