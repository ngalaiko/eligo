<script lang="ts">
	import { Distance } from '$lib/time';
	import { useUser, Card as UserCard } from '$lib/users';
	import type { List } from '@eligo/protocol';

	export let list: List & { id: string };
	const user = useUser(list.userId);
</script>

<div id={list.id} class="border-2 px-2 py-1 rounded-2xl hover:bg-yellow-100">
	<span class="font-semibold whitespace-nowrap text-lg text-ellipsis overflow-hidden">
		{list.title}
	</span>

	<div class="flex gap-1 opacity-50 text-sm">
		created
		<Distance to={list.createTime} />
		{#if $user.isLoading === false}
			by <UserCard user={$user} />
		{/if}
	</div>
</div>
