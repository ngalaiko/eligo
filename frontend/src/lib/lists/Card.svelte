<script lang="ts">
	import { Distance } from '$lib/time';
	import { useUser, Card as UserCard } from '$lib/users';
	import type { List } from '@eligo/protocol';

	export let list: List & { id: string };
	const user = useUser(list.userId);
</script>

<a
	id={list.id}
	href="/lists/{list.id}"
	class="border-2 border-black shadow-md flex flex-col gap-4 p-2 shadow-sm hover:shadow-lg hover:bg-yellow-50 text-ellipsis overflow-hidden"
>
	<div class="opacity-50 text-xs align-right">
		{#if $user.isLoading}
			<span>loading...</span>
		{:else if $user.isLoading === false}
			<span class="flex gap-1">
				<UserCard user={$user} />
				created
				<Distance to={list.createTime} />
			</span>
		{/if}
	</div>

	<h2 class="font-semibold text-lg whitespace-nowrap text-ellipsis overflow-hidden">
		{list.title}
	</h2>
</a>
