<script lang="ts">
	import { useAuth, useClient } from '$lib/logux';
	import { createItem } from '$lib/items';
	import IconPlus from '$lib/assets/IconPlus.svelte';

	export let listId: string;

	const client = useClient();
	const auth = useAuth();

	let text: string;

	const create = async () => {
		if (!text) return;
		if (!$auth.isAuthenticated) return;
		await createItem(client, {
			listId: listId,
			text,
			userId: $auth.userId,
			createTime: new Date().getTime()
		}).then(() => (text = ''));
	};
</script>

<form on:submit|preventDefault={create} class="flex gap-2 border-2 px-2 py-1 rounded-2xl">
	<IconPlus class="opacity-50" />
	<input type="submit" hidden />
	<input
		type="text"
		class="w-full focus:ring-none focus:outline-none"
		name="title"
		bind:value={text}
		placeholder="add item"
	/>
</form>
