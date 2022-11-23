<script lang="ts">
	import { Distance } from '$lib/time';
	import { Single as User } from '$lib/users';
	import type { List } from '@eligo/protocol';
	import { delete as deleteList } from '$lib/lists';
	import DoubleClickButton from '$lib/components/DoubleClickButton.svelte';

	export let list: List;

	const onDeleteClicked = () => deleteList({ id: list.id });
</script>

<div id={list.id} class="border-2 px-2 py-1 rounded-2xl hover:bg-gray-100">
	<span class="font-semibold whitespace-nowrap text-lg text-ellipsis overflow-hidden">
		{list.title}
	</span>

	<span class="flex z-1 gap-1 opacity-50 text-sm">
		<User userId={list.userId} />
		created
		<Distance to={list.createTime} />
		|
		<DoubleClickButton on:click={onDeleteClicked}>delete</DoubleClickButton>
	</span>
</div>
