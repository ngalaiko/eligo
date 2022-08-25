<script lang="ts">
	import type { Pick } from '@eligo/protocol';
	import { useItem } from '$lib/items';
	import { Distance } from '$lib/time';
	import { useUser, Card as UserCard } from '$lib/users';

	export let pick: Pick & { id: string };
	$: item = pick.itemId ? useItem(pick.itemId) : undefined;
	const user = useUser(pick.userId);
</script>

<div id={pick.id} class="border-2 px-2 py-1 rounded-2xl">
	<span class="font-semibold whitespace-nowrap text-lg text-ellipsis overflow-hidden">
		{#if !item}
			picking...
		{:else if $item.isLoading === false}
			{$item.text}
		{/if}
	</span>

	<div class="flex gap-1 opacity-50 text-sm">
		picked
		<Distance to={pick.createTime} />
		{#if $user.isLoading === false}
			by <UserCard user={$user} />
		{/if}
	</div>
</div>
