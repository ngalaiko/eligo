<script lang="ts">
	import { useDistance } from '$lib/time';
	import { useUser, Card as UserCard } from '$lib/users';
	import type { List } from '@eligo/protocol';

	export let list: List & { id: string };
	const user = useUser(list.userId);
	const created = useDistance(list.createTime);
</script>

<div id={list.id}>
	<a href="/lists/{list.id}">{list.title}</a>
	{#if $user.isLoading}
		<span>loading...</span>
	{:else if $user.isLoading === false}
		<span>created by <UserCard user={$user} /></span>
		<span>{$created}</span>
	{/if}
</div>
