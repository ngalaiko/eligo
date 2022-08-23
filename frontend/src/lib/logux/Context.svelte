<script lang="ts">
	import { onMount } from 'svelte';
	import { Client, log } from '@logux/client';
	import { subprotocol } from '@eligo/protocol';
	import context from './context';
	import { writable } from 'svelte/store';
	import { session } from '$app/stores';
	import { wsHost } from '$lib/api';

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
			userId: $session.user?.id ?? 'anonymous',
			token: $session.token
		});

		ctx.set(client);
		markReady();

		log(client);
		client.start();
		return () => client.destroy();
	});
	session.subscribe((session) => {
		client?.changeUser(session.user?.id ?? 'anonymous', session.token);
	});
</script>

{#await ready then}
	<slot />
{/await}
