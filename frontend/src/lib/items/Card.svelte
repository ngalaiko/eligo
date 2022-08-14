<script lang="ts">
	import { useUser, Card as UserCard } from '$lib/users';
	import type { Item } from '@velit/protocol';
	import { useDistance } from '$lib/time';

	export let item: Item;
	const user = useUser(item.userId);
	const created = useDistance(item.createTime);
</script>

<div>
	{item.text}
	{#if $user.isLoading}
		loading...
	{:else if $user.isLoading === false}
		added by <UserCard user={$user} />
		{$created}
	{/if}
</div>
