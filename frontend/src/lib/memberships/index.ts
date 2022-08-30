export { default as InviteLink } from './InviteLink.svelte';

import {
	syncMapTemplate,
	createSyncMap,
	Client,
	type Filter,
	type FilterOptions
} from '@logux/client';
import type { Membership } from '@eligo/protocol';
import { nanoid } from 'nanoid';
import { useFilter } from '$lib/logux';

const store = syncMapTemplate<Membership>('memberships', {
	offline: true
});

export const useMemberships = (filter?: Filter<Membership>, opts?: FilterOptions) =>
	useFilter<Membership>(store, filter, opts);

export const createMembership = (client: Client, fields: Omit<Membership, 'id'>) =>
	createSyncMap(client, store, {
		...fields,
		id: nanoid()
	});
