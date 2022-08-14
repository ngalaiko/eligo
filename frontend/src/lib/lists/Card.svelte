<script lang="ts">
	import { useUser, Card as UserCard } from '$lib/users';
	import type { List } from '@velit/protocol';
	export let list: List;
	const user = useUser(list.userId);
</script>

<div>
	<a href="/lists/{list.id}">{list.title}</a>
	{#if $user.isLoading}
		loading...
	{:else if $user.isLoading === false}
		created by <UserCard user={$user} />
	{/if}
</div>
