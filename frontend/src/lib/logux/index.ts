export { default as Context } from './Context.svelte';

import context from './context';
import { derived, get, readable, type Readable } from 'svelte/store';

export const useClient = () => {
	const clientStore = context.get();
	if (!clientStore) throw new Error('Client is not set');
	const client = get(clientStore);
	if (!client) throw new Error('Client is not set');
	return client;
};

import { createAuth, createFilter, type SyncMapValue } from '@logux/client';
import type { SyncMapTemplate, Filter, FilterOptions } from '@logux/client';
import type { SyncMapValues } from '@logux/actions';

export const useFilter = <Value extends SyncMapValues>(
	Template: SyncMapTemplate<Value>,
	filter?: Filter<Value>,
	opts?: FilterOptions
): Readable<(Value & { id: string })[]> => {
	const instance = createFilter<Value>(useClient(), Template, filter, opts);
	return derived(
		readable(instance.get(), (set) => instance.listen(set)),
		(result) => (result.isLoading ? [] : result.list.filter((r) => r.isLoading === false))
	);
};

export const useSync = <Value extends SyncMapValues>(
	Template: SyncMapTemplate<Value>,
	id: string
): Readable<SyncMapValue<Value>> => {
	const store = Template(id, useClient());
	return readable(store.get(), (set) => store.listen(set));
};

export const useAuth = () => {
	const client = useClient();
	const auth = createAuth(client);
	return readable(auth.get(), (set) => auth.listen(set));
};
