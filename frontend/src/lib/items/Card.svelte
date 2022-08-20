<script lang="ts">
	import { useUser, Card as UserCard } from '$lib/users';
	import type { Item } from '@eligo/protocol';
	import { useDistance } from '$lib/time';

	export let item: Item & { id: string };
	const user = useUser(item.userId);
	const created = useDistance(item.createTime);
	console.log(item);
</script>

<div id={item.id}>
	<span>{item.text}</span>
	{#if $user.isLoading}
		<span>loading...</span>
	{:else if $user.isLoading === false}
		<span>added by <UserCard user={$user} /></span>
		<span>{$created}</span>
	{/if}
</div>
