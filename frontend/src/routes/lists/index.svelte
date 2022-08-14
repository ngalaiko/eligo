<script lang="ts">
	import { useLists, createList } from '$lib/lists';
	import { useClient } from '$lib/logux';
	import { session } from '$app/stores';
	import { Card as ListCard } from '$lib/lists';
	import { compareAsc } from 'date-fns';

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
{:else}
	<form on:submit|preventDefault={create}>
		<input type="text" name="title" bind:value={title} />
		<button disabled={!title || !$session.user}>new list</button>
	</form>
	<ul>
		{#each $lists.list.sort((a, b) => compareAsc(a.createTime, b.createTime)) as list}
			<li><ListCard {list} /></li>
		{/each}
	</ul>
{/if}
