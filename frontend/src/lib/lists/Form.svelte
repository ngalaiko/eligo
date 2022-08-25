<script lang="ts">
	import IconPlus from '$lib/assets/IconPlus.svelte';

	import { createList } from '$lib/lists';
	import { useAuth, useClient } from '$lib/logux';
	const client = useClient();
	const auth = useAuth();

	let title: string = '';
	const create = async () => {
		if (!title) return;
		await createList(client, {
			title,
			userId: $auth.userId,
			createTime: new Date().getTime()
		}).then(() => (title = ''));
	};
</script>

<form on:submit|preventDefault={create} class="flex gap-2 border-2 px-2 py-1 rounded-2xl">
	<IconPlus class="opacity-50" />
	<input type="submit" hidden />
	<input
		type="text"
		class="w-full focus:ring-none focus:outline-none"
		name="title"
		bind:value={title}
		placeholder="add list"
	/>
</form>
