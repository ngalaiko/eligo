<script lang="ts">
	import { useDistance } from '$lib/time';
	import { useUser, Card as UserCard } from '$lib/users';
	import type { List } from '@eligo/protocol';

	export let list: List;
	const user = useUser(list.userId);
	const created = useDistance(list.createTime);
</script>

<div>
	<a href="/lists/{list.id}">{list.title}</a>
	{#if $user.isLoading}
		loading...
	{:else if $user.isLoading === false}
		created by <UserCard user={$user} />
		{$created}
	{/if}
</div>
