<script lang="ts">
	import { useLists, createList } from '$lib/lists';
	import { useClient } from '$lib/logux';
	import { session } from '$app/stores';
	import { Card as ListCard } from '$lib/lists';
	import { compareDesc } from 'date-fns';

	const client = useClient();
	const lists = useLists();

	let title: string = '';
	const create = async () => {
		if (!title) return;
		if (!$session.user) return;
		await createList(client, {
			title,
			userId: $session.user.id,
			createTime: new Date().getTime()
		}).then(() => (title = ''));
	};
</script>

{#if $lists.isLoading}
	loading...
{:else if $lists.isLoading === false}
	<ul class="grid grid-cols-3 gap-4">
		<li>
			<form
				on:submit|preventDefault={create}
				class="border-2 border-black flex flex-col p-2 justify-end h-full"
			>
				<button type="submit" hidden />
				<input type="text" name="title" bind:value={title} placeholder="new list..." />
			</form>
		</li>
		{#each $lists.list.sort((a, b) => compareDesc(a.createTime, b.createTime)) as list}
			{#if list.isLoading == false}
				<li><ListCard {list} /></li>
			{/if}
		{/each}
	</ul>
{/if}
