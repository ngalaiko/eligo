<script lang="ts">
	import { onMount } from 'svelte';
	import { Client, IndexedStore, log } from '@logux/client';
	import { subprotocol } from '@eligo/protocol';
	import context from './context';
	import { writable } from 'svelte/store';
	import { wsHost } from '$lib/api';
	import { dev } from '$app/env';

	const ctx = writable<Client | undefined>(undefined);
	context.set(ctx);

	let markReady: () => void;
	const ready = new Promise<void>((resolve) => {
		markReady = resolve;
	});

	let client: Client;
	onMount(() => {
		client = new Client({
			server: wsHost,
			subprotocol,
			userId: localStorage.getItem('user-id') ?? 'anonymous',
			store: new IndexedStore()
		});

		ctx.set(client);
		markReady();

		if (dev) log(client);
		client.start();
		return () => client.destroy();
	});
</script>

{#await ready then}
	<slot />
{/await}
