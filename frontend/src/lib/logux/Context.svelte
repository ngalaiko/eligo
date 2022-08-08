<script lang="ts">
	import { onMount } from 'svelte';
	import { Client, log } from '@logux/client';
	import { subprotocol } from '@picker/protocol';
	import context from './context';
	import { writable } from 'svelte/store';

	const ctx = writable<Client | undefined>(undefined);
	context.set(ctx);

	let markReady: () => void;
	const ready = new Promise<void>((resolve) => {
		markReady = resolve;
	});

	onMount(() => {
		const client = new Client({
			subprotocol,
			server: 'ws://127.0.0.1:31337/',
			userId: 'anonymous',
			token: 'token'
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
