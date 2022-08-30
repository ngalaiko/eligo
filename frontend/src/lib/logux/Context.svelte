<script lang="ts">
	import { onMount } from 'svelte';
	import { Client, createAuth, IndexedStore, log, type AuthStore } from '@logux/client';
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
	let auth: AuthStore;
	onMount(() => {
		client = new Client({
			server: wsHost,
			subprotocol,
			userId: localStorage.getItem('user-id') ?? 'anonymous',
			store: new IndexedStore()
		});
		auth = createAuth(client);

		ctx.set(client);
		markReady();

		if (dev) log(client);
		client.start();
		return () => client.destroy();
	});
</script>

{#await ready then}
	<slot {client} auth={auth.get()} />
{/await}
