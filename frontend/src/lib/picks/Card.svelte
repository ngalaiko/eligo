<script lang="ts">
	import type { Pick } from '@eligo/protocol';
	import { useItem } from '$lib/items';
	import { useUser, Card as UserCard } from '$lib/users';
	import { useDistance } from '$lib/time';

	export let pick: Pick & { id: string };
	const user = useUser(pick.userId);
	$: item = pick.itemId ? useItem(pick.itemId) : undefined;
	const created = useDistance(pick.createTime);
</script>

<div id={pick.id}>
	{#if $user.isLoading === false}
		<span><UserCard user={$user} /> picked</span>
	{/if}
	{#if !item}
		<span>picking...</span>
	{:else if $item.isLoading === false}
		<span>{$item.text}</span>
		<span>{$created}</span>
	{/if}
</div>
