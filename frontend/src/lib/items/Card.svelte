<script lang="ts">
	import { useUser, Card as UserCard } from '$lib/users';
	import type { Item } from '@eligo/protocol';
	import { Distance } from '$lib/time';

	export let item: Item & { id: string };
	const user = useUser(item.userId);
</script>

<div id={item.id} class="border-2 px-2 py-1 rounded-2xl">
	<span class="font-semibold text-lg whitespace-nowrap text-ellipsis overflow-hidden">
		{item.text}
	</span>

	<div class="flex gap-1 opacity-50 text-sm">
		created
		<Distance to={item.createTime} />
		{#if $user.isLoading === false}
			by
			<UserCard user={$user} />
		{/if}
	</div>
</div>
