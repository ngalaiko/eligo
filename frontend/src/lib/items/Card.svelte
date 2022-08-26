<script lang="ts">
	import { useUser, Card as UserCard } from '$lib/users';
	import type { Item } from '@eligo/protocol';
	import { Distance } from '$lib/time';

	export let item: Item & { id: string };
	export let chance: number;
	const user = useUser(item.userId);
</script>

<div id={item.id} class="border-2 px-2 py-1 rounded-2xl">
	<span
		class="font-semibold text-lg whitespace-nowrap text-ellipsis overflow-hidden flex justify-between"
	>
		<p>{item.text}</p>
		<p>{(chance * 100).toFixed(0)}%</p>
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
