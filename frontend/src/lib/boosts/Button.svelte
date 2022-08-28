<script lang="ts">
	import IconArrowBigUpLine from '$lib/assets/IconArrowBigUpLine.svelte';
	import { createBoost } from '$lib/boosts';
	import { useAuth, useClient } from '$lib/logux';

	const client = useClient();
	const auth = useAuth();

	export let itemId: string;
	export let listId: string;

	const boost = async () => {
		await createBoost(client, {
			itemId,
			listId,
			userId: $auth.userId,
			createTime: new Date().getTime()
		});
	};
</script>

<button on:click|preventDefault={boost} class="items-center underline">
	<IconArrowBigUpLine />
</button>
