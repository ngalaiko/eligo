<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { Client, log } from '@logux/client';
	import { subprotocol } from '@picker/protocol';
	import context from './context';

	const store = writable<Client | null>(undefined);
	context.set(store);

	onMount(() => {
		const client = new Client({
			subprotocol,
			server: 'ws://127.0.0.1:31337/',
			userId: 'anonymous',
			token: 'token'
		});
		store.set(client);
		log(client);
		client.start();
		return () => client.destroy();
	});
</script>

<slot />
