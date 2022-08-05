<script lang="ts">
	import { CrossTabClient } from '@logux/client';
	import { onMount } from 'svelte';
	import { SUBPROTOCOL } from '@picker/protocol';
	onMount(() => {
		const client = new CrossTabClient({
			subprotocol: SUBPROTOCOL,
			server: 'ws://127.0.0.1:31337/',
			userId: '1',
			token: 'token'
		});

		client.start();
	});
</script>
