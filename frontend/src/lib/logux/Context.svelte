<script lang="ts">
	import { onMount } from 'svelte';
	import { Client, log } from '@logux/client';
	import { subprotocol } from '@picker/protocol';
	import context from './context';
	import { writable } from 'svelte/store';
	import { session } from '$app/stores';

	const ctx = writable<Client | undefined>(undefined);
	context.set(ctx);

	let markReady: () => void;
	const ready = new Promise<void>((resolve) => {
		markReady = resolve;
	});

	onMount(() => {
		const client = new Client({
			server: 'ws://127.0.0.1:31337/',
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
</script>

{#await ready then}
	<slot />
{/await}
