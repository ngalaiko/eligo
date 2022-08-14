<script lang="ts">
	import type { Roll } from '@velit/protocol';
	import { useItem } from '$lib/items';
	import { useUser, Card as UserCard } from '$lib/users';

	export let roll: Roll;
	const user = useUser(roll.userId);
	$: item = roll.itemId ? useItem(roll.itemId) : undefined;
</script>

<div>
	{#if $user.isLoading === false}
		<UserCard user={$user} /> rolled
	{/if}
	{#if !item}
		rolling...
	{:else if $item.isLoading === false}
		{$item.text}
	{/if}
</div>
