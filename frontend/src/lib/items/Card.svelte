<script lang="ts">
	import { useUser, Card as UserCard } from '$lib/users';
	import type { Item } from '@eligo/protocol';
	import { Distance } from '$lib/time';

	export let item: Item & { id: string };
	const user = useUser(item.userId);
</script>

<div
	id={item.id}
	class="border-2 border-black shadow-md flex flex-col gap-4 p-2 shadow-sm text-ellipsis overflow-hidden"
>
	<div class="opacity-50 text-xs align-right">
		{#if $user.isLoading}
			<span>loading...</span>
		{:else if $user.isLoading === false}
			<span class="flex gap-1">
				<UserCard user={$user} />
				added
				<Distance to={item.createTime} />
			</span>
		{/if}
	</div>

	<h3 class="font-semibold text-lg whitespace-nowrap text-ellipsis overflow-hidden">
		{item.text}
	</h3>
</div>
