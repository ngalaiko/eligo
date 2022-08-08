import type { Client } from '@logux/client';
import { getContext, setContext } from 'svelte';
import type { Readable } from 'svelte/store';

export default {
	get: (): Readable<Client | undefined> => getContext('logux-client'),
	set: (ctx: Readable<Client | undefined>) => setContext('logux-client', ctx)
};
