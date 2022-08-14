<script lang="ts">
	import type { Pick } from '@eligo/protocol';
	import { useItem } from '$lib/items';
	import { useUser, Card as UserCard } from '$lib/users';
	import { useDistance } from '$lib/time';

	export let pick: Pick;
	const user = useUser(pick.userId);
	$: item = pick.itemId ? useItem(pick.itemId) : undefined;
	const created = useDistance(pick.createTime);
</script>

<div>
	{#if $user.isLoading === false}
		<UserCard user={$user} /> picked
	{/if}
	{#if !item}
		picking...
	{:else if $item.isLoading === false}
		{$item.text}
		{$created}
		{pick.id}
	{/if}
</div>
