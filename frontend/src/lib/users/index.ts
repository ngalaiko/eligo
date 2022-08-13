import { useFilter } from '$lib/logux';
import { syncMapTemplate } from '@logux/client';
import type { Filter, FilterOptions } from '@logux/client';
import type { User } from '@velit/protocol';

const store = syncMapTemplate<User>('users');

export const useUsers = (filter?: Filter<User>, opts?: FilterOptions) =>
	useFilter<User>(store, filter, opts);

export const useUser = (id: string) => useUsers({ id });
