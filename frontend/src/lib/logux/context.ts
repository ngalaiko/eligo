import type { Client } from '@logux/client';
import type { Readable } from 'svelte/store';
import { getContext, setContext } from 'svelte';

export default {
	get: (): Readable<Client | null> => getContext('logux-client'),
	set: (ctx: Readable<Client | null>) => setContext('logux-client', ctx)
};
