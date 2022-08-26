<script lang="ts">
	import { compareDesc } from 'date-fns';
	import { useHistory } from '$lib/history';
	import { Distance } from '$lib/time';
	import { Single as User } from '$lib/users';
	import { Single as Item } from '$lib/items';

	export let listId: string;
	const entries = useHistory({ listId });
</script>

<ul class="grid grid-cols-1 gap-2">
	{#each $entries.sort((a, b) => compareDesc(a.time, b.time)) as entry}
		<li class="flex gap-1">
			<User userId={entry.userId} />
			{#if entry.type === 'picks/created'}
				<span>picked</span>
				<Item itemId={entry.itemId} />
			{:else if entry.type === 'memberships/created'}
				<span>joined</span>
			{:else if entry.type === 'items/created'}
				<span>added</span>
				<Item itemId={entry.itemId} />
			{/if}
			<Distance to={entry.time} />
		</li>
	{/each}
</ul>
