<script lang="ts">
	import { Single as User } from '$lib/users';
	import { Button as Boost } from '$lib/boosts';
	import type { Item } from '@eligo/protocol';
	import { Distance } from '$lib/time';
	import { delete as deleteItem } from '$lib/items';
	import DoubleClickButton from '$lib/components/DoubleClickButton.svelte';
	import { Edit } from './index';

	export let item: Item;
	export let chance: number;

	let isEditing = false;

	const onDeleteClicked = () => deleteItem({ id: item.id });
	const onStartEditClicked = () => (isEditing = true);
	const stopEditing = () => (isEditing = false);

	$: isDeleted = !!item.deleteTime;
	$: chancePercentage = (chance * 100).toFixed(0);
</script>

{#if isEditing}
	<Edit {item} on:close={stopEditing} />
{:else}
	<div
		id={item.id}
		class:opacity-50={isDeleted}
		class="border-2 px-2 py-1 rounded-2xl bg-gray-300"
		style:background="linear-gradient(90deg, var(--color-gray-300) {chancePercentage}%,
		var(--color-white) {chancePercentage}%)"
	>
		<div style:width="{chancePercentage}%" class="h-2 bg-500 relative" />
		<div class="font-semibold text-lg flex justify-between">
			<p class="overflow-ellipsis">{item.text}</p>
			<figure class="text-sm flex items-center gap-1">
				<figcaption>{(chance * 100).toFixed(2)}%</figcaption>
				<Boost itemId={item.id} listId={item.listId} />
			</figure>
		</div>

		<div class="flex gap-1 opacity-50 text-sm">
			{#if isDeleted}
				deleted
				<Distance to={item.deleteTime} />
			{:else}
				<User userId={item.userId} />
				created
				<Distance to={item.createTime} />
				|
				<span class="underline cursor-pointer" on:click={onStartEditClicked}>edit</span>
				|
				<DoubleClickButton on:click={onDeleteClicked}>delete</DoubleClickButton>
			{/if}
		</div>
	</div>
{/if}
