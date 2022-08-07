export { default as Context } from './Context.svelte';

import context from './context';
export const useClient = context.get;

import { readable } from 'svelte/store';
import { createFilter } from '@logux/client';
import type { SyncMapTemplate, Filter, FilterOptions } from '@logux/client';
import type { SyncMapValues } from '@logux/actions';
import type { Client } from '@logux/client';

export const useFilter = <Value extends SyncMapValues>(
	client: Client | null,
	Template: SyncMapTemplate<Value>,
	filter?: Filter<Value>,
	opts?: FilterOptions
) =>
	client ? createFilter(client, Template, filter, opts) : readable({ isLoading: true, list: [] });
